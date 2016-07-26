App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    'use strict';
    Entities.ClientSession = Entities.Model.extend({
        initialize: function () {
            var data = store.get('clientSession');
            this.on('change', this.onChange);
            if (data) {
                this.set(data, { silent: true });
            } else {
                this.set({ Id: Entities.generateGuid() });
            }
        },
        onChange: function (model, opts) {
            this.saveToStore();
        },
        getId: function () {
            var data = store.get('clientSession'),
                id = this.get('Id');

            if (!id) id = Entities.generateGuid();

            if (!data) {
                this.set({ Id: id }, { silent: true });
                this.saveToStore();
            }

            return id;
        },
        saveToStore: function (model) {
            store.set('clientSession', this.attributes);
        }
    });

    App.ClientSession = new App.Entities.ClientSession();
});