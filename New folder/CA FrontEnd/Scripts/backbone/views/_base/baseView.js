App.module("Views", function (Views, App, Backbone, Marionette, $, _) {

    // Методы доступные во всех Views
    _.extend(Marionette.View.prototype, {
        //Метод для загрузки файлов через POST форму с отправкой токена в hidden поле
        downloadFileFormPost: function (url, data, method, targetBlank) {
            if (!url || !data) return App.error('Error while file downloading!');

            // Создаем скрытые инпуты для каждого параметра
            var inputs = _.reduce(_.keys(data), function (prev, key) {
                var input = '<input type="hidden" name="' + key + '" value="' + encodeURIComponent(data[key]) + '" />';
                return prev + input;
            }, '');

            // Собираем DOM формы по частям, добавляем ее в body, сабмитим и сразу удаляем.
            //  Сабмит формы вызывает открытие нового окна браузера со скачиванием файла
            var generatedForm = $('<form action="' + url + '" method="' + (method || 'post') + '"' + (targetBlank ? ' target="_blank">' : '>') + '</form>');
            generatedForm.append($(inputs));
            
            generatedForm.appendTo('body').submit().remove();
        },

        refreshToken: function (success) {
            if (!App.request('auth:hasToken')) {
                App.log('downloadFile', 'hasToken false: reddirect to login page');
                App.execute('auth:logout');
                return;
            }

            var onDone = function (model, status, resp) {
                var url = this.url || 'Unknown URL',
                method = this.type || 'Unknown Method';

                App.traceAjax(method, url, resp);
            },
            onFail = function (resp) {
                var url = this.url || 'Unknown URL',
                    method = this.type || 'Unknown Method';

                App.traceAjax(method, url, resp);
            };

            //Сначала обновим токен
            if (App.request('auth:hasValidToken')) {
                App.log('downloadFile', 'hasValidToken true');
                success.call(this, true);
            } else {
                App.warn('downloadFile', 'hasValidToken false, refresh token');
                App.request('auth:refreshToken')
                    .done(function (resp, code, tokenXhr) {
                        onDone.call(this, resp, code, tokenXhr);
                        success.call(this, false);
                    })
                    .fail(function (response, status, errorCode) {
                        // Произошла ошибка при обновлении токена,
                        // пользователь был удален-изменен-итд. Запускаем логаут
                        onFail.call(this, response, status, errorCode);
                        App.error('downloadFile', 'refreshToken fail, deferred reject, execute logout');
                        App.execute('auth:logout');
                    });
            }
        },

        downloadFile: function (url, blank) {
            var formData = {
                AuthorizationToken: App.request('auth:entity').get("access_token")
            };

            this.downloadFileFormPost(url, formData, "post", true);
            //true - всегда открываем в новой вкладке, но после обновления токена будет происходить блокировка новой вкладки
            //blank - если после обновления токена, в избежании блокировки, необходимо начать загрузку в этой-же вкладке (но при возникновении ошибки загрузки файла на текущей вкладке произойдет переход на страницу с информацией об ошибке). 
        },

        // Общий обработчик клика по ссылке на скачивание
        downloadFileClick: function (e) {
            var self = this;
            var target = (e.toElement || e.relatedTarget || e.target),
                url = $(target).attr("data-href");

            this.refreshToken(function (tokenRefreshed) {
                self.downloadFile(url, tokenRefreshed);
            });
        }
    });    
});