App.module("RequestApp.CSR", function (CSR, App, Backbone, Marionette, $, _) {

    CSR.KeyInfoView = App.Views.LayoutView.extend({
        template: 'request/csr/csr-info',
        serializeData: function () { return this.model; }
    });

    CSR.ErrorView = App.Views.LayoutView.extend({ template: 'request/csr/csr-error' });

    CSR.LayoutView = App.Views.LayoutView.extend({
        template: "request/csr/layout",
        className: "section",
        regions: {
            buttonsRegion: '.buttonbar-region',
            keyInfoRegion: '.key-info-region'
        },
        ui: {
            keyFileInput: '.fileupload-input-file',
            keyFileInputCancel: '.fileupload-cancel'
        },
        triggers: {
            //'click .about-csr': 'aboutCsr:click',
            //'click .fileupload-link': 'keyFileButton:click'
        },
        events: {
            'click @ui.keyFileInputCancel': 'onKeyFileInputCancel',
            'click .fileupload-link': 'onKeyFileButtonClick',
            'click .about-csr': 'onAboutCsrClick',
            'change @ui.keyFileInput': 'onKeyFileInputChanged'
        },
        modelEvents:{
            'change:KeyFile': 'onChangeCsrFile'
        },
        initialize: function (options) {
            Backbone.Validation.bind(this);

            this.buttonbar = new App.RequestPartial.LayoutView();
            this.buttonbar.setup(this);
            this.listenTo(this.buttonbar, 'send:click', function () { this.trigger('request:send'); });
            this.listenTo(this.buttonbar, 'abort:click', function () { this.trigger('request:abort'); });
        },

        onChangeCsrFile: function (model, value) {
            if (value) {
                this.disableUploadButton();
            } else {
                this.enableUploadButton();
            }
        },

        // Метод для обобщенной обработки ошибок валидации
        validationError: function (attr, error, options) {
            if (!error) return;

            this.trigger('fileAttachError:call', error);
            this.resetKeyFileInput();
        },

        serializeData: function () {
            return {
                remarkQuestion: Globalize.formatMessage('request/csr/remarkQuestion'),
                remarkDescriprion: Globalize.formatMessage('request/csr/remarkDescriprion')
            };
        },
        onKeyFileButtonClick: function(ev) {
            this.trigger('keyFileButton:click');
        },
        onKeyFileInputChanged: function (ev) {
            var file = _.first(ev.target.files);

            var keyInfoView = new CSR.KeyInfoView({ model: file });
            this.keyInfoRegion.show(keyInfoView);

            this.model.set({ KeyFile: file });
        },
        resetKeyFileInput: function () {
            this.ui.keyFileInput.closest("form").get(0).reset();
            this.model.unset('KeyFile');

            this.keyInfoRegion.empty();
        },

        onKeyFileInputCancel: function () {
            this.resetKeyFileInput();
            this.trigger('keyFileCancel:click');
        },

        enableUploadButton: function () {
            var link = this.$('.fileupload-link'),
                stub = this.$('.fileupload-stub');
            link.removeClass('off');
            stub.addClass('off');
        },

        disableUploadButton: function () {
            var link = this.$('.fileupload-link'),
                stub = this.$('.fileupload-stub');
            link.addClass('off');
            stub.removeClass('off');
        },

        onAboutCsrClick: function () {
            this.trigger('aboutCsr:click');
        },

        onRender: function () {
            this.buttonsRegion.show(this.buttonbar);
            this.stickit();
            this.$('.about-csr').find('a').on('click', this.trigger('aboutCsr:click'));
        }
    });
});