App.module("Components.Modal", function (Modal, App, Backbone, Marionette, $, _) {
    Modal.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.flagBackdrop = options.backdrop;

            this.layout = this.getLayoutView(options);
            this.listenTo(this.layout, 'show', this.onShowRegions);
            this.listenTo(this.layout, 'destroy', this.destroy);
        },

        onShowRegions: function () {
            if (this.options.contentView) {
                this.layout.setContent(this.options.contentView);
                this.listenTo(this.options.contentView, 'modal:close', _.bind(this.destroy, this));

            } else {
                App.error('Call modal windows without content');
            }

            if (this.options.backdrop !== false) {
                this.backdrop = this.getBackdropView();
                if (this.options.backdropElement) {
                    this.region = new Backbone.Marionette.Region({
                        el: this.options.backdropElement,
                    });
                    this.region.show(this.backdrop);
                } else {
                    App.backdropRegion.show(this.backdrop);
                }
            }
        },

        onDestroy: function () {
            if (this.flagBackdrop !== false) {
                this.backdrop.destroy();
            }
        },

        getLayoutView: function (options) {
            return new Modal.Layout(options);
        },

        getBackdropView: function () {
            return new Modal.Backdrop();
        }
    });

    App.reqres.setHandler("modal:wrapper", function (options) {
        var controller = new Modal.Controller(options);
        return controller.layout;
    });

});