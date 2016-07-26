App.module("LicenseApp.Compatible", function (Compatible, App, Backbone, Marionette, $, _) {

    Compatible.LayoutView = App.Views.LayoutView.extend({
        template: 'license/compatible/layout',
        regions: {
            applicationListRegion: '.application-list-region'
        }
    });

    Compatible.ApplicationItem = App.Views.ItemView.extend({
        template: 'license/compatible/application',
        tagName: 'div',
        onRender: function () {
            var url = this.model.get('URL'),
                name = this.model.get('SaleListName');

            if (url) {
                this.$el.html('<a href="' + url + '" target="_blank">' + name + '</a>');
            }
        }
    });

    Compatible.ApplicationList = App.Views.CollectionView.extend({
        childView: Compatible.ApplicationItem,
        className: 'modal-note'
    });


    Compatible.SyncView = App.Views.ItemView.extend({
        template: 'license/compatible/sync',
        serializeData: function () {
            return this.options;
        }
    });

    Compatible.ErrorView = App.Views.ItemView.extend({
        template: 'license/compatible/error',
        serializeData: function () {
            return this.options;
        }
    });

});