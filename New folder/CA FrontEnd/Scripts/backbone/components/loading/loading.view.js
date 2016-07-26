App.module("Components.Loading.Defaults", function (Defaults, App, Backbone, Marionette, $, _) {
    Defaults.Spinner = {
        lines: 10,              // The number of lines to draw
        length: 6,              // The length of each line
        width: 2.5,             // The line thickness
        radius: 7,              // The radius of the inner circle
        corners: 1,             // Corner roundness (0..1)
        rotate: 9,              // The rotation offset
        direction: 1,           // 1: clockwise, -1: counterclockwise
        color: '#000',          // #rgb or #rrggbb
        speed: 1,               // Rounds per second
        trail: 60,              // Afterglow percentage
        shadow: false,          // Whether to render a shadow
        hwaccel: true,          // Whether to use hardware acceleration
        className: 'spinner',   // The CSS class to assign to the spinner
        zIndex: 2e9,            // # The z-index (defaults to 2000000000)
        top: 'auto',            // # Top position relative to parent in px
        left: 'auto'           // # Left position relative to parent in px
    };

    App.reqres.setHandler("loading:defaults:spinner", function (options) {
        return Defaults.Spinner;
    });
});

App.module("Components.Loading", function (Loading, App, Backbone, Marionette, $, _) {
    
    
    Loading.LoadingView = Marionette.ItemView.extend({
        template: false,
        className: "loading-container",

        initialize: function (options) {
            options || (options = {});

            this.opts = options.spinner || {};

            _.defaults(this.opts, Loading.Defaults.Spinner);

        },

        onShow: function () {
            this.$el.spin(this.opts);
        },

        onDestroy: function () {
            this.$el.spin(false);
        }

    });
});