App.module("Components.FileAgreements", function (FileAgreements, App, Backbone, Marionette, $, _) {

    FileAgreements.AgreementLayoutView = App.Views.LayoutView.extend({
        template: "fileAgreements/agreement-layout",
        bindings: {
            '.file-agreements-checkbox': 'fileAgreementsCheckbox'
        },
        events: {
            'click .btn': 'onAcceptClick'
        },
        modelEvents: {
            'change:fileAgreementsCheckbox': function (model, val) {
                this.$('.btn').toggleClass('disabled', !val)
                    .toggleClass('bg-gray', !val).toggleClass('bg-green', val);
            }
        },
        onAcceptClick: function () {
            if (!this.$('.btn').hasClass('disabled'))
                this.trigger('file:agreements:accept');
        },

        toggleError: function (state) {
            this.$('.err').toggleClass('off', !state);
        },

        onRender: function () {
            var model = this.model.toJSON();
            if (model.AcceptedVersion == model.CurrentVersion)
                this.$('.accept-controls').addClass('off');

            this.stickit();
        }
    });
});