App.module("AccountApp.Delete", function (Delete, App, Backbone, Marionette, $, _) {
    Delete.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.model = App.request('account:delete:model', {
                username: options.username,
                timestamp: options.timestamp,
                token: options.token
            });

            // Отображение окна с подтверждением удаления пользователя
            /* if (options.authorized) {
                App.request('confirm:view', {
                    title: this.glob('account/delete/confirm/title'),
                    text: this.glob('account/delete/confirm/description'),
                    acceptButtonText: this.glob('account/delete/confirm/continue'),
                    success: _.bind(function () {
                        App.execute('auth:logout', {
                            complete: _.bind(this.runDeleting, this)
                        });
                    }, this)
                });
            } else {
                this.runDeleting();
            } */

            App.execute('auth:logout', {
                complete: _.bind(this.runDeleting, this)
            });
        },

        runDeleting: function () {
            var loadingView = new Delete.Process({
                title: this.glob('account/delete/loading'),
                message: ''
            });

            this.modalWrapper = App.request('modal:wrapper', { contentView: loadingView });
            this.show(this.modalWrapper, { loading: false });

            if (!this.model.isValid(true)) return;

            this.model.save(null, {
                success: _.bind(function () {
                    var successView = this.getSuccessView(this.model);
                    this.modalWrapper.setContent(successView);
                }, this),
                error: _.bind(function (model, resp) {
                    var loc = App.ErrorLocalizer.getModalText('account/delete/errors', resp);
                    this.showModalError(loc.title, loc.text);
                }, this)
            });
        },

        getErrorView: function (model) {
            return new Delete.ErrorView({ model: model });
        },

        getSuccessView: function (model) {
            return new Delete.SuccessView({ model: model });
        }
    });
});