App.module("Components.Confirm", function (Confirm, App, Backbone, Marionette, $, _) {

    Confirm.ConfirmLayoutView = App.Views.LayoutView.extend({
        template: "confirm/confirm-layout",
        triggers: {
            'click .btn-confirm-accept': 'accept:btn:click',
            'click .btn-confirm-cancel': 'cancel:btn:click'
        }
    });

});