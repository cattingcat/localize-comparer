App.module("Routing", function (Routing, App, Backbone, Marionette, $, _) {

    Routing.RouteController = Marionette.RouteController.extend({
        executeAction: function (actionName) {
            App.log('Route change: ', this.controllerMenuRoute);

            App.vent.trigger('route', this.controllerMenuRoute);
            if (!this[actionName]) {
                App.execute('error:notFound');
                return;
            }

            // store fresh auth entity
            this.currentRole = App.request('auth:role');
            if (this.currentRole != 'Anonymous') {
                this.userInfo = App.request('auth:entity');
            }
            

            var allowedRoles = this[actionName].roles || this.roles;
            App.mainRegionRoles = allowedRoles;

            if (!allowedRoles || this.isAllowed(allowedRoles)) {

                var settingsModel = App.request('settings:entity');
                var lang = settingsModel.get('language').value;
                var newLang = sessionStorage['new_language'];
                if (newLang){
                    if (lang != newLang) {
                        settingsModel.changeLang(newLang);
                    }
                    delete sessionStorage['new_language'];
                }
                
                var originalArgs = arguments;
                var refreshRegionFunction = _.bind(function () {
                    Marionette.RouteController.prototype.executeAction.apply(this, originalArgs);
                }, this);

                App.refreshMainRegion = refreshRegionFunction;
                refreshRegionFunction();
            } else {
                App.execute('main:page');
            }

        },
        isAllowed: function (allowedRoles) {
            if (this.currentRole == 'Anonymous') {
                return allowedRoles == this.currentRole || _.contains(allowedRoles, this.currentRole);
            } else {
                return _.contains(allowedRoles, this.currentRole) || allowedRoles == 'Authorized' || _.contains(allowedRoles, 'Authorized');
            }
        }
    });

    App.commands.setHandler('main:page', function () {
        var currentRole = App.request('auth:role');
        if (currentRole != 'Anonymous') {
            App.execute('request:list');
        } else {
            App.execute('account:login');
            App.vent.trigger('auth:loggedOut');
        }
    });
});