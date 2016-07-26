App.module("Analytics", function (Analytics, App, Backbone, Marionette, $, _) {
    "use strict";

    Analytics.isEnable = function () {
        return ga && ga.loaded;
    }

    //отслеживания ролей пользователей 
    Analytics.setUserRole = function (userRole) {
        if (!Analytics.isEnable()) {
            return;
        }
        ga('set', 'dimension1', userRole);
        App.log('Analytics.setUserRole', userRole);
    };

    Analytics.getLocation = function (href) {
        var urlInformation = new RegExp([
            '^(https?:)//', // protocol
            '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
            '(/[^?#]*)', // path
            '(\\?[^#]*|)', // search
            '(#.*|)$' // hash
        ].join(''));
        var match = href.match(urlInformation);
        return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            path: match[5],
            search: match[6],
            hash: match[7]
        }
    }

    Analytics.addLanguageToUrl = function (href) {
        var location = Analytics.getLocation(href);
        var lang = App.request('settings:entity').get('language').value;
        if (location && location.path) {
            return '/' + lang + location.path;
        } else {
            return '/' + lang + href;
        }
        
    }

    Analytics.getCurrentUrl = function () {
        return Analytics.addLanguageToUrl(window.location.href);
    }

    Analytics.getLabelName = function (name) {
        return name.replace(/([A-Z])/g, ' $1').trim();
    }

    //Метод обрабатывает ответ с ошибкой и возвращает label для аналитики
    Analytics.getErrorCodeLabel = function (resp, category, action) {
        //App.log('Analytics.getErrorCodeLabel', {
        //    responseJSON: resp.responseJSON
        //});
        if (resp && resp.responseJSON && resp.responseJSON.Code) {
            var code = resp.responseJSON.Code.replace('Rule', '').trim();
            //Если "Unknown error" генерируем отдельное событие
            if (category && (
                code == "UnknownError"
                || code == "UnexpectedError"
                || code == "UnexpectedException"
                || code == "LinkNotExist"
                || code == "NotMainUser"
                || code == "UserNotFound"
                || code == "Failure")) {
                //Analytics.sendEvent('Sing in', 'Unknown error', 'Login', null, true);		                                Пользователь столкнулся с системным сбоем на этапе авторизации.
                //Analytics.sendEvent('Password recovery', 'Unknown error', 'Password recovery | Step 1', null, true);		Пользователь столкнулся с системным сбоем или ошибкой на этапе сброса пароля.
                //Analytics.sendEvent('Password recovery', 'Unknown error', 'Password recovery | Step 2 | Open', null, true);		Пользователь столкнулся с системным сбоем или ошибкой при восстановлении пароля на этапе перехода по ссылке, присланной по почте.
                //Analytics.sendEvent('Password recovery', 'Unknown error', 'Password recovery | Step 2', null, true);		Пользователь столкнулся с системным сбоем или ошибкой при восстановлении пароля на этапе сохранения нового пароля системой.
                //Analytics.sendEvent('Registration', 'Unknown error', 'Registration | Step 1', null, true);		        Пользователь столкнулся с системным сбоем или ошибкой на этапе регистрации, в процессе создания учетной записи (шаг 1).
                //Analytics.sendEvent('Registration', 'Unknown error', 'Registration | Step 2 | Open', null, true);		        Пользователь столкнулся с системным сбоем или ошибкой на этапе регистрации, в процессе активации учётной записи (шаг 2).
                //Analytics.sendEvent('Registration', 'Unknown error', 'Registration | Step 2', null, true);		        Пользователь столкнулся с системным сбоем или ошибкой на этапе регистрации, в процессе установки пароля (шаг 3).
                //Analytics.sendEvent('New request', 'Unknown error', 'Create request', null, true);		                Системная ошибка при создании запроса
                //Analytics.sendEvent('New request', 'Unknown error', 'All requests', null, true);		                    Системная ошибка при попытке отобразить пользователю доступные ему типы запросов. 
                //Analytics.sendEvent('New request', 'Unknown error', 'Request form', null, true);		                    Системная ошибка при отображении формы запроса для пользователя
                //Analytics.sendEvent('New request', 'Unknown error', 'File agreement status', null, true);	                CA не может получить информацию о принятии пользователем соглашения о загрузке файлов	
                //Analytics.sendEvent('Requests', 'Unknown error', 'Request list', null, true);		                        Системная ошибка при попытке просмотреть весь список запросов.
                //Analytics.sendEvent('Requests', 'Unknown error', 'Open request', null, true);		                        Системная ошибка при попытке получить информацию по запросу
                //Analytics.sendEvent('Requests', 'Unknown error', 'Close request', null, true);		                    Системная ошибка при попытке закрыть запрос
                //Analytics.sendEvent('Requests', 'Unknown error', 'Send answer', null, true);		                        Системная ошибка при добавлении записи в переписку
                //Analytics.sendEvent('License', 'Unknown error', 'Add license', null, true);		                        Ошибка при добавлении лицензии
                //Analytics.sendEvent('License', 'Unknown error', 'License list', null, true);		                        Неизвестный сбой при попытке получить информацию о лицензиях в CSS
                //Analytics.sendEvent('License', 'Unknown error', 'Application list', null, true);		                    Неизвестный сбой при попытке получить информацию о списке совместимых приложений
                //Analytics.sendEvent('License', 'Unknown error', 'Delete license', null, true);		                    Неизвестный сбой при попытке удалить лицензию.
                //Analytics.sendEvent('Contracts', 'Unknown error', 'Contracts list', null, true);		                    Сбой при попытке получить информацию о договорах
                //Analytics.sendEvent('Manage users', 'Unknown error', 'User list', null, true);		                    Ошибка при получении списка пользователей 
                //Analytics.sendEvent('Profile', 'Unknown error', 'Open profile', null, true);		                        Сбой при получении данных пользователя на этапе его перехода в свой профиль
                //Analytics.sendEvent('Profile', 'Unknown error', 'File agreement', null, true);		                    Сбой при получении данных о принятии пользователем соглашения
                //Analytics.sendEvent('Profile', 'Unknown error', 'Company delete', null, true);		                    Ошибка при деактивации компании
                //Analytics.sendEvent('Profile', 'Unknown error', 'Delete profile', null, true);		                    Сбой при удалении учетной записи пользователя
                //Analytics.sendEvent('Manage users', 'Unknown error', 'User profile', null, true);		                    Ошибка при просмотре или изменении любых данных другого пользователя. 
                //Analytics.sendEvent('Manage users', 'Unknown error', 'Delete user', null, true);		                    Ошибка при удалении учетной записи другого пользователя.
                Analytics.sendEvent(category, 'Unknown error', action, null, true);
                return null;
            }
            return Analytics.getLabelName(code);
        } 
        return null;
    }

    //Метод обрабатывает ошибки валидации и возвращает массив labels для аналитики
    Analytics.getValidationErrorLabels = function (model, errors) {
        //App.log('Analytics.getValidationErrorLabels', {
        //    model: model,
        //    errors: errors
        //});
        var labels = _.map(Object.keys(errors), function (key) {
            var rules = model.validation[key];
            var serverRule = model._ServerValidationResultForAnalytics[key];

            var label = Analytics.getLabelName(key);
            
            if (serverRule) {
                var ruleLabel = serverRule.name.replace('Rule', '');
                if (ruleLabel && ruleLabel !== key) {
                    var error = Analytics.getLabelName(ruleLabel).replace(label, '').trim();
                    label = label + " " + error;
                }
            } else {
                if (rules) {
                    _.each(rules, function(rule) {
                        if (typeof rule !== "function" && rule.msg === errors[key]) {
                            var ruleKeys = Object.keys(rule);
                            var ruleKey = ruleKeys[0].replace('Rule', '');
                            if (ruleKeys && ruleKey !== key) {
                                var error = Analytics.getLabelName(ruleKey).replace(label, '').trim();
                                label = label + " " + error;
                            }
                        }
                    });
                }
            }
            return label;
        });
        if (labels) {
            return labels;
        }
        return ['UI GA Parse Validation Error'];
    }
    
    //category– строковая переменная – категория отслеживаемых событий
    //action– строковая переменная - действие, тип взаимодействия пользователя и события
    //label – строковая переменная - ярлык, позволяющий отслеживать дополнительную информацию.
    //value – число, обозначающее ценность события, всегда положительное. 
    //nonInteraction – логическая переменная, которая определяет, будет ли влиять выполнение данного события на показатель отказов. 
    Analytics.sendEvent = function (category, action, label, value, nonInteraction, hitCallback) {
        if (!Analytics.isEnable()) {
            if (hitCallback && typeof hitCallback === "function") {
                hitCallback();
            }
            return;
        }

        ga('send', 'event', category, action, label, {
            //https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference?hl=ru#hitCallback
            //Обратный вызов выполняется всегда – как после успешной отправки обращения, так и тогда, когда передать обращение оказалось невозможно или не удалось.
            'hitCallback': hitCallback,
            //https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference?hl=ru#nonInteraction
            'nonInteraction': nonInteraction ? nonInteraction : false
        });

        App.log('Analytics.sendEvent', {
            category: category,
            action: action,
            label: label,
            value: value,
            nonInteraction: nonInteraction
        });
    };

    //Отправка данных о виртуальных просмотрах страниц в Google Analytics
    Analytics.pageView = function (page, title) {
        if (!Analytics.isEnable()) {
            return;
        }

        if (!page) {
            page = Analytics.getCurrentUrl();
        } else {
            page = Analytics.addLanguageToUrl(page);
        }

        ga('send', 'pageview', { 'page': page, 'title': title });

        App.log('Analytics.pageView', {
            page: page,
            title: title
        });
    };


    ////////////////////////////////////
    //2.3.1	Авторизация пользователей
    ////////////////////////////////////

    //App.Analytics.signInEvent('Initiate', null, true)                       //Пользователь начал вводить изменения в одной из полей формы авторизации.
    //App.Analytics.signInEvent('Try', 'Remember me', true)                   // * Всё клики по кнопке «Войти». Пользователь отметил галочкой поле «Remember me»
    //App.Analytics.signInEvent('Try', 'Do not remember me', true)            // * Всё клики по кнопке «Войти». Пользователь не отметил галочкой поле «Remember me»
    //App.Analytics.signInEvent('Success', 'Remember me', false)              // * Успешный вход в Company account с использованием логина и пароля. Пользователь отметил галочкой поле «Remember me»
    //App.Analytics.signInEvent('Success', 'Do not remember me', false)        // * Успешный вход в Company account с использованием логина и пароля. Пользователь отметил галочкой поле «Remember me»
    //*В случае если функциональность “Remember me” не будет реализована, в Google Analytics нужно будет отправлять события, в которых она не указана: 'Initiate' и 'Success'
    Analytics.signInEvent = function (action, label, nonInteraction) {
        Analytics.sendEvent('Sign in', 'Login | ' + action, label, null, nonInteraction);
    };

    //Ошибки при авторизации пользователей:
    //Captcha Incorrect                     Пользователь указал неверный ответ на текст Captcha или не ввел его.
    //Wrong Password                        Пользователь ввёл неверный пароль.
    //Captcha Timeout                       Срок действия Captcha закончился
    //Captcha Required                      Не введена captcha	
    //TempBlocking	                        Пользователь ввёл неверный пароль слишком много раз. Учётная запись заблокирована.
    //TempBlocking	                        Аутентификация успешная. Логин временно заблокирован. 
    //Wrong Password	                    Аутентификация безуспешна. Логин не найден
    //Not Activated	                        Аутентификация безуспешна. Пользователь не прошел процесс активации
    //Not Supported System Type	            Пользователь не принадлежит СompanyАccount
    //Not Supported Company Category	    Категория компании не поддерживается
    //Is Support Stuff	                    Сотудникам технической поддержки вход запрещен
    //Exceeded User Session Count	        Слишком много активных сессий для этого пользователя
    //Admin Blocked	                        Учётная запись заблокирована администратором
    //Password Expired	                    Пароль пользователя истек CompanyAccount просит пользователя указать новый пароль.
    Analytics.signInError = function (resp, error) {
        var errorLabel;
        if (error) {
            errorLabel = error;
        } else {
            errorLabel = Analytics.getErrorCodeLabel(resp, 'Sign in', 'Login');
        }
        if (errorLabel) {
            Analytics.sendEvent('Sign in', 'Login | Error', errorLabel, null, true);
        }
    };

    Analytics.signInValidationError = function (model, errors) {
        Analytics.sendEvent('Sign in', 'Login | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };

    ////////////////////////////////////
    //2.3.2	Регистрация пользователей
    ////////////////////////////////////

    //Шаг 1 | Step 1
    //App.Analytics.registrationStep1Event('Open')                      //Всё клики по ссылке «Создать». 
    //App.Analytics.registrationStep1Event('Initiate')                  //Первое взаимодействие с одним из полей формы
    //App.Analytics.registrationStep1Event('Try')                       //Все клики по кнопке «Создать аккаунт»
    //App.Analytics.registrationStep1Event('Success', 'Activation code') //Пользователь заполняет все обязательные поля формы, нажимает кнопку «Create Kaspersky Account» и получает сообщение о необходимости подтверждения своего email адреса. При этом пользователь ввел код активации.
    //App.Analytics.registrationStep1Event('Success', 'Key file')        //Пользователь заполняет все обязательные поля формы, нажимает кнопку «Create Kaspersky Account» и получает сообщение о необходимости подтверждения своего email адреса. При этом пользователь добавил файл ключа.
    Analytics.registrationStep1Event = function (action, label) {
        Analytics.sendEvent('Registration', 'Registration | Step 1 | ' + action, label, null, true);
    };
    
    //В процессе регистрации пользователю высветились ошибки (см детализацию):
    //First Name Required         //Пользователь не заполнил поле «Имя»
    //Last Name Required          //Пользователь не заполнил поле «Фамилия»
    //Company Required            //Пользователь не заполнил поле «Компания»	
    //Email Required              //Пользователь не заполнил поле «Email»	
    //Activation Code             //Пользователь не прикрепил файл ключа и не указал код активации	
    //Activation Code             //Код активации указан в неверном формате	
    //Key File                    //Формат файла не соответствует формату файла ключа.	
    //Captcha Required            //Не введена или неверно введена captcha	
    //First Name Max Byte Length  //Пользователю высветилась ошибка о слишком длинном имени	
    //Last Name Max Byte Length   //Пользователю высветилась ошибка о слишком длинной фамилии	
    //Company Max Length          //Пользователю высветилась ошибка о слишком длинном названии компании	
    //Email                       //Пользователь указал email в неверном формате.
    //Email Failure User Exist    //Email уже активирован
    //Email Repeated Registration //Email уже существует, но еще не активирован
    Analytics.registrationStep1Error = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Registration', 'Registration | Step 1');
        if (error) {
            Analytics.sendEvent('Registration', 'Registration | Step 1 | Error', error, null, false);
        }
    };

    Analytics.registrationStep1ValidationError = function (model, errors) {
        //В поле 'Error type' должно притягиваться название всех появившихся ошибок, разделенных знаком |
        Analytics.sendEvent('Registration', 'Registration | Step 1 | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };


    ////////////////////////////////////
    //2.3.3	Восстановление пароля
    ////////////////////////////////////

    //App.Analytics.passwordRecoveryStep1Event('Open', true)        Всё клики по ссылке «Forgot your password». 	
    //App.Analytics.passwordRecoveryStep1Event('Initiate', true)    Пользователь начал вносить изменения в одно из полей формы восстановления пароля
    //App.Analytics.passwordRecoveryStep1Event('Try', true)         Все клики по кнопке продолжить	
    //App.Analytics.passwordRecoveryStep1Event('Success', false)    Пользователь заполняет все обязательные поля формы, нажимает кнопку «продолжить» и получает сообщение о необходимости подтверждения своего email адреса.	
    Analytics.passwordRecoveryStep1Event = function (action, nonInteraction) {
        Analytics.sendEvent('Password recovery', 'Password recovery | Step 1 | ' + action, null, null, nonInteraction);
    };

    //Email Required            Пользователь не заполнил поле «Email»	
    //Captcha Incorrect         Не введена или неверно введена captcha	
    //Email                     format' Пользователь указал email в неверном формате	
    //User Not Found            Email (учетная запись) не найден.	
    //User Not Of C A           Учетная запись, связанная с указанным email-адресом, не является учетной записью пользователя CompanyAccount 	
    //User Not Activated        Email еще не активирован	
    Analytics.passwordRecoveryStep1Error = function (resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, 'Password recovery', 'Password recovery | Step 1');
        if (errorLabel) {
            Analytics.sendEvent('Password recovery', 'Password recovery | Step 1 | Error', errorLabel, null, true);
        }
    };

    Analytics.passwordRecoveryStep1ValidationError = function (model, errors) {
        //В поле 'Error type' должно притягиваться название всех появившихся ошибок, разделенных знаком |
        Analytics.sendEvent('Password recovery', 'Password recovery | Step 1 | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, true);
    };

    //////////////////////////////////////
    //2.3.2	Регистрация пользователей
    //2.3.3	Восстановление пароля
    //////////////////////////////////////

    //Шаг 1 | Step 2
    //App.Analytics.changePasswordStep2Event('Registration', 'Open', true)                      После перехода на сайт открыта форма подтверждения пароля
    //App.Analytics.changePasswordStep2Event('Registration', 'Initiate', true)                  Пользователь вносит изменение в одно из полей формы подтверждения пароля
    //App.Analytics.changePasswordStep2Event('Registration', 'Try', true)                       Все клики по кнопке «Создать аккаунт»
    //App.Analytics.changePasswordStep2Event('Registration', 'Success', false)                  Company Account выполняет Login пользователя после того, как тот указал и подтвердил пароль для учетной записи.
    //App.Analytics.changePasswordStep2Event('Registration', 'Success Need Captcha', false)     Company Account выполняет Login, но если на форме есть каптча, то не пытаемся войти, дальше уже пользователь бужет работать с формой и аналитикой "SignIn"

    //App.Analytics.changePasswordStep2Event('Password recovery', 'Open', true)                 После перехода на сайт открыта форма подтверждения пароля	
    //App.Analytics.changePasswordStep2Event('Password recovery', 'Initiate', true)             Пользователь начал вносить изменения в одно из полей формы подтверждения пароля 	
    //App.Analytics.changePasswordStep2Event('Password recovery', 'Try', true)                  Все клики по кнопке «Установить пароль»	
    //App.Analytics.changePasswordStep2Event('Password recovery', 'Success', false)             Company Account выполняет Login пользователя после того, как тот указал и подтвердил новый пароль для учетной записи.
    //App.Analytics.changePasswordStep2Event('Password recovery', 'Success Need Captcha', false) Company Account выполняет Login, но если на форме есть каптча, то не пытаемся войти, дальше уже пользователь бужет работать с формой и аналитикой "SignIn"
    Analytics.changePasswordStep2Event = function (category, action, nonInteraction) {
        Analytics.sendEvent(category, category + ' | Step 2 | ' + action, null, null, nonInteraction);
    };

    //Пользователь столкнулся с системным сбоем или ошибкой при сбросе своего пароля на этапе перехода по ссылке, присланной по почте.
    Analytics.changePasswordOpenError = function (category, resp) {
        Analytics.sendEvent(category, 'Unknown error', category + ' | Step2 | Open', null, true);
    };
    
    //Детализация ошибок:
    //Link Expire                   Срок подтверждения учетной записи истек	"Срок действия ссылки истек"
    //Link Used                     Email уже активирован  "По данной ссылке уже была произведена смена пароля"
    //Admin Blocked                 Пользователь заблокирован администратором "Учетная запись заблокирована администратором"
    //Confirm Password              Заданные пользователем пароли не совпадают. "Пароль и подтверждение пароля не совпадают"
    //Password In Blacklist         Пароль присутствует в чёрном списке паролей "Введенный пароль небезопасен"
    //Password                      Пароль не удовлетворяет требованиям. "Пароль не удовлетворяет требованиям"
    //Has Active Sessions           В браузере есть хотя бы одна активная сессия любого пользователя СА
    //"Password Required"           "Обязательное поле"
    //"ConfirmPassword Required"    "Обязательное поле"
    //"Password Min Length Rule"    "Пароль слишком короткий"
    //"Password Simple Password"    "Пароль не удовлетворяет требованиям"
    //"Password Match"              "Данный пароль уже использовался ранее"
    //"Temp Blocking"               "Пользователь временно заблокирован"
    //"User Not Found"              "Учетная запись не найдена"
    //"Link Not Exist"              "Ссылка не найдена"
    //"Duplicated Records"          "Произошел неизвестный сбой"
    //"Not Supported System Type"   "SystemType не поддерживается"
    //"User Not Of C A"             "Учетная запись не принадлежит CompanyAccount"
    //"User Not Activated"          "Учетная запись пользователя не активирована"
    //"User Not Enabled"            "Учетная запись пользователя не активирована"

    //App.Analytics.changePasswordStep2Error('Registration', resp, error)
    //App.Analytics.changePasswordStep2Error('Password recovery', resp, error)
    Analytics.changePasswordStep2Error = function (category, resp, error) {
        var errorLabel;
        if (error) {
            errorLabel = error;
        } else {
            errorLabel = Analytics.getErrorCodeLabel(resp, category, category + ' | Step 2');
        }
        if (errorLabel) {
            Analytics.sendEvent(category, category + ' | Step 2 | Error', errorLabel, null, false);
        }
    };

    //Отслеживание ошибок возникающих при автоматическом логине сразу после удачного установления пароля
    //App.Analytics.changePasswordStep2LoginError('Registration', resp)
    //App.Analytics.changePasswordStep2LoginError('Password recovery', resp)
    Analytics.changePasswordStep2LoginError = function (category, resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, category, category + ' | Step 2 | Login');
        if (errorLabel) {
            Analytics.sendEvent(category, category + ' | Step 2 | Login | Error', errorLabel, null, false);
        }
    };

    //App.Analytics.changePasswordStep2ValidationError('Registration', model, errors)
    //App.Analytics.changePasswordStep2ValidationError('Password recovery', model, errors)
    Analytics.changePasswordStep2ValidationError = function (category, model, errors) {
        //В поле 'Error type' должно притягиваться название всех появившихся ошибок, разделенных знаком |
        Analytics.sendEvent(category, category + ' | Step 2 | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };

    
    ////////////////////////////////////
    //2.4.1	Header
    ////////////////////////////////////

    //App.Analytics.headerClick('New request')      Пользователь кликнул по кнопке «Создать запрос».
    //App.Analytics.headerClick('Company logo')     Пользователь кликнул по логотипу компании. 
    //App.Analytics.headerClick('Requests')         Пользователь кликнул по логотипу компании. 	
    //App.Analytics.headerClick('Licenses')         Пользователь кликнул по кнопке «Лицензии».
    //App.Analytics.headerClick('Users')            Пользователь кликнул по кнопке «Пользователи».
    //App.Analytics.headerClick('Contracts')        Пользователь кликнул по кнопке «Документы».
    //App.Analytics.headerClick('Profile')          Пользователь кликнул по кнопке, ведущей к его профилю, например, «konstantin.vsevolodov@gmail.com», как на макете.
    //App.Analytics.headerClick('Sign out')         Пользователь кликнул по кнопке «Sign out».
    Analytics.headerClick = function (action) {
        //В поле label должен притянуться URL страницы, на которой в этот момент находится пользователь.
        Analytics.sendEvent('Header', action + ' | click', Analytics.getCurrentUrl(), null, false);

        //*ВАЖНО!!! Для ТА пользователей при клике по кнопке «Создать запрос» отправляется два события!
        if (action === 'New request' && App.AuthInfo.isTA()) {
            Analytics.sendEvent('New request', 'TA | Initiate', null, null, false); //Только для ТА пользователей!
        }
    };

    //Ошибка при изменении языка интерфейса
    Analytics.languageError = function () {
        Analytics.sendEvent('Header', 'Unknown error', 'Language', null, true);
    };

    ////////////////////////////////////
    //2.4.2	Footer
    ////////////////////////////////////

    //App.Analytics.footerClick('Logo') Пользователь кликнул по логотипу Kaspersky Lab. 
    //App.Analytics.footerClick('Support') Пользователь кликнул по ссылке «Служба поддержки». 
    //App.Analytics.footerClick('Contacts') Пользователь кликнул по ссылке «Контакты». 
    //App.Analytics.footerClick('Privacy policy') Пользователь кликнул по ссылке «Политика конфиденциальности». 
    //App.Analytics.footerClick('Legal') Пользователь кликнул по ссылке «Юридическая информация». 
    //App.Analytics.footerClick('Language') Пользователь кликнул по языковой ссылке или глобусу. 
    Analytics.footerClick = function (action, el) {
        //В поле label должен притянуться URL страницы, на которой в этот момент находится пользователь.
        Analytics.sendEvent('Footer', action + ' | click', Analytics.getCurrentUrl(), null, true,
            function () {
                if (el && el.href) {
                    document.location = el.href;
                }
            });
    };

    //Пользователь кликнул по ссылке с названием языка во всплывающем окне.
    Analytics.footerLanguageSelectEvent = function (lang, callback) {
        //В поле label должен притянуться URL страницы, на которой в этот момент находится пользователь. 
        //В поле label также должен притягиваться выбранный язык
        //Например, при смене языка на немецкий во вкладке «Запросы» поле label должно принимать следующее значение: 'German | https://companyaccount.com/requests'
        Analytics.sendEvent('Footer', 'Language | select', lang + ' | ' + Analytics.getCurrentUrl(), null, true, callback);
    };

    ////////////////////////////////////
    //2.4.3	Broadcast
    ////////////////////////////////////

    //App.Analytics.broadcastEvent('View | Opened') Пользователю отобразился броадкаст в развернутом виде.
    //App.Analytics.broadcastEvent('View | Hidden') Пользователю отобразился броадкаст в свернутом виде.	
    //App.Analytics.broadcastEvent('Hide') Пользователь свернул броадкаст. 	
    //App.Analytics.broadcastEvent('Close') Пользователь кликнул по ссылке «Скрыть насовсем». 	
    //App.Analytics.broadcastEvent('Open') Пользователь развернул броадкаст.
    Analytics.broadcastEvent = function (action, broadcastTitle) {
        //В поле label должен притягиваться URL страницы, на которой в этот момент находится пользователь, а также заголовок текущего броадкаста.
        Analytics.sendEvent('Broadcast', action, broadcastTitle + " | " + Analytics.getCurrentUrl(), null, true);
    };

    //Пользователь кликнул по ссылке в броадкасте.
    Analytics.broadcastLinkClick = function (el, blank) {
        var broadcastTitle = $(el).closest('div.broadcast').find('.header').text();//TODO Analytics Подумать как получить заголовок из модели, т.к. сообщение синглтон
        //В поле label должен притягиваться URL ссылки, по которой в этот момент перешел пользователь
        Analytics.sendEvent('Broadcast', 'Broadcast | Link | Click', broadcastTitle + " | " + el.href, null, true,
            function () {
                var target = $(el).attr("target");
                //если открываем не в новой вкладке, то дожидаемся отправки аналитики, а затем переходим по ссылке
                if (target != "_blank" && el && el.href) {
                    document.location = el.href;
                }
            });
    };

    ////////////////////////////////////
    //2.5	Создание запросов 
    ////////////////////////////////////

    Analytics.getRequestType = function (model) {
        if (model && model.analyticsRequestType) {
            return model.analyticsRequestType;
        }
        return null;
    };

    //2.5.1	Выбор категории запроса
    Analytics.newRequestPick = function (action) {
        var request;
        switch (action) {
            case "request:create:support":
                request = 'Tech Support';
                break;
            case 'request:create:support-ta':
                request = 'TA';
                break;
            case 'request:create:support-msa':
                request = 'MSA';
                break;
            case 'request:create:virlab':
                request = 'VirLab';
                break;
            case 'request:create:virlab-msa':
                request = 'MSA';
                break;
            case 'request:create:csr':
                request = 'CSR';
                break;
        }
        if (request) {
            Analytics.sendEvent('New request', request + ' | Pick', null, null, true);
        }
    };

    //2.5.2	Обычный запрос: отправка формы запроса в техподдержку
    //2.5.3	MSA запрос: отправка формы запроса в техподдержку
    //2.5.4	TA запрос: отправка формы запроса в техподдержку: 
    //App.Analytics.newRequestEvent(model, 'Initiate')                    Пользователь начал вносить изменения в одной из полей формы создания запроса
    //App.Analytics.newRequestEvent(model, 'Try')                         Все клики по кнопке Отправить запрос	
    //App.Analytics.newRequestEvent(model, 'Cancel')                      Пользователь отменил создание запроса.
    //App.Analytics.newRequestEvent(model, 'Success', initiate)           Пользователь успешно отправил запрос в службу технической поддержки. 
    //App.Analytics.newRequestEvent(model, 'How-to | Product version')   Пользователь кликнул по ссылке «Как узнать версию продукта»	
    
    
    //2.5.5	VirLab: отправка формы запроса в антивирусную лабораторию
    //App.Analytics.newRequestEvent(model, 'Initiate')                  Пользователь начал вносить изменения в одной из полей формы создания запроса
    //App.Analytics.newRequestEvent(model, 'Try')                       Все клики по кнопке Отправить запрос
    //App.Analytics.newRequestEvent(model, 'Success', initiate)
    //TODO Analytics Маппинг по TypeId (В iniciate приходят уже локализованные строки, приходится мапить по TypeId)
    //{Id: "HTP000000001800", TypeName: "False alarm on a file"}                Тип запроса: ложное срабатывание на файл.
    //{Id: "HTP000000001803", TypeName: "Suspicious file"}                      Тип запроса: запрос на исследование файла.
    //{Id: "HTP000000001801", TypeName: "False alarm on website"}               Тип запроса: ложное срабатывание на сайт.
    //{Id: "HTP000000001804", TypeName: "Suspicious website"}                   Тип запроса: запрос на исследование сайта.
    //App.Analytics.newRequestEvent(model, 'Cancel')                            Пользователь отменил создание запроса.

    //2.5.6	CA вопрос: отправка формы с вопросом по Company Account
    //App.Analytics.newRequestEvent(model, 'Initiate')             Пользователь начал вносить изменения в одной из полей формы создания запроса
    //App.Analytics.newRequestEvent(model, 'Try')                  Все клики по кнопке Отправить запрос	
    //App.Analytics.newRequestEvent(model, 'Success', initiate)    Пользователь успешно отправил запрос по сервису Company Account.	
    //App.Analytics.newRequestEvent(model, 'Cancel')                Пользователь отменил создание запроса.	
    
    //2.6.2	Переписка по заведенному запросу
    //App.Analytics.requestEvent(model, 'Initiate')                             Пользователь кликнул по кнопке «Отправить сообщение»	
    //App.Analytics.requestEvent(model, 'Send answer | Success', initiate)      Пользователь успешно добавил ответ в переписку	
    //App.Analytics.requestEvent(model, 'Download file')                        Пользователь скачал файл из переписки

    //2.7	Подпись CSR
    //App.Analytics.requestEvent(model, 'Choose file')                               Пользователь кликнул по кнопке «Выбрать файл»
    //App.Analytics.requestEvent(model, 'Success')                                   Файл был успешно подписан системой.	
    //App.Analytics.requestEvent(model, 'Delete file')                               Пользователь удалил загруженный файл.	
    //App.Analytics.requestEvent(model, 'How-to | Create CSR')                       Пользователь кликнул по ссылке «Как создать CSR-файл»	
    //App.Analytics.requestEvent(model, 'How-to | Go to CSR article')                Пользователь кликнул по ссылке «Подробная инструкция» в pop-up окне.	

    Analytics.newRequestEvent = function (model, action, initiate) {
        var requestType = Analytics.getRequestType(model);
        var numberOfFilesAttached = null;
        var labels = [];

        var event = 'New request';
        if (requestType == 'Request | Send answer') {
            event = 'Requests';
        } else if (requestType == 'CSR') {
            requestType = requestType + ' | Sign file';
        }

        if (action === 'Success') {
            
            var attachedFiles = model.get('AttachedFiles');
            if (attachedFiles) {
                numberOfFilesAttached = attachedFiles.length;
            }

            if (requestType == "Tech Support" 
                || requestType == "TA" 
                || requestType == "MSA") {

                //В поле label должны притягиваться значения, указанные пользователем в полях Область защиты, Продукт, Версия продукта, Версия ОС (если была указана). 
                //Для сценария 'Success' событие будет выглядеть следующим образом: 
                //'For file servers | Kaspersky Anti-Virus 8.0 for Windows Servers Enterprise Edition | 8.1.0.923| Microsoft Windows Server 2008 Core'

                var productType = model.get('ProductType');
                if (productType) {
                    labels.push(productType.get('Name'));
                }

                var productId = model.get('ProductId');
                var products = initiate.get('Products');
                if (productId && products) {
                    var product = _.find(products, function (item) {
                        return item.Id === productId;
                    });
                    if (product) {
                        labels.push(product.Name);
                    }
                }
            
                var productVersion = model.get('ProductVersion');
                if (productVersion) {
                    labels.push(productVersion);
                }

                var oSVersion = model.get('OSVersion');
                if (oSVersion) {
                    labels.push(oSVersion);
                }
            } else if (requestType == "VirLab") {
                var typeId = model.get('TypeId');
                //TODO Analytics В iniciate приходят уже локализованные строки, приходится мапить по TypeId
                switch (typeId) {
                    case "HTP000000001800":
                        labels.push("False alarm on a file");
                        break;
                    case "HTP000000001801":
                        labels.push("False alarm on website");
                        break;
                    case "HTP000000001803":
                        labels.push("Suspicious file");
                        break;
                    case "HTP000000001804":
                        labels.push("Suspicious website");
                        break;
                    default:
                        labels.push("Unknown type");
                        break;
                }
                //var types = initiate.get('RequestTypes');
                //if (typeId && types) {
                //    var type = _.find(types, function (item) {
                //        return item.Id === typeId;
                //    });
                //    if (type) {
                //        labels.push(type.TypeName);
                //    }
                //}
            }
        }
        
        Analytics.sendEvent(event, requestType + ' | ' + action, labels.length ? labels.join(" | ") : null, numberOfFilesAttached, false);
    };

    //App.Analytics.fileAgreementsEvent(requestType, 'Accept file agreement')   Пользователь поставил галочку в поле «Я принимаю условия пользовательского соглашения», в случае, если он отправляет файл впервые.
    //App.Analytics.fileAgreementsEvent(requestType, 'Proceed to adding file')  Пользователь кликнул по ставшей активной кнопке «Продолжить», в случае, если он отправляет файл впервые.
    //App.Analytics.fileAgreementsEvent(requestType, 'Close file agreement')    Пользователь кликнул по кнопке «Закрыть», а не по активной кнопке «Продолжить» в окне пользовательского соглашения.
    Analytics.fileAgreementsEvent = function (requestType, action, category) {
        Analytics.sendEvent(category, (requestType ? (requestType + ' | ') : '') + action);
    };
    
    //CA не может получить информацию о принятии пользователем соглашения о загрузке файлов	
    Analytics.fileAgreementsError = function (resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, 'New request', 'File agreement status');
        if (errorLabel) {
            Analytics.sendEvent('New request', 'File agreement status | Error', errorLabel, null, true);
        }
    };
    
    //2.5.8	Переходы в созданный инцидент из pop-up-а
    Analytics.newRequestPopUpClick = function (model) {
        var requestType = Analytics.getRequestType(model);
        Analytics.sendEvent('New request', requestType + ' | Pop up', null, null, false);
    }

    //CA Question Errrors:
    //Summary Required                Было не заполнено или заполнено некорректно поле «Тема запроса». Пользователю высветилась ошибка или подсказка.	
    //Description Required            Было не заполнено или заполнено некорректно поле «Описание проблемы». Пользователю высветилась ошибка или подсказка.

    //VirLab Errrors:
    //Type Id Required                Было не заполнено или заполнено некорректно поле «Тип запроса». Пользователю высветилась ошибка или подсказка.	
    //Description Required            Было не заполнено или заполнено некорректно поле «Описание проблемы». Пользователю высветилась ошибка или подсказка.	
    //Notify Emails Multi             Пользователь ввел в поле «Отправлять оповещение об ответах на email» в некорректном формате. Высветилась ошибка.	

    //Support Errrors:
    //Product Id Required           Было не заполнено или заполнено некорректно поле «Продукт» при отправке обычного запроса в техподдержку. Пользователю высветилась ошибка или подсказка.	
    //Product Version Required      Было не заполнено или заполнено некорректно поле «Версия продукта» при отправке запроса в техподдержку. Пользователю высветилась ошибка или подсказка.	
    //Type                          Было не заполнено или заполнено некорректно поле «Тип запроса» при отправке запроса в техподдержку	
    //Type Id Required              Было не заполнено или заполнено некорректно поле «Подтип запроса» при отправке запроса в техподдержку. Пользователю высветилась ошибка или подсказка.	
    //Summary Required              Было не заполнено или заполнено некорректно поле «Тема запроса» при отправке обычного запроса в техподдержку. Пользователю высветилась ошибка или подсказка.	
    //Description Required          Было не заполнено или заполнено некорректно поле «Описание проблемы» при отправке обычного запроса в техподдержку. Пользователю высветилась ошибка или подсказка.	
    //Notify Emails Multi           Пользователь ввел в поле «Отправлять оповещение об ответах на email» в некорректном формате. Высветилась ошибка.	
    //Product Type                  Было не заполнено или заполнено некорректно поле «Область защиты» при отправке запроса в техподдержку. Пользователю высветилась ошибка или подсказка.	

    //Comment Errrors:
    //Text Required                 Пользователь не указал текст сообщения.

    //CSR:
    //Wrong File Format             Загруженный файл не соответствует требованиям по формату. Пользователю высветилась ошибка.	
    //Key File Http File Size       Загруженный файл не соответствует требованиям по размеру. Пользователю высветилась ошибка.

    Analytics.newRequestError = function (model, resp) {
        var requestType = Analytics.getRequestType(model);

        var event = 'New request';
        if (requestType == 'Request | Send answer') {
            event = 'Requests';
        } else if (requestType == 'CSR') {
            requestType = requestType + ' | Sign file';
        }

        var error = Analytics.getErrorCodeLabel(resp, event, requestType);
        if (error) {
            Analytics.sendEvent(event, requestType + ' | Error', error, null, true);
        }
    };

    Analytics.newRequestValidationError = function (model, errors) {
        var requestType = Analytics.getRequestType(model);

        var event = 'New request';
        if (requestType == 'Request | Send answer') {
            event = 'Requests';
        }

        Analytics.sendEvent(event, requestType + ' | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };
    
    //App.Analytics.newRequestAddFileEvent(requestType, 'Initiate')     Пользователь инициировал прикрепление файла к запросу (кликнул по ссылке «Добавить файл»)	
    //App.Analytics.newRequestAddFileEvent(requestType, 'Success')      Пользователь успешно прикрепил файл к запросу.	
    //App.Analytics.newRequestAddFileEvent(requestType, 'Delete file')  Пользователь удалил файл из списка.	
    Analytics.newRequestAddFileEvent = function (requestType, action) {

        var event = 'New request';
        if (requestType == 'Request | Send answer') {
            event = 'Requests';
        }
        Analytics.sendEvent(event, requestType + ' | Add file | ' + action);
    };
    
    //Storage File Size     Пользователь попытался прикрепить слишком большой по размеру файл. Ограничение на размер файла зависит от изначальной категории запроса.	
    Analytics.newRequestAddFileError = function (requestType, resp, errorMsg) {

        var event = 'New request';
        if (requestType == 'Comment') {
            requestType = 'Request | Send answer';
            event = 'Requests';
        }

        var error;
        if (resp) {
            error = Analytics.getErrorCodeLabel(resp);
        } else if (errorMsg) {
            if (errorMsg == Globalize.formatMessage('fileupload/errors/maxFileSize')) {
                error = 'Storage File Size';//'Too large file'
            }
        }
        if (error) {
            Analytics.sendEvent(event, requestType + ' | Error', error, null, true);
        }
    };

    //Ошибки при попытке отобразить пользователю доступные ему типы запросов. 
    Analytics.requestTypeListError = function (resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, 'New request', 'All requests');
        if (errorLabel) {
            Analytics.sendEvent('New request', 'Requests type list | Error', errorLabel, null, true);
        }
    };

    //Ошибки при отображении формы запроса для пользователя
    Analytics.requestFormError = function (resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, 'New request', 'Request form');
        if (errorLabel) {
            Analytics.sendEvent('New request', 'Request form | Error', errorLabel, null, true);
        }
    };

    
    //2.6.1	Работа со списком запросов/вкладкой «Запросы»
    //App.Analytics.requestEvent(model, 'Open')                     Пользователь открыл один из созданных запросов.
    //App.Analytics.requestEvent(null, 'Filter', 'Resolved')        Пользователь отфильтровал запрос по статусу «Решён»	
    //App.Analytics.requestEvent(null, 'Filter', 'In progress')     Пользователь отфильтровал запрос по статусу «В работе»	
    //App.Analytics.requestEvent(null, 'Filter', 'Your response needed') Пользователь отфильтровал запрос по статусу «Ожидает Вашего ответа»	
    //App.Analytics.requestEvent(null, 'Filter', 'Inactive')        Пользователь отфильтровал запрос по статусу «Не активный (закрытый)».	
    
    //2.6.2	Переписка по заведенному запросу
    //App.Analytics.requestEvent(model, 'Close request')            Пользователь закрыл запрос.	
    //App.Analytics.requestEvent(model, 'Answer | Open')            Пользователь кликнул по кнопке «Ответить»	
    //App.Analytics.requestEvent(model, 'Download file')            Пользователь скачал файл из переписки	
    //App.Analytics.requestEvent(model, 'Show messages | Click')    Пользователь кликнул по ссылке «Показать больше сообщений»	
    //App.Analytics.requestEvent(model, 'Hide messages | Click')    Пользователь кликнул по ссылке «Скрыть все сообщения»	
    Analytics.requestEvent = function(model, action, label) {
        var requestType = Analytics.getRequestType(model);
        var labels = [];

        if (label) {
            labels.push(label);
        }

        if (action == 'Open') {
            //должен подтягиваться статус запроса Resolved, In progress, Your response needed, Inactive 
            var status = model.get('UserfriendlyStatus');
            if (status) {
                action = action + ' | ' + status;
            }
            //label должен подтягиваться тип выбранного запроса из списка: Tech Support, MSA, TA, VirLab, CA Question, CSR, Complaint
            //* (будет подтягиваться локализованная версия)
            var type = model.get('Type');
            if (type) {
                labels.push(type);
            }
        }

        Analytics.sendEvent('Requests', (requestType ? (requestType + ' | ') : '') + action, labels.length ? labels.join(" | ") : null, null, false);
    }

    //Пользователь перешёл в свой профиль из переписки.	
    Analytics.requestOpenProfileEvent = function (el) {
        Analytics.sendEvent('Requests', 'Requests | Open profile', '', null, false,
            function () {
                //если открываем не в новой вкладке, то дожидаемся отправки аналитики, а затем переходим по ссылке
                if (el && el.href) {
                    document.location = el.href;
                }
            });
    }

    //Пользователь перешел на другую страницу списка запросов.
    Analytics.requestPageEvent = function (pageIndex) {
        //В label должен притягиваться номер страницы, на которую перешёл пользователь.
        Analytics.sendEvent('Requests', 'Requests | Page', pageIndex, null, false);
    }

    //Ошибки при попытке просмотреть весь список запросов.
    Analytics.requestListError = function (resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, 'Requests', 'Request list');
        if (errorLabel) {
            Analytics.sendEvent('Requests', 'Request list | Error', errorLabel, null, true);
        }
    };

    //Ошибки при попытке получить информацию по запросу
    Analytics.requestOpenError = function (resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, 'Requests', 'Open request');
        if (errorLabel) {
            Analytics.sendEvent('Requests', 'Open request | Error', errorLabel, null, true);
        }
    };

    //Ошибки при попытке закрыть запрос
    Analytics.requestCloseError = function (resp) {
        var errorLabel = Analytics.getErrorCodeLabel(resp, 'Requests', 'Close request');
        if (errorLabel) {
            Analytics.sendEvent('Requests', 'Close request | Error', errorLabel, null, true);
        }
    };
    
    ////////////////////////////////////
    //2.8.1	Прикрепление лицензии
    ////////////////////////////////////

    //App.Analytics.licenseAddEvent('Initiate | Code')      Пользователь начал вносить изменения в форму прикрепления лицензии.
    //App.Analytics.licenseAddEvent('Initiate | Key file')  Пользователь кликнул по кнопке загрузить файл и вызвал проводник.
    //App.Analytics.licenseAddEvent('Success| Code')        Пользователь успешно добавил код лицензии.
    //App.Analytics.licenseAddEvent('Success| Key file')    Пользователь успешно загрузил файл с ключом.
    Analytics.licenseAddEvent = function (action) {
        Analytics.sendEvent('Licenses', 'Add license | ' + action, null, null, true);
    };

    //Список ошибок и ошибок валидации при добавлении лицензии:
    //Key File                          формат предоставленного файла не соответствует формату файла ключа.
    //'Wrong activation code format'    формат предоставленного кода не соответствует формату активационного кода.
    //License Is Blocked                Лицензия заблокирована	
    //License Not Found                 Лицензия не найдена	
    //License Is Expired                Срок действия данной лицензии истек	
    //TODO Analytics 'License needs approve from KL' Не нашел этот код в СА
    //'License needs approve from KL'   Лицензия не прикреплена. Для прикрепления данной лицензии требуется подтверждение Лаборатории Касперского. В случае успеха мы отправим подтверждающее письмо на e-mail, указанный в вашем профиле.	
    //Consumer License                  Лицензия не прикреплена. Перед тем, как добавить лицензию продукта для домашних пользователей, прикрепите хотя бы одну корпоративную лицензию	
    //"Key File":                       "Неизвестный формат файла ключа"
    //"License Is Blocked":             "Ошибка! Лицензия заблокирована."
    //"License Not Found":              "Ошибка! Лицензия не найдена."
    //"License Is Expired":             "Срок действия данной лицензии истек."
    //"Consumer License":               "Лицензия не прикреплена. Перед тем, как добавить лицензию продукта для домашних пользователей, прикрепите хотя бы одну корпоративную лицензию."
    //"Activation Code Or File Required": "Требуется файл ключа или код активации"
    //"Activation Code":                "Некорректный формат кода активации"
    //"Key File Http File Size":        "Файл ключа слишком большой"
    //"Incorrect A C":                  "Ошибка! Формат предоставленного кода не соответствует формату активационного кода."
    //"Incorrect Key File":             "Ошибка! Формат предоставленного файла не соответствует формату файла ключа."
    //"Mult Lic Use Err":               "Ошибка! Лицензия уже используется другой компанией."
    //"Success User Moved":             "Лицензия успешно прикреплена! Ваша принадлежность к компании изменена. Чтобы изменения вступили в силу, необходимо повторно войти в CompanyAccount."
    //"License Already Exists":         "Такая лицензия уже прикреплена к вашей компании."
    //"A C Expired":                    "Срок действия данного активационного кода истек."
    //"Getting License Info Error":     "Ошибка! Лицензия не найдена."
    //"Unknown Error":                  "Произошла ошибка"

    //Ошибки при добавлении лицензии
    Analytics.licenseAddError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Licenses', 'Add license');
        if (error) {
            Analytics.sendEvent('Licenses', 'Add license | Error', error, null, true);
        }
    };

    //Ошибки валидации при добавлении лицензии
    Analytics.licenseAddValidationError = function (model, errors) {
        Analytics.sendEvent('Licenses', 'Add license | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };

    //Ошибки при попытке получить информацию о лицензиях в CSS
    Analytics.licenseListError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Licenses', 'License list');
        if (error) {
            Analytics.sendEvent('Licenses', 'License list | Error', error, null, true);
        }
    };

    //Ошибки при попытке получить информацию о списке совместимых приложений
    Analytics.licenseApplicationListError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Licenses', 'Application list');
        if (error) {
            Analytics.sendEvent('Licenses', 'Application list | Error', error, null, true);
        }
    };

    //Ошибки при попытке удалить лицензию.
    Analytics.licenseDeleteError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Licenses', 'Delete license');
        if (error) {
            Analytics.sendEvent('Licenses', 'Delete license | Error', error, null, true);
        }
    };

    ////////////////////////////////////
    //2.8.2	Работа с лицензиями
    ////////////////////////////////////

    //App.Analytics.licenseEvent('Filter', 'Valid')             Пользователь отфильтровал лицензии по типу «Активные»
    //App.Analytics.licenseEvent('Filter', 'Expired')           Пользователь отфильтровал лицензии по типу «Истекшие»	
    //App.Analytics.licenseEvent('Filter', 'Not Activated')     Пользователь отфильтровал лицензии по типу «Не активированные»
    //App.Analytics.licenseEvent('Filter', 'Blocked')           Пользователь отфильтровал лицензии по типу «Заблокированные»
    //App.Analytics.licenseEvent('Sort', 'Descending')          Пользователь отсортировал список лицензий в порядке убывания (в начале отображаются лицензии до истечения, которых осталось больше времени)
    //App.Analytics.licenseEvent('Sort', 'Ascending')           Пользователь отсортировал список лицензий в порядке возрастания (в начале отображаются лицензии до истечения, которых осталось меньше времени)
    //App.Analytics.licenseEvent('Show', 'License status')      Пользователь раскрывает подробную информацию о лицензии. В поле label (license status) должен притягиваться один из четырех статусов лицензии: Valid, Expired, Not Activated или Blocked.
    //App.Analytics.licenseEvent('Delete', 'License status')    Пользователь успешно удаляет лицензию. В поле label (license status) должен притягиваться один из четырех статусов лицензии: Valid, Expired, Not Activated или Blocked.
    //App.Analytics.licenseEvent('Application list')            Пользователь кликает по ссылке «Список совместимых приложений»
    //-App.Analytics.licenseEvent('%ProductName% KB') 
    //Пользователь кликнул по одной из ссылок в списке совместимых приложений. %ProductName% - это хвост URL в KB, который используется как идентификатор продукта. Например, kes10wks для http://support.kaspersky.ru/kes10wks
    Analytics.licenseEvent = function (action, label) {
        Analytics.sendEvent('Licenses', 'License | ' + action, label, null, true);
    };

    ////////////////////////////////////
    //2.9	Контракты
    ////////////////////////////////////

    //App.Analytics.contractsEvent('No contracts | View')       Пользователь зашел на страницу «Контракты», у него нет ни одного контракта.
    //App.Analytics.contractsEvent('Expired contracts | View')  Пользователь зашел на страницу «Контракты», у него есть только Истекшие контракты.
    //App.Analytics.contractsEvent('Active contracts | View')   Пользователь зашел на страницу «Контракты», у него есть хотя бы один действующий контракт.
    //App.Analytics.contractsEvent('Contract | Download')       Пользователь скачал контракт/договор.
    Analytics.contractsEvent = function (action, label) {
        Analytics.sendEvent('Contracts', action, label, null, true);
    };

    //Пользователь перешел на другую страницу списка договоров/контрактов.
    Analytics.contractsPageEvent = function (pageIndex) {
        //В label должен притягиваться номер страницы, на которую перешёл пользователь.
        Analytics.sendEvent('Contracts', 'Contract | Page', pageIndex, null, false);
    }

    //Ошибка при попытке получить информацию о договорах.
    Analytics.contractsError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Contracts', 'Contracts list');
        if (error) {
            Analytics.sendEvent('Contracts', 'Contracts list | Error', error, null, true);
        }
    };
    
    ////////////////////////////////////
    //2.10	Пользователи
    ////////////////////////////////////

    ////////////////////////////////////
    //2.10.1	Работа со списком пользователей
    ////////////////////////////////////
    //App.Analytics.usersEvent('User profile | Open')		    Пользователь открыл перешел в профиль одного из пользователей
    //App.Analytics.usersEvent('User | Sort', 'Surname')		Список пользователей был отсортирован по фамилиям
    //App.Analytics.usersEvent('User | Filter', 'Country')		Пользователь применил фильтр по странам.
    //App.Analytics.usersEvent('User | Filter', 'Filial')		Пользователь применил фильтр по филиалам.
    //App.Analytics.usersEvent('User | Page', 'Page number')	Пользователь перешел на другую страницу списка пользователей. 
    Analytics.usersEvent = function (action, label) {
        Analytics.sendEvent('Users', action, label, null, true);
    };

    //Пользователь перешел на другую страницу списка пользователей.
    Analytics.usersPageEvent = function (pageNumber) {
        //В label должен притягиваться номер страницы, на которую перешёл пользователь.
        Analytics.sendEvent('Users', 'User | Page', pageNumber, null, false);
    }

    //Ошибка при попытке получить информацию о пользователях.
    Analytics.usersError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Users', 'Manage users');
        if (error) {
            Analytics.sendEvent('Users', 'Manage users | Error', error, null, true);
        }
    };

    ////////////////////////////////////
    //2.10.2	Управление пользователями
    ////////////////////////////////////
    //App.Analytics.manageUserEvent('Permissions | Success')		                Права пользователя были успешно изменены.
    //App.Analytics.manageUserEvent('Reset password')		                        Пользователю была отправлена ссылка на сброс пароля.
    //App.Analytics.manageUserEvent('Delete user| Step 1')		                    Пользователь ставит галочку, подтверждая удаления и кликает по кнопке «Удалить пользователя»
    //App.Analytics.manageUserEvent('Delete user| Step 2')		                    Пользователь подтверждает удаление ещё раз, кликая по кнопке «Удалить» во всплывающем окне.
    Analytics.manageUserEvent = function (action, label) {
        Analytics.sendEvent('Users', 'Manage user | ' + action, label, null, true);
    };

    //Личные данные пользователя были успешно изменены
    Analytics.manageUserPersonalDataSuccessEvent = function (model) {
        var label;

        var sourceModel = new Backbone.Model(model.analyticsSourceModel);
        sourceModel.set(model.toJSON());

        var changedAttributes = sourceModel.changedAttributes();
        if (changedAttributes) {
            var changedAttributesKeys = Object.keys(changedAttributes);

            var organizationKey = _.find(changedAttributesKeys, function (item) {
                return item == "Organization";
            });

            if (organizationKey && changedAttributesKeys.length === 1) {
                label = 'Filial';               //Была изменена информация только в поле Филиал.
            } else if (organizationKey) {
                label = 'Filial | Other fields'; //Была изменена информация в поле Филиал и в одном из других полей.
            } else {
                label = 'Other fields';         //Была изменена информация в любом или сразу нескольких полях, но не в поле Филиал.
            }
            Analytics.sendEvent('Users', 'Manage user | Personal data | Success', label, null, true);
        }
    };

    //Ошибка при сбросе пароля.
    Analytics.manageUserResetPasswordError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Manage users', 'Reset password | Step 1');
        if (error) {
            Analytics.sendEvent('Users', 'Manage user | Reset password | Step 1 | Error', error, null, true);
        }
    };

    //Ошибка, при редактировании личных данных пользователя
    Analytics.manageUserPersonalDataError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Users', 'Manage user | Personal data');
        if (error) {
            Analytics.sendEvent('Users', 'Manage user | Personal data | Error', error, null, true);
        }
    };

    //Ошибка валидации, при редактировании личных данных пользователя
    //First Name Required		При редактировании данных пользователя не было заполнено обязательно поле «Имя». Пользователю высветилась ошибка.
    //Last Name Required		При редактировании данных пользователя не было заполнено обязательно поле «Фамилия». Пользователю высветилась ошибка.
    //Country Required		    При редактировании данных пользователя не было заполнено обязательно поле «Country». Пользователю высветилась ошибка.
    Analytics.manageUserPersonalDataValidationError = function (model, errors) {
        //label включаются все ошибки, разделенные вертикальной чертой и двумя пробелами  « | ».
        Analytics.sendEvent('Users', 'Manage user | Personal data | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };

    //Ошибка при просмотре или изменении любых данных другого пользователя.
    Analytics.manageUserOpenError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Manage users', 'Open profile');
        if (error) {
            Analytics.sendEvent('Users', 'Manage users | Open profile | Error', error, null, true);
        }
    };

    //Ошибка при удалении учетной записи другого пользователя.
    Analytics.manageUserDeleteError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Manage users', 'Delete user');
        if (error) {
            Analytics.sendEvent('Users', 'Manage users | Delete user | Error', error, null, true);
        }
    };
    

    ////////////////////////////////////
    //2.10.3	Управление своим профилем
    ////////////////////////////////////
    //App.Analytics.profileEvent('Accept file agreement')	Пользователь поставил галочку, что принимает пользовательское соглашение.
    //App.Analytics.profileEvent('Open file agreement')		Пользователь кликнул по ссылке «Соглашение о загрузке файлов»
    //App.Analytics.profileEvent('Reset password')		    Пользователю была отправлена ссылка на сброс пароля.
    //App.Analytics.profileEvent('Delete user| Step 1')		Пользователь ставит галочку, подтверждая удаления и кликает по кнопке «Удалить пользователя»
    //App.Analytics.profileEvent('Delete user| Step 2')		Пользователь подтверждает удаление ещё раз, кликая по кнопке «Удалить» во всплывающем окне.
    Analytics.profileEditEvent = function (action, label) {
        Analytics.sendEvent('Profile', 'Edit profile | ' + action, label, null, true);
    };

    //Личные данные пользователя были успешно изменены.
    Analytics.profileEditSuccessEvent = function (model) {
        var label;

        var sourceModel = new Backbone.Model(model.analyticsSourceModel);
        sourceModel.set(model.toJSON());

        var changedAttributes = sourceModel.changedAttributes();
        if (changedAttributes) {
            var changedAttributesKeys = Object.keys(changedAttributes);

            var organizationKey = _.find(changedAttributesKeys, function (item) {
                return item == "Organization";
            });

            if (organizationKey && changedAttributesKeys.length === 1) {
                label = 'Filial';               //Была изменена информация только в поле Филиал.
            } else if (organizationKey) {
                label= 'Filial | Other fields'; //Была изменена информация в поле Филиал и в одном из других полей.
            } else {
                label = 'Other fields';         //Была изменена информация в любом или сразу нескольких полях, но не в поле Филиал.
            }
            Analytics.sendEvent('Profile', 'Edit profile | Success', label, null, true);
        }
    };

    //App.Analytics.companyDeleteEvent('Step 1')		Пользователь ставит галочку, подтверждая удаление и кликает по кнопке «Удалить компанию»
    //App.Analytics.companyDeleteEvent('Step 2')		Пользователь подтверждает удаление ещё раз, кликая по кнопке «Удалить» во всплывающем окне.
    Analytics.companyDeleteEvent = function (action, label) {
        Analytics.sendEvent('Profile', 'Company | Delete | ' + action, label, null, true);
    };
    
    Analytics.profileEditError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Profile', 'Edit profile | Personal data');
        if (error) {
            Analytics.sendEvent('Profile', 'Edit profile | Personal data | Error', error, null, true);
        }
    };

    //First Name Required		При редактировании данных пользователя не было заполнено обязательно поле «Имя». Пользователю высветилась ошибка.
    //Last Name Required		При редактировании данных пользователя не было заполнено обязательно поле «Фамилия». Пользователю высветилась ошибка.
    //Country Required		    При редактировании данных пользователя не было заполнено обязательно поле «Country». Пользователю высветилась ошибка.
    Analytics.profileValidationError = function (model, errors) {
        Analytics.sendEvent('Profile', 'Edit profile | Personal data | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };

    //'Unknown error'   		Пользователь столкнулся с системным сбоем или ошибкой на этапе сброса своего пароля через профиль.
    Analytics.profileResetPasswordError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Profile', 'Reset password | Step 1');
        if (error) {
            Analytics.sendEvent('Profile', 'Reset password | Step 1 | Error', error, null, true);
        }
    };

    //Сбой при получении данных пользователя на этапе его перехода в свой профиль
    Analytics.profileOpenError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Profile', 'Open profile');
        if (error) {
            Analytics.sendEvent('Profile', 'Open profile | Error', error, null, true);
        }
    };
    
    //Сбой при удалении учетной записи пользователя
    Analytics.profileDeleteError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Profile', 'Delete profile');
        if (error) {
            Analytics.sendEvent('Profile', 'Delete profile | Error', error, null, true);
        }
    };

    //Ошибка при деактивации компании
    Analytics.companyDeleteError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Profile', 'Company delete');
        if (error) {
            Analytics.sendEvent('Profile', 'Company delete | Error', error, null, true);
        }
    };

    //App.Analytics.companyLogoEvent('Choose file')		Пользователь кликает по кнопке «Загрузить файл»
    //App.Analytics.companyLogoEvent('Add | Success')		Лого компании успешно добавлено.
    Analytics.companyLogoEvent = function (action, label) {
        Analytics.sendEvent('Company logo', 'Company logo | ' + action, label, null, true);
    };

    //logo Image Http File Size		                При добавлении логотипа компании появляется ошибка о том, что размер загружаемого файла превышает максимально допустимый.
    //logo Image Logo File Name Image Content		При добавлении логотипа компании появляется ошибка о том, что расширение файла не является допустимым.
    Analytics.companyLogoAddError = function (action, resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Company logo', 'Company logo | ' + action);
        if (error) {
            Analytics.sendEvent('Company logo', 'Company logo | ' + action + ' | Error', error, null, true);
        }
    };

    //Ошибка при удалении логотипа
    Analytics.companyLogoDeleteError = function (resp) {
        var error = Analytics.getErrorCodeLabel(resp, 'Company logo', 'Company logo | Delete');
        if (error) {
            Analytics.sendEvent('Company logo', 'Company logo | Delete | Error', error, null, true);
        }
    };

    Analytics.companyLogoValidationError = function (model, errors) {
        Analytics.sendEvent('Company logo', 'Company logo | Add | Error', Analytics.getValidationErrorLabels(model, errors).join(" | "), null, false);
    };
    
    ////////////////////////////////////
    //2.12	Отслеживание 404 и 500 ошибок на сайте
    ////////////////////////////////////
    Analytics.error404Event = function () {
        Analytics.sendEvent('Errors', '404 error', Analytics.getCurrentUrl(), null, true);
    };

    Analytics.error500Event = function () {
        Analytics.sendEvent('Errors', '500 error', Analytics.getCurrentUrl(), null, true);
    };

    //срабатывает при 404 ошибке при скачивании файлов, роутинг fileNotFound
    Analytics.fileNotFoundError = function () {
        //анализируем document.referrer, что бы понять откуда был запрос
        var location = Analytics.getLocation(document.referrer);
        if (location && location.path) {
            var path = location.path ? location.path.split('/') : [];
            if (path.length > 1) {
                if (path[1] == "request") {
                    Analytics.sendEvent('Requests', 'Unknown error', 'Download file', null, true); //Системная ошибка при скачивании файла из переписки по запросу.
                }
                if (path[1] == "document") {
                    //TODO Analytics для данного события требуется доработка webapi
                    Analytics.sendEvent('Contracts', 'Unknown error', 'Download contract list', null, true); //Ошибка при загрузке файла, прикрепленного к договору 
                }
            }
        }
    };

    ////////////////////////////////////
    //3.	Отправка данных о виртуальных просмотрах страниц в Google Analytics
    ////////////////////////////////////
    
    ////////////////////////////////////
    //3.1	Успешные регистрации
    ////////////////////////////////////

    //Шаг 1 регистрации – отправка активационной ссылки
    Analytics.viewAccountCreateSuccess = function () {
        Analytics.pageView('/virtual/account/create/success', 'Activation link was sent to email');
    };

    ////////////////////////////////////
    //3.2	Смена пароля
    ////////////////////////////////////

    //Шаг 1 – отправка ссылки для сброса пароля
    Analytics.viewAccountForgotSuccess = function () {
        Analytics.pageView('/virtual/account/forgot/success', 'Instructions were sent via email');
    };

    //Шаг 2 регистрации – пользователь успешно назначил пароль
    //Шаг 2 – пользователь успешно назначил пароль
    Analytics.viewResetPasswordSuccess = function (category) {
        switch (category) {
            case "Password recovery":
                Analytics.pageView('/virtual/account/resetpassword/success', 'Password was changed');
                break;
            case "Registration":
                Analytics.pageView('/virtual/account/activate/success', 'Account was activated');
                break;
        }
        
    };

    ////////////////////////////////////
    //3.3	Успешное создание запроса
    ////////////////////////////////////

    //Обычный запрос в техподдержку
    Analytics.pageViewRequestSubmitSuccess = function (model) {
        var requestType = Analytics.getRequestType(model);
        switch (requestType) {
            case "Tech Support"://Обычный запрос в техподдержку
                Analytics.pageView('/virtual/request/submit/support', 'Request to technical support was sent');
                break;
            case "MSA"://MSA запрос
                Analytics.pageView('/virtual/request/submit/support-msa', 'MSA request to technical support was sent');
                break;
            case "TA"://TA запрос
                Analytics.pageView('/virtual/request/submit/support-ta', 'TA request to technical support was sent');
                break;
            case "VirLab"://Запрос в Антивирусную лабораторию
                Analytics.pageView('/virtual/request/submit/virlab', 'Request to virlab was sent');
                break;
            case "CSR"://Запрос CSR
                Analytics.pageView('/virtual/request/submit/csr', 'CSR request to technical support was sent');
                break;
            case "CA Question"://Вопрос по Company Account
                Analytics.pageView('/virtual/request/submit/ca', 'Question about CA was sent');
                break;
        }
    };
});