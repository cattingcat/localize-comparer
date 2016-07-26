(function (_, Backbone, Marionette) {
    "use strict";

    var _addAppRoute = Marionette.AppRouter.prototype.execute;

    _.extend(Marionette.AppRouter.prototype, {
        _addAppRoute: function (controller, route, methodName) {
            var method = controller['executeAction'];
            //if (!controller[methodName] || !controller[methodName].action) {
            //    throw new Marionette.error('method "' + methodname + '" was not found on the controller');
            //}

            this.route(route, methodName, _.bind(method, controller, methodName));
        }
    });


})(_, Backbone, Marionette);
