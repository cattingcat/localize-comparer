(function (Marionette, _, JST) {
    "use strict";

    var insertAt = function (array, index, item) {
        array.splice(index, 0, item);
        return array;
    };

    _.extend(Marionette.Renderer, {
        lookups: ["apps/", "components/"],

        render: function (template, data) {
            if (!template) return this;
            var path = this.getTemplate(template);
            if (!path) throw "Template " + template + " not found!";
            return path(data);
        },

        getTemplate: function (template) {
            var found = false;
            _.each([template, insertAt(template.split("/"), -1, "templates").join("/")], function (path) {
                _.each(this.lookups, function (lookup) {
                    if (!found && JST[lookup + path]) {
                        found = JST[lookup + path];
                    }
                });
            }, this);
            return found;
        }
    });

})(Marionette, _, JST);
