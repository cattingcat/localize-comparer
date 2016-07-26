App.module("RequestApp", function (RequestApp, App, Backbone, Marionette, $, _) {
    "use strict";

    var RouteController = App.Routing.RouteController.extend({
        controllerMenuRoute: 'request/list',
        roles: ['Authorized'],
        list: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.List.Controller({ region: App.mainRegion });
                });
            }
        },
        create: {
            action: function (collection) {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.Create.Controller({ region: App.mainRegion, collection: collection });
                });
            }
        },
        support: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.Support.Controller({ region: App.mainRegion, srdId: App.requests['support'] });
                });
            }
        },
        supportTa: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.SupportTA.Controller({ region: App.mainRegion, srdId: App.requests['support-ta'] });
                });
            }
        },
        supportMsa: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.SupportMSA.Controller({ region: App.mainRegion, srdId: App.requests['support-msa'] });
                });
            }
        },
        csr: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.CSR.Controller({ region: App.mainRegion });
                });
            }
        },
        virlab: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.Virlab.Controller({ region: App.mainRegion, srdId: App.requests['virlab'] });
                });
            }
        },
        virlabMsa: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.Virlab.Controller({ region: App.mainRegion, srdId: App.requests['virlab-msa'] });
                });
            }
        },
        ca: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.CA.Controller({ region: App.mainRegion });
                }); 
            }
        },
        feedback: {
            action: function () {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.Feedback.Controller({ region: App.mainRegion });
                }); 
            }
        },
        view: {
            action: function (id) {
                Helpers.loadLangFile('request', function () {
                    new RequestApp.View.Controller({ region: App.mainRegion, id: id });
                });
            }
        }
    });

    RequestApp.Router = Marionette.AppRouter.extend({
        appRoutes: {
            "request/list": "list",
            "request/create/support": "support",
            "request/create/support-ta": "supportTa",
            "request/create/support-msa": "supportMsa",
            "request/create/csr": "csr",
            "request/create/virlab": "virlab",
            "request/create/virlab-msa": "virlabMsa",
            "request/create/ca": "ca",
            "request/create/feedback": "feedback",
            "request/create": "create",
            "request/view/:id": "view",
            "": "list"
        }
    });

    App.addInitializer(function () {
        RequestApp.RouteController = new RouteController();
        return new RequestApp.Router({
            controller: RequestApp.RouteController
        });
    });

    App.commands.setHandler('request:list', function (options) {
        App.navigate('request/list');
        RequestApp.RouteController.executeAction('list', options);
    });

    App.commands.setHandler('request:create', function (collection) {
        App.navigate('request/create');
        RequestApp.RouteController.executeAction('create', collection);
    });

    App.commands.setHandler('request:create:support', function () {
        App.navigate('request/create/support');
        RequestApp.RouteController.executeAction('support');
    });

    App.commands.setHandler('request:create:support-ta', function () {
        App.navigate('request/create/support-ta');
        RequestApp.RouteController.executeAction('supportTa');
    });

    App.commands.setHandler('request:create:support-msa', function () {
        App.navigate('request/create/support-msa');
        RequestApp.RouteController.executeAction('supportMsa');
    });

    App.commands.setHandler('request:create:virlab', function () {
        App.navigate('request/create/virlab');
        RequestApp.RouteController.executeAction('virlab');
    });

    App.commands.setHandler('request:create:virlab-msa', function () {
        App.navigate('request/create/virlab-msa');
        RequestApp.RouteController.executeAction('virlabMsa');
    });

    App.commands.setHandler('request:create:csr', function () {
        App.navigate('request/create/csr');
        RequestApp.RouteController.executeAction('csr');
    });

    App.commands.setHandler('request:create:ca', function () {
        App.navigate('request/create/ca');
        RequestApp.RouteController.executeAction('ca');
    });

    App.commands.setHandler('request:create:feedback', function () {
        App.navigate('request/create/feedback');
        RequestApp.RouteController.executeAction('feedback');
    });

    App.commands.setHandler('request:view', function (id) {
        App.navigate('request/view/' + id);
        RequestApp.RouteController.executeAction('view', id);
    });

});