App.module("Components.Notif", function (Notif, App, Backbone, Marionette, $, _) {

    Notif.Layout = App.Views.ItemView.extend({
        tagName: 'div',
        className: 'wrap cf ie-section',
        template: "notification/layout",
        ui: {
            level: '.level-icon',
            levelBg: '.level-icon .level-bg',
            hideBtn: '.bt-close',
            expandBtn: '.open-area'
        },
        events: {
            'click @ui.expandBtn': 'onExpand',
            'click @ui.hideBtn': 'onHide'
        },
        triggers: {
            'click .btn-request-send': 'request:send'
        },

        initialize: function () {
            this.modelJson = this.model.toJSON();
        },

        onShow: function () {
            var collapsed = this.modelJson.IsCollapsed;
            this.toggleExpandButton(!collapsed);

            var hidden = this.modelJson.IsNeverShow;
            this.$el.toggleClass('off', !!hidden);

            var level = this.modelJson.Category;
            if (level == 1) {
                // News
                this.ui.level.addClass('p-info');
                this.ui.levelBg.addClass('bg-orange');
            } else {
                // Critical
                this.ui.level.addClass('p-alert');
                this.ui.levelBg.addClass('bg-red');
            }

            if (collapsed) {
                App.Analytics.broadcastEvent('View | Hidden', this.modelJson.Summary);
            } else {
                App.Analytics.broadcastEvent('View | Opened', this.modelJson.Summary);
            }
        },

        onExpand: function () {
            var collapsed = this.ui.expandBtn.hasClass('close-area-view');
            var o = {
                id: this.modelJson.Id,
                collapsed: collapsed
            };

            this.trigger('notification:collapse', o);
            this.toggleExpandButton(!collapsed);
        },

        toggleExpandButton: function (state) {
            this.ui.expandBtn
                .toggleClass('close-area-view', state)
                .toggleClass('close-area', state)
                .next().toggleClass('off', !state);
        },

        onHide: function () {
            this.$el.addClass('off');
            var o = {
                id: this.modelJson.Id
            };
            this.trigger('notification:hide', o);
        },

        serializeData: function () {
            var text = this.modelJson.Text.replace(/[\r\n]/g, " <br /> ");

            // regexp для ссылок без a-тэга
            var rx = /[^"]((https|http|ftp):\/\/[^\s\r\n<]*)/gi, // links without a-tag
                text = (' ' + text).replace(rx, function (v, link) {
                    link = link.trim();

                    if (link.indexOf('my.kaspersky.com') !== -1) {
                        return ' <a href="' + link + '" onclick="App.Analytics.broadcastLinkClick(this, false); return false;">' + link + '</a>';
                    } else {
                        return ' <a href="' + link + '" target="_blank" onclick="App.Analytics.broadcastLinkClick(this, true);">' + link + '</a>';
                    }
                });

            var availableTags = [
                    'img', 'br', 'u', 'em',
                    'b', 'a', 'p', 'div',
                    'font', 'li', 'ol', 'ul',
                    'strong', 'sub', 'sup', 'h1',
                    'h2', 'h3', 'h4', 'h5'
                ],
                tagRx = /<\/?([\w-]*)\s*[\s\w="-]*\/?>/gi; // regexp для выбора любого(открывающего-закрывающего) HTML-тэга

            // Заменяем тэги НЕ из списка на пустые строки.
            text = text.replace(tagRx, function(v, tag) {
                if (availableTags.indexOf(tag.toLowerCase()) === -1) {
                    return '';
                } else {
                    return v;
                }
            });

            return {
                Title: this.modelJson.Summary,
                Message: text.trim()
            };
        }
    });

    Notif.List = App.Views.CollectionView.extend({
        childView: Notif.Layout
    });

});