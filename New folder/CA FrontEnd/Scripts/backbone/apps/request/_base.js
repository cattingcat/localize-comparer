App.module("RequestApp", function (RequestApp, App, Backbone, Marionette, $, _) {
    RequestApp.RequestControllerBase = App.Controllers.Base.extend({
        getErrorHandler: function (title, errorPath) {

            return function (region, resp){
                var loc = App.ErrorLocalizer.getModalText(errorPath, resp);

                var errorView = new App.ErrorApp.Show.MainRegionError({
                    regionTitle: title,
                    title: loc.title,
                    text: loc.text
                });
                App.mainRegion.show(errorView);

                return true;
            }
        }
    });
});