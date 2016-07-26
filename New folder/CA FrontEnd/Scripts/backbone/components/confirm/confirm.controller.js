App.module("Components.Confirm", function (Confirm, App, Backbone, Marionette, $, _) {
    Confirm.Controller = App.Controllers.Base.extend({
        initialize: function (options) {

            this.confirmLayoutView = new Confirm.ConfirmLayoutView({
                model: new Backbone.Model({
                    title: this.options.title,
                    text: this.options.text,
                    acceptButtonText: this.options.acceptButtonText
                })
            });

            this.modalWrapper = App.request('modal:wrapper', {
                contentView: this.confirmLayoutView,
                backdropElement: this.options.backdropElement
            });

            if (this.options.$el) {
                this.region = new Backbone.Marionette.Region({
                    el: this.options.$el
                });
            } else {
                this.region = App.modalRegion;
            }
            this.region.show(this.modalWrapper);

            this.listenTo(this.confirmLayoutView, 'accept:btn:click', _.bind(function () {
                this.modalWrapper.hide();
                if (this.options.success) this.options.success.call();
            }, this));

            this.listenTo(this.confirmLayoutView, 'cancel:btn:click', _.bind(function () {
                this.modalWrapper.hide();
                if (this.options.discard) this.options.discard.call();
            }, this));

        },
    });

    App.reqres.setHandler("confirm:view", function (options) {
        var controller = new Confirm.Controller(options);
        return controller;
    });

});