App.module("HeaderApp.Authorized", function (Authorized, App, Backbone, Marionette, $, _) {
    Authorized.Layout = App.Views.LayoutView.extend({
        template: "header/authorized/layout",
        className: "head pd",
        regions: {
            'menuRegion': '.menu-region',
            'userInfoRegion': '.user-info-region'
        }
    });

    Authorized.Menu = App.Views.ItemView.extend({
        template: "header/authorized/menu",
        ui: {
            'createBtn': '.btn-create'
        },
        events: {
            'click .menu-item': 'onMenuLinkClick',
            'click @ui.createBtn': 'onCreateNewReqClick'
        },
        onMenuLinkClick: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var target = $(e.currentTarget),
                route = target.data('route');

            if (route) this.trigger('menu:link', route);
        },

        onCreateNewReqClick: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var btn = this.ui.createBtn,
                loading = btn.data('loading');

            if (!loading) {
                this.trigger('menu:create');
            }
        },

        setActiveItem: function (menuRoute) {
            this.$('a.cur').removeClass('cur');
            this.$('a[data-route="' + menuRoute + '"]').addClass('cur');
        },

        toggleLoading: function(loading){
            var btn = this.ui.createBtn;

            btn.data('loading', loading);

            if (loading) {
                btn.data('text', btn.text());
                var region = new Backbone.Marionette.Region({
                    el: btn
                });

                region.show(App.request('loading:view', {
                    spinner: { color: '#fff' }
                }));
            } else {
                btn.html('<span>' + btn.data('text') + '</span>');
            }
        },

        toggleUsers: function (flag) {
            this.$('[href="/user/list"]').toggleClass('off', !flag);
        },
        toggleLicenses: function (flag) {
            this.$('[href="/license/list"]').toggleClass('off', !flag);
        },
        toggleContracts: function (flag) {
            this.$('[href="/document/list"]').toggleClass('off', !flag);
        },

        setCounter: function (count) {
            count = count || 0;
            var counter = this.$('.request-count');

            counter.text(count);
            counter.parent().toggleClass('off', (count <= 0));
        }
    });

    Authorized.UserInfo = App.Views.ItemView.extend({
        template: "header/authorized/user-info",
        bindings: {
            '.user-login': 'username',
            '.user-company-id': 'companyId',
            '.user-company-name': 'companyName'
        },
        triggers: {
            'click .a-logo': 'header:click',
            'click .account-logout': 'logout:click',
            'click .user-login': 'username:click'
        },
        ui: {
            'logoImg': '.a-logo .logo',
            'spinner': '.a-logo .spinner'
        },
        onRender: function () {
            this.stickit();
        },
        refreshCompanyLogo: function (src) {
            this.ui.spinner.addClass("off");
            this.ui.logoImg.removeClass('off');
            this.ui.logoImg.attr("src", src);
        }
    });
});