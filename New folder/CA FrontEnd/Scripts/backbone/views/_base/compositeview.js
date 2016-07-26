App.module("Views", function (Views, App, Backbone, Marionette, $, _) {
	
    Views.CompositeView = Marionette.CompositeView.extend({
        itemViewEventPrefix: "childview",
        serializeData: function () {
            if (this.model) 
                return Backbone.Model.prototype.toJSON.apply(this.model);

            return {};
        }
    });    
});