App.module("RequestApp.CSR", function (CSR, App, Backbone, Marionette, $, _) {
    CSR.Controller = App.Controllers.Base.extend({
        initialize: function () {
            App.execute('show:broadcast');

            this.model = App.request('request:csr:model');
            this.userInfo = App.request('userInfo:entity');

            this.layoutView = new CSR.LayoutView(this);
            this.listenTo(this.layoutView, 'request:send', this.onRequestSend);
            this.listenTo(this.layoutView, 'request:abort', this.onRequestAbort);
            this.listenTo(this.layoutView, 'fileAttachError:call', this.onFileAttachError);
            this.listenTo(this.layoutView, 'keyFileButton:click', this.onKeyFileButtonClick);
            this.listenTo(this.layoutView, 'keyFileCancel:click', this.onKeyFileCancelClick);
            this.listenTo(this.layoutView, 'aboutCsr:click', this.onAboutCsrClick);

            this.listenTo(this.model, 'change:KeyFile', this.onChangekeyFile);
            
            this.show(this.layoutView, { loading: { entities: [this.userInfo] } });
        },

        onFileAttachError: function(error) {
            var title = this.glob('fileupload/attachError');
            this.showModalError(null, null,
            {
                region: App.modalRegion,
                errorView: this.getErrorView(new Backbone.Model({
                    errorTitle: title,
                    errorDescription: error
                }))
            });
        },

        onChangekeyFile: function (model, value) {
            this.layoutView.switchError(false);

            if (value) this.model.isValid(true);
        },

        onKeyFileButtonClick: function() {
            App.Analytics.newRequestEvent(this.model, 'Choose file');
        },

        onKeyFileCancelClick: function () {
            App.Analytics.newRequestEvent(this.model, 'Delete file');
        },

        onAboutCsrClick: function () {
            App.Analytics.requestEvent(this.model, 'How-to | Create CSR');
        },

        onRequestSend: function () {
            App.Analytics.newRequestEvent(this.model, 'Try');

            if (!this.model.isValid(true)) return;

            this.layoutView.switchLoading(true);
            this.layoutView.switchError(false);

            this.model.save(null, {
                success: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);
                    this.layoutView.resetKeyFileInput();
                    this.layoutView.showSuccess('request/csr/success', resp);

                    App.Analytics.newRequestEvent(model, 'Success', this.initiate);
                }, this),
                error: _.bind(function (model, resp) {
                    this.layoutView.switchLoading(false);
                    this.layoutView.resetKeyFileInput();

                    App.Analytics.newRequestError(model, resp);

                    if (resp.isValidationError) {
                        return;
                    }
                    
                    var msg = App.ErrorLocalizer.getErrorText('request/csr/errors', resp);
                    this.onFileAttachError(msg.text);
                    }, this)
                });
            
        },

        onRequestAbort: function () {
            App.execute('request:list');
        },

        getErrorView: function (model) {
            return new CSR.ErrorView({ model: model });
        },
    });
});