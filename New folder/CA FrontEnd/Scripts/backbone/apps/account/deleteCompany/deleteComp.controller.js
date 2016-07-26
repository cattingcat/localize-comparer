App.module("AccountApp.DeleteCompany", function (DeleteCompany, App, Backbone, Marionette, $, _) {
    DeleteCompany.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.model = App.request('company:delete:model', {
                username: options.username,
                timestamp: options.timestamp,
                token: options.token
            });

            if (options.confirmed) {
                this.runDeleting();
                return;
            }

            if (options.authorized) {
                var repeatFunc = _.bind(function () {
                    this.confirmed = true;
                    return new DeleteCompany.Controller(this);
                }, options);

                var view = new App.ErrorApp.Show.ConfirmLogout({
                    globPath: 'account/deleteCompany/',
                    isAnotherUser: (App.AuthInfo.get('username') != this.model.get('username')),
                    warnButton: true,
                    confirm: function () {
                        App.execute('auth:logout', {
                            complete: repeatFunc
                        });
                    }
                });

                this.modalWrapper = App.request('modal:wrapper', { contentView: view });
                this.show(this.modalWrapper, { loading: false });
                return;
            } else {
                App.request('confirm:view', {
                    title: this.glob('account/deleteCompany/confirm/title'),
                    text: this.glob('account/deleteCompany/confirm/description'),
                    acceptButtonText: this.glob('account/deleteCompany/confirm/continue'),
                    success: _.bind(function () {
                        this.runDeleting();
                    }, this)
                });
            }
        },

        runDeleting: function () {
            var loadingView = new DeleteCompany.Process({
                title: this.glob('account/deleteCompany/loading'),
                message: ''
            });

            this.modalWrapper = App.request('modal:wrapper', { contentView: loadingView });
            this.show(this.modalWrapper, { loading: false });

            if (!this.model.isValid(true)) return;

            this.model.save(null, {
                success: _.bind(function () {
                    var successView = this.getSuccessView();
                    this.modalWrapper.setContent(successView);
                }, this),
                error: _.bind(function (model, resp) {
                    var loc = App.ErrorLocalizer.getModalText('account/deleteCompany/errors', resp);
                    this.showModalError(loc.title, loc.text);
                }, this)
            });
        },

        getLoadingView: function () {
            var title = this.glob('account/deleteCompany/loading'),
                text = '';

            return 
        },

        getSuccessView: function () {
            return new DeleteCompany.SuccessView({ model: this.model });
        },

        getErrorView: function (model) {
            return new DeleteCompany.ErrorView({ model: model });
        }
    });
});