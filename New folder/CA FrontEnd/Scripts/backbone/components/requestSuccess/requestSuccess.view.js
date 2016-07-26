App.module("RequestApp.RequestSuccess", function (RequestSuccess, App, Backbone, Marionette, $, _) {
    'use strict';

    RequestSuccess.Success = App.Views.LayoutView.extend({
        template: 'requestSuccess/layout',
        ui: {
            successMsg: '.success-msg'
        },
        onRender: function () {
            if (!this.options || !this.options.msg)
                App.error('Missing arguments RequestSuccess.Success#onRender');

            this.ui.successMsg.html(this.options.msg);

            if (this.options.InstanceId) {
                var linkEl = this.ui.successMsg.find('a');
                linkEl.one('click', _.bind(this.onLinkClick, this));
            }
        },
        onLinkClick: function (ev) {
            ev.preventDefault();
            App.execute('request:view', this.options.InstanceId);
            this.trigger('modal:close');
            this.trigger('request:link:click');
            this.destroy();
        }
    });

    App.RequestApp.getSuccessView = function (options) {
        options = options || {};

        var msg;
        if (options.path) {
            if (!options.requestId) App.warn('Request Id is missing');
            msg = Globalize.formatMessage(options.path, options);
        } else if (options.msg) {
            msg = options.msg;
        } else {
            App.error('Incorrect call App.RequestApp.getSuccessView, options: ', options);
        }

        var view = new RequestSuccess.Success({ msg: msg, InstanceId: options.InstanceId });

        var modalView = App.request('modal:wrapper', { contentView: view });
        
        this.listenTo(view, 'request:link:click', function() {
            modalView.trigger('request:link:click');
        });

        return modalView;
    };
});