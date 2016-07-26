(function (Backbone, $) {
    var _ajax = Backbone.ajax;

    function onDone(model, status, resp) {
        var url = this.url || 'Unknown URL',
        method = this.type || 'Unknown Method';

        App.traceAjax(method, url, resp);
    }

    function onFail(resp) {
        var url = this.url || 'Unknown URL',
            method = this.type || 'Unknown Method';

        App.traceAjax(method, url, resp);
    };

    function refreshToken(deffered, success) {
        App.request('auth:refreshToken')
            .done(function (resp, code, tokenXhr) {
                onDone.call(this, resp, code, tokenXhr);
                success.call(this, App.request('auth:entity'));
            })
            .fail(function (response, status, errorCode) {
                // Произошла ошибка при обновлении токена,
                // пользователь был удален-изменен-итд. Запускаем логаут
                onFail.call(this, response, status, errorCode);
                App.error('Backbone.ajax', 'refreshToken fail, deferred reject, execute logout');

                if (!tryHandleException(response, deffered)) {
                    var loc = App.ErrorLocalizer.getModalText('errors', response);
                    var modal = new App.ErrorApp.Show.EndSession({
                        title: loc.title,
                        text: loc.text,
                        logouted: true
                    });
                    var wrapper = App.request('modal:wrapper', { contentView: modal });
                    App.modalRegion.show(wrapper);
                } else {
                    return;
                }

                deffered.reject(null);
                App.execute('auth:logout');
            });
    }

    function getErrorType(response, status, errorCode) {
        if (errorCode == 'abort') return;
        var code = App.responseCode(response);

        if (_.contains(App.tokenErrorCodes, code)) return { type: 'token' };
        if (_.contains(App.commonErrorCodes, code)) return { type: 'commonError' };
    }

    function handleError(resp) {
        App.warn('AJAX interceptor error handler; response: ', resp);
        var code = App.responseCode(resp);

        var loc = App.ErrorLocalizer.getModalText('errors', resp);

        App.execute('replace:main', {
            title: loc.title,
            text: loc.text
        });
    }

    function tryHandleException(response, deffered, options) {
        if (!response || !response.responseJSON) return false;
        var json = response.responseJSON;

        if (json.Type == "SecurityException") {
            response.handled = true;
            var code = json.Code;

            // Отображаем модальное окно с ошибкой
            var loc = App.ErrorLocalizer.getModalText('SecurityExceptions', response);
            var modal = new App.ErrorApp.Show.EndSession({
                title: loc.title,
                text: loc.text,
                logouted: true
            });
            var wrapper = App.request('modal:wrapper', { contentView: modal });
            App.modalRegion.show(wrapper);

            if (code == 'AccessDenied') {
                refreshToken(deffered, function (authEntity) {
                    /* TODO Martynov: Посмотреть методы App.mainRegionRoles и App.refreshMainRegion */
                    App.execute('main:page');
                });
            } else {
                // Выходим из системы
                App.execute('auth:logout', { noRequest: true });
            }

            return true;
        } else if (json.Type == "GetSessionException"
            || json.Type == "StsRefreshTokenExpiredException") {
            response.handled = true;

            // Отображаем модальное окно с ошибкой
            var loc = App.ErrorLocalizer.getModalText('CheckUserSessionExceptions', response);
            var modal = new App.ErrorApp.Show.EndSession({
                title: loc.title,
                text: loc.text,
                logouted: true
            });
            var wrapper = App.request('modal:wrapper', { contentView: modal });
            App.modalRegion.show(wrapper);

            // Выходим из системы
            App.execute('auth:logout', { noRequest: true });

            return true;
        }
    }

    Backbone.ajax = function (options) {
        if (options.crossDomain) {
            options.crossDomain = true;
        }

        // Некоторые AJAX запросы проходят без принудительной авторизации
        // Например JSON с глобализацией. Просто вызываем базовый AJAX
        if (options.auth === false) {
            App.log('Backbone.ajax', 'call without auth');
            return _ajax.call(this, options).done(onDone).fail(onFail);
        }

        // Удаляем обработчик ошибок, т.к. он не должен вызываться при первой же ошибке
        var error = options.error;
        delete options.error;

        // Если токена нет вообще(ни access, ни refresh) то переходим на страницу логина
        App.log('Backbone.ajax', 'check has:Token');
        if (!App.request('auth:hasToken')) {
            App.log('Backbone.ajax', 'hasToken false: reddirect to login page');
            return App.execute('auth:logout');
        }
        
        //TODO Gusarov Продумать общее событие
        if (options.isFileUpload) {
            options.pauseUpload(options);
        }

        // Создаем вложенный промис, т.к. будет создавать вложенные AJAX вызовы
        var dfd = $.Deferred(),
            promise = dfd.promise();

        // В переменную xhr сохраняем текущий XHR запрос за данными
        // xhrCanceled - признак отмены запроса
        var xhr,
            xhrCanceled = false;

        // Если текущий токен не устарел, то возврааем базовый AJAX
        App.log('Backbone.ajax', 'hasToken true');
        if (App.request('auth:hasValidToken')) {
            App.log('Backbone.ajax', 'hasValidToken true, setup ajax and continue (call parent method) with args: ', options);

            // по идее достаточно установить токен только после того как сходили за новым токеном и JQuery его закэширует
            // но этот метод позволяет на ходу изменять токен прямо в localStorage
            // Без нее все нормально работает, но если в LocalStorage изменить токен - это не изменит токен в кэше JQuery
            // Неоходимо для кейса, если в соседней вкладке входит другой пользователь
            App.request('auth:setupToken');

            //TODO Gusarov Продумать общее событие
            if (options.isFileUpload) {
                options.resumeUpload(options);
            }

            xhr = _ajax.call(this, options)
                .done(function (model, status, response) {
                    onDone.call(this, model, status, response);
                    //если происходит отправка файлов, то экранируем done с теми-же параметрами
                    if (options.isFileUpload) {
                        dfd.resolve(model, status, response);
                    } else {
                        //TODO Ftp Gusarov Возможно стоит привести к общему виду dfd.resolve(model, status, response);
                        dfd.resolve(response);
                    }
                })
                .fail(function (response, status, errorCode) {
                    onFail.call(this, response, status, errorCode);
                    if (options.noExceptHandler) return;
                    if (tryHandleException(response, dfd, options)) return;

                    var errorType = getErrorType(response, status, errorCode);

                    switch (errorType && errorType.type) {
                        // Ошибки связанные и истечением срока жизни текена, или с его инвалидацией
                        // пытаемся получить новый токен и повторить запрос
                        case 'token':
                            refreshToken(dfd, function () {
                                // Если вызвали метод abort() до того как начал грузиться XHR с данными
                                // догружием новый токен и выходим
                                if (xhrCanceled) return;

                                // Если все ок вызывает xhr с запросом к данным
                                xhr = _ajax.call(this, options)
                                    .done(function (model, status, response) {
                                        onDone.call(this, model, status, response);
                                        App.log('Backbone.ajax', 'parent method, deferred resolve');
                                        //если происходит отправка файлов, то экранируем done с теми-же параметрами
                                        if (options.isFileUpload) {
                                            dfd.resolve(model, status, response);
                                        } else {
                                            //TODO Ftp Gusarov Возможно стоит привести к общему виду dfd.resolve(model, status, response);
                                            dfd.resolve(response);
                                        }

                                    })
                                    .fail(function (response, status, errorCode) {
                                        onFail.call(this, response, status, errorCode);
                                        if (options.noExceptHandler) return;
                                        if (tryHandleException(response, dfd, options)) return;
                                        App.error('Backbone.ajax', 'parent method, fail, deferred reject');
                                        // Так как токен свежий, надо проверять только ошибки для показа сообщения или логаута
                                        dfd.reject(response);
                                        error(response);
                                        var err = getErrorType(response, status, errorCode);
                                        // Некоторые ошибки образабываем в общем хендлере
                                        if (err && err.type == 'commonError') handleError(response, status, errorCode);
                                    });
                            });
                            break;

                            // Общая обработка ошибок. Отображаем сообщение об ошибке
                            // напр: AccessDenied и тп
                        case 'commonError':
                            dfd.reject(response);
                            handleError(response, status, errorCode);
                            break;

                            // Делегируем обработку ошибки нижестоящим контроллерам
                        default:
                            dfd.reject(response);
                            error(response);
                            break;
                    }
                });

            promise.abort = function () { xhr.abort(); };
            return promise;
        } 

        // текущий access токен устарел, поэтому обновляем access токен и только после этого вызываем 
        // базовый AJAX-запрос
        App.warn('Backbone.ajax', 'hasValidToken false, refresh token');

        refreshToken(dfd, function () {
            // Если вызвали метод abort() до того как начал грузиться XHR с данными
            // догружием новый токен и выходим
            if (xhrCanceled) return;

            //TODO Gusarov Продумать общее событие
            if (options.isFileUpload) {
                options.resumeUpload(options);
            }

            // Если все ок вызывает xhr с запросом к данным
            xhr = _ajax.call(this, options)
                .done(function (model, status, response) {
                    onDone.call(this, model, status, response);
                    App.log('Backbone.ajax', 'parent method, deferred resolve');
                    //если происходит отправка файлов, то экранируем done с теми-же параметрами
                    if (options.isFileUpload) {
                        dfd.resolve(model, status, response);
                    } else {
                        //TODO Ftp Gusarov Возможно стоит привести к общему виду dfd.resolve(model, status, response);
                        dfd.resolve(response);
                    }
                })
                .fail(function (response, status, errorCode) {
                    onFail.call(this, response, status, errorCode);
                    if (options.noExceptHandler) return;
                    if (tryHandleException(response, dfd, options)) return;
                    App.error('Backbone.ajax', 'parent method, fail, deferred reject');
                    // Так как токен свежий, надо проверять только ошибки для показа сообщения или логаута
                    var err = getErrorType(response, status, errorCode);
                    dfd.reject(response);
                    error(response);
                    // Некоторые ошибки образабываем в общем хендлере
                    if (err && err.type == 'commonError') handleError(response, status, errorCode);
                });
        });

        promise.abort = function() {
            xhr && xhr.abort();
            xhrCanceled = true;
        };
        return promise;
    };
})(Backbone, jQuery || $);
