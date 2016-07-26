App.module("Components.Modal", function (Modal, App, Backbone, Marionette, $, _) {
    Modal.Layout = App.Views.LayoutView.extend({
        template: "modal/layout",
        className: 'wPopup-cont',
        regions: {
            contentRegion: '.modal-content-region'
        },
        events: {
            'mousedown .wp-close': 'hide'
        },

        initialize: function () {
            this.listenTo(App.vent, 'esc:press', this.hide);
            this.listenTo(App.vent, 'window:resize', this.resize);
            this.listenTo(App.vent, 'window:scroll', this.scroll);
        },

        onRender: function () {
            this.fadeIn(_.bind(this.resize, this));

            // Clear activeElement when modal window appears
            if (document.activeElement)
                document.activeElement.blur();
        },

        hide: function () {
            this.fadeOut(_.bind(function () {
                this.destroy();
            }, this));

            this.trigger('modal:hide');
        },

        resize: function () {
            var jqWindow = $(window),
                windowW = jqWindow.width(),
                windowH = jqWindow.height(),
                scrollTop = jqWindow.scrollTop();

            var left = windowW - this.$el.width(),
                top = windowH - this.$el.height();

            left = left < 0 ? 0 : left / 2;
            top = (top < 10 ? 10 : top / 2) + scrollTop;

            this.prevScroll = scrollTop;

            this.$el.css({
                left: left + 'px',
                top: top + 'px'
            });
        },

        scroll: function () {
            var jqWindow = $(window),
                 windowW = jqWindow.width(),
                 windowH = jqWindow.height(),
                 scrollTop = jqWindow.scrollTop

            var w = this.$el.width(),
                h = this.$el.height();

            var left = windowW - w,
            top = windowH - h;

            left = left < 0 ? 0 : left / 2;

            if (h < windowH) {
                top = (top < 10 ? 10 : top / 2) + scrollTop;
            } else {
                top = (top < 10 ? 10 : top / 2);
            }

            this.$el.css({
                left: left + 'px',
                top: top + 'px'
            });
        },

        fadeIn: function (cb) {
            this.$el.fadeIn(240, cb);
        },
        fadeOut: function (cb) {
            this.$el.fadeOut(240, cb);
        },

        setContent: function (contentView) {
            if (!this.used) {
                this.swapViews(contentView);
                this.used = true;
                return;
            }

            this.fadeOut(_.bind(function () {
                this.swapViews(contentView);
            }, this));
        },

        swapViews: function (contentView) {
            this.contentRegion.show(contentView);

            this.$el.css('opacity', '0');
            this.$el.show();

            // recalculate position for new view
            this.resize();

            this.$el.hide();
            this.$el.css('opacity', '1');

            this.resize();

            // show new view
            this.fadeIn();
        }
    });

    Modal.Backdrop = App.Views.ItemView.extend({
        template: false,
        className: 'wPopup-over ie-opacity'
    });
});