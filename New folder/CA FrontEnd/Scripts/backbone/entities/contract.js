App.module("Entities", function (Entities, App, Backbone, Marionette, $, _) {
    "use strict";

    Entities.ContractCollection = Entities.PageableCollection.extend({
        url: '/api/Contract/GetList',
        initialize: function () {
            Entities.PageableCollection.prototype.initialize.call(this);
            this.on('collection:setpage', App.Analytics.contractsPageEvent);
        },
        parse: function (resp) {
            var activeContract = _.find(resp.Items, function (item) {
                return item.Status === 1 || item.Status === 3;//(Active = 1, Expired = 2, Expiring = 3)
            });
            if (activeContract) {
                App.Analytics.contractsEvent('Active contracts | View', this.state.currentPage);
            } else {
                App.Analytics.contractsEvent('Expired contracts | View', this.state.currentPage);
            }
            return Entities.PageableCollection.prototype.parse.call(this, resp);
        }
    });

    var API = {
        getContractEntities: function (options) {
            var collection = new Entities.ContractCollection();
            collection.fetch();
            return collection;
        }
    };

    App.reqres.setHandler('contract:entities', function (options) {
        return API.getContractEntities(options);
    });

});