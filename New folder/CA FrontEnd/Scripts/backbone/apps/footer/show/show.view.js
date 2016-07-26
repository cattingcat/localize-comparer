App.module("FooterApp.Show", function (Show, App, Backbone, Marionette, $, _) {

    Show.LayoutView = App.Views.LayoutView.extend({
        template: 'footer/show/layout',
        className: 'wrap',
        regions: {
            modalRegion: '.modal-region'
        },
        triggers: {
            'click .choose-language': 'choose:language:click'
        },
        serializeData: function () {
            return _.extend(App.Views.LayoutView.prototype.serializeData.apply(this, arguments), {
                currentYear: App.currentYear
            });
        }
    });

    Show.LanguageView = App.Views.CompositeView.extend({
        template: false,
        tagName: 'a',
        className: 'js-choose-lang',
        onRender: function() {
            this.$el.html(this.model.get('text'));
            this.$el.attr('data-value', this.model.get('value'));
            this.$el.attr('href', 'javascript://');
            this.$el.css('display', 'block');
        }
    });

    Show.ChooseLanguageView = App.Views.CompositeView.extend({
        template: 'footer/show/choose-language',
        childView: Show.LanguageView,
        childViewContainer: '.selector-lang',
        attachBuffer: function (compositeView) {
            var buffer = this._createBuffer(compositeView);
            var len = Math.ceil(buffer.childNodes.length / 3);

            // IE8 don't work!
            //var leftColumn = Array.prototype.slice.call(buffer.childNodes, 0, len);
            //var middleColumn = Array.prototype.slice.call(buffer.childNodes, len, 2 * len);
            //var rightColumn = Array.prototype.slice.call(buffer.childNodes, 2 * len);

            // hack for IE8
            var i = 0;
            var leftColumn = [];
            var middleColumn = [];
            var rightColumn = [];
            _.each(buffer.childNodes, _.bind(function (item) {
                if (i < len) {
                    leftColumn.push(item);
                } else if (i < len*2) {
                    middleColumn.push(item);
                } else {
                    rightColumn.push(item);
                }
                i++;
            }, this));


            var $container = this.getChildViewContainer(compositeView);
            $container.find('.left-column').html(leftColumn);
            $container.find('.middle-column').html(middleColumn);
            $container.find('.right-column').html(rightColumn);
        },
        events: {
            'click .js-choose-lang': 'onLanguageLinkClick'
        },
        onLanguageLinkClick: function (e) {
            var langValue = $(e.target).attr('data-value');
            var langText = $(e.target).text();
            App.Analytics.footerLanguageSelectEvent(langText, _.bind(function () {
                this.trigger('change:language', {
                    value: langValue,
                    text: langText
                });
            }, this));
            
        }
    });

});