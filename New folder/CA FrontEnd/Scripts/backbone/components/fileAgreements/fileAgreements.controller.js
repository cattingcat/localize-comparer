App.module("Components.FileAgreements", function (FileAgreements, App, Backbone, Marionette, $, _) {
    FileAgreements.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.options.model.unset('fileAgreementsCheckbox');

            this.loadingView = this.getLoadingView();
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.loadingView });

            this.options.region.show(this.modalWrapper);

            this.agreementModel = App.request('fileAgreement:entity');

            this.analyticsRequestType = options.analyticsRequestType;
            this.analyticsCategory = options.analyticsCategory;

            this.agreementModel.fetch({
                success:_.bind(this.onSuccess, this),
                error: _.bind(this.onError, this)
            });

            this.accept = false;
            this.listenTo(this.options.model, 'change:fileAgreementsCheckbox', this.onfileAgreementsCheckboxClick);
            this.listenTo(this.modalWrapper, 'modal:hide',this.onfileAgreementsClose);

        },
        onfileAgreementsCheckboxClick: function () {
            if (this.options.model.get('fileAgreementsCheckbox')) {
                App.Analytics.fileAgreementsEvent(this.analyticsRequestType, 'Accept file agreement', this.analyticsCategory);    
            }
        },
        onfileAgreementsClose: function () {
            if (this.accept) {
                return;
            }
            App.Analytics.fileAgreementsEvent(this.analyticsRequestType, 'Close file agreement', this.analyticsCategory);
        },
        onSuccess: function () {
            var model = this.agreementModel.toJSON();
            this.options.model.set({
                AgreementText: model.AgreementText,
                AcceptedVersion: model.AcceptedVersion,
                CurrentVersion: model.CurrentVersion
            });

            this.layoutView = new FileAgreements.AgreementLayoutView({ model: this.options.model });
            this.modalWrapper.setContent(this.layoutView);

            this.listenTo(this.layoutView, 'file:agreements:accept', _.bind(this.onAccept, this));
        },
        onError: function(model, response, xhr) {
            var title = this.glob('errors/500/title'),
                text = this.glob('errors/500/text');
            this.showModalError(title, text);
        },

        onAccept: function () {
            App.Analytics.fileAgreementsEvent(this.analyticsRequestType, 'Proceed to adding file', this.analyticsCategory);
            this.layoutView.toggleError(false);
            this.acceptModel = App.request('fileAgreementAccept:entity');
            this.accept = true;
            this.acceptModel.save(null, {
                success: _.bind(function () {
                    this.modalWrapper.hide();
                    this.options.model.unset('AgreementText');
                    this.options.success.call();
                }, this),
                error: _.bind(function (model, resp) {
                    App.Analytics.fileAgreementsError(resp);
                    this.layoutView.toggleError(true);
                }, this)
            });
        },

        getLoadingView: function () {
            return App.request('loading:view', {
                spinner: { color: '#fff' }
            });
        }
    });

    App.reqres.setHandler("fileAgreements:view", function (options) {
        var controller = new FileAgreements.Controller(options);
        return controller;
    });
});