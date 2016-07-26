App.module("ErrorApp.Show", function (Show, App, Backbone, Marionette, $, _) {

    var glob = _.bind(Globalize.formatMessage, Globalize);

    Show.NotFound = App.Views.LayoutView.extend({
        template: "_error/show/404",
        className: "section",
        triggers: {
            'click .back-to-main': 'back:to:main'
        },
        initialize: function () {
            App.Analytics.error404Event();
        }
    });

    Show.Forbidden = App.Views.LayoutView.extend({
        template: "_error/show/forbidden",
        className: "section",
        triggers: {
            'click .back-to-main': 'back:to:main'
        }
    });

    Show.InternalError = App.Views.LayoutView.extend({
        template: "_error/show/500",
        className: "section",
        triggers: {
            'click .back-to-main': 'back:to:main'
        },
        initialize: function () {
            App.Analytics.error500Event();
        }
    });

    Show.CustomError = App.Views.LayoutView.extend({
        template: "_error/show/custom",
        className: "section",
        events: {
            'click .back-to-main': 'onBack'
        },
        onBack: function () {
            App.execute('request:list');
            this.trigger('back:to:main');
        },
        serializeData: function() {
            return this.options;
        }
    });

    Show.ModalError = App.Views.LayoutView.extend({
        template: "_error/show/modal-error",
        className: "section",
        serializeData: function () {
            return this.options;
        }
    });
    
    Show.CustomSuccess = App.Views.LayoutView.extend({
        template: "_error/show/custom-success",
        className: "section",
        serializeData: function () {
            return this.options;
        }
    });

    Show.EndSession = App.Views.LayoutView.extend({
        template: "_error/show/end-session",
        className: "section",
        serializeData: function () {
            return {
                title: this.options.title || Globalize.formatMessage('errors/end-session/title'),
                text: this.options.text || Globalize.formatMessage('errors/end-session/text')
            };
        },
        events: {
            'click .wp-close': 'logout'
        },
        logout: function () {
            if (this.options.logouted) return;

            App.execute('auth:logout');
        }
    });

    Show.Logout = App.Views.LayoutView.extend({
        template: "_error/show/need-logout",
        serializeData: function () {
            var act = this.options.action,
                type = this.options.isAnotherUser ? '-close-session' : '-logout';

            var path = 'account/' + act + '/' + act + type;

            return { message: Globalize.formatMessage(path) };
        }
    });

    // View модального окна, для подтверждения закрытия сессии при переходе по ссылкам
    Show.ConfirmLogout = App.Views.LayoutView.extend({
        template: "_error/show/confirm-logout",
        events: {
            'click .confirm': 'onConfirmClick'
        },
        serializeData: function () {
            var type = this.options.isAnotherUser ? 'close-session' : 'logout',
                path = this.options.globPath + type,
                message = glob(path);

            var logoutBtnText = glob(this.options.globPath + 'logout-btn');

            var closeBtnText = glob(this.options.globPath + 'close-btn');

            return {
                message: glob(path),  // сообщение с ошибкой

                logoutBtnText: logoutBtnText, // подпись к кнопке подтверждения логаута
                closeBtnText: closeBtnText || glob('account/activate/close'), // Подпись к кнопке отмены

                // определяет как отображать кнопку логаута и подтверждения. для кейсов связанных с удалением кнопка должна быть красной
                btnWarn: this.options.warnButton 
            };
        },
        onConfirmClick: function () {
            console.log('confirm logout clicked ');
            this.options.confirm();
        }
    });

    // View для отображения неизвестной ошибки при регулярном получении данных (переход на списки запросов-пользователей и тп)
    Show.MainRegionError = App.Views.LayoutView.extend({
        template: "_error/show/main-region-error",
        serializeData: function () {
            var opts = this.options;
            return {
                regionTitle: opts.regionTitle || 'Company account',
                title: opts.title || 'Unknown error',
                text: opts.text || 'Please contact <a href="mailto:companyaccount@kaspersky.com">companyaccount@kaspersky.com</a>'
            };
        }
    });
});