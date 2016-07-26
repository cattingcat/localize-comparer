App.module("FooterApp.Show", function (Show, App, Backbone, Marionette, $, _) {
    Show.Controller = App.Controllers.Base.extend({

        initialize: function () {
            this.model = App.request('settings:entity');
            this.layoutView = this.getLayoutView();
            this.listenTo(this.layoutView, 'choose:language:click', this.onChooseLanguageClick);
            this.listenTo(this.model, 'language:save:error', this.onSaveError);
            this.show(this.layoutView, { loading: false });
        },

        onChooseLanguageClick: function () {
            this.languages = App.request('settings:language:entities');
            this.chooseLanguageView = this.getChooseLanguageView();
            this.listenTo(this.chooseLanguageView, 'change:language', this.onChangeLanguage);
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.chooseLanguageView });
            App.modalRegion.show(this.modalWrapper);
        },

        onChangeLanguage: function (language) {
            this.model.set('language', language);
        },

        onSaveError: function (resp) {
            var loc = App.ErrorLocalizer.getModalText('footer/errors', resp);
            this.showModalError(loc.title, loc.text, {region: App.modalRegion});
        },

        getLayoutView: function () {
            return new Show.LayoutView({ model: this.model });
        },

        getChooseLanguageView: function () {
            return new Show.ChooseLanguageView({ collection: this.languages });
        }
    });
});