App.module("HeaderApp.Authorized", function (Authorized, App, Backbone, Marionette, $, _) {
    Authorized.Controller = App.Controllers.Base.extend({
        initialize: function () {
            this.layoutView = new Authorized.Layout();
            this.show(this.layoutView, { loading: false });

            this.menuView = new Authorized.Menu({});
            this.userInfoView = new Authorized.UserInfo({ model: App.AuthInfo });
            this.layoutView.menuRegion.show(this.menuView);
            this.layoutView.userInfoRegion.show(this.userInfoView);

            this.onCounterChange(App.RequestCounter);
            this.onAuthChange(App.AuthInfo);

            this.listenTo(this.menuView, 'menu:link', this.onMenuLinkClick);
            this.listenTo(this.menuView, 'menu:create', this.onMenuCreateClick);

            this.listenTo(this.userInfoView, 'header:click', this.onHeaderClick);
            this.listenTo(this.userInfoView, 'logout:click', this.onLogoutClick);
            this.listenTo(this.userInfoView, 'username:click', this.onUserEmailClick);

            this.listenTo(App.RequestCounter, 'change', this.onCounterChange);
            this.listenTo(App.AuthInfo, 'change', this.onAuthChange);

            this.listenTo(App.vent, 'route', this.onRouteChange);
            this.listenTo(App.vent, 'company:logo:change', this.onCompanyLogoChange);

            var logoLinkModel = new App.Entities.LogoLinkModel();
            logoLinkModel.fetch({
                success: _.bind(function (model, resp) {
                    if (resp.IsDefault) {
                        App.vent.trigger('company:logo:change', App.logo.defaultUrl);
                    } else {
                        App.vent.trigger('company:logo:change', resp.Base64String);
                    }
                }, this),
                error: _.bind(function (model, resp) {
                    App.vent.trigger('company:logo:change', App.logo.defaultUrl);
                }, this)
            });
        },

        onCompanyLogoChange: function (src) {
            this.userInfoView.refreshCompanyLogo(src);
        },

        onCounterChange: function (model) {
            this.menuView.setCounter(model.get('pendingCount'));
        },

        onAuthChange: function (auth) {
            var isCantManageUser = (auth.isUnknownComp() || !auth.isMain()),
                isCantManageLicense = auth.isTA(),
                isCantManageContract = auth.isTA();

            this.menuView.toggleUsers(!isCantManageUser);
            this.menuView.toggleLicenses(!isCantManageLicense);
            this.menuView.toggleContracts(!isCantManageContract);
        },

        onLogoutClick: function () {
            App.execute('auth:logout');
        },

        onHeaderClick: function () {
            App.execute('request:list');
        },

        onMenuLinkClick: function (route) {
            App.execute(route.split('/').join(':'));
        },

        onMenuCreateClick: function () {
            this.menuView.toggleLoading(true);
            this.requrestTypeList = new App.Entities.RequestTypeList();

            this.requrestTypeList.fetch({
                success: _.bind(function() {
                    this.menuView.toggleLoading(false);

                    if (this.requrestTypeList.length === 1) {
                        var instanceId = this.requrestTypeList.models[0].get('SRDInstanceId');
                        var url;

                        _.each(App.requests, _.bind(function(value, key) {
                            if (value == instanceId) url = key;
                        }, this));

                        if (url) {
                            App.execute('request:create:' + url);
                        } else {
                            App.execute('error:forbidden');
                        }

                    } else {
                        App.execute('request:create', this.requrestTypeList);
                    }
                }, this),
                error: _.bind(function() {
                    this.menuView.toggleLoading(false);
                    this.requrestTypeList.reset();
                    App.execute('request:create', this.requrestTypeList);
                }, this)
            });
        },

        onRouteChange: function (menuRoute) {
            if (this.menuView) this.menuView.setActiveItem(menuRoute);
        },

        onUserEmailClick: function () {
            App.execute('profile:show');
        }
    });
});