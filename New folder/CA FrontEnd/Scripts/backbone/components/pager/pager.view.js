App.module("Components.Pager", function (Pager, App, Backbone, Marionette, $, _) {

    Pager.Page = App.Views.ItemView.extend({
        template: 'pager/page',
        tagName: 'a',
        triggers: {
            'click': 'page:click'
        },
        onRender: function () {
            this.$el.attr('href', 'javascript://');
        }
    });

    Pager.CurrentPage = App.Views.ItemView.extend({
        template: 'pager/page',
        tagName: 'span'
    });

    Pager.DottedPage = App.Views.ItemView.extend({
        template: 'pager/dotted',
        tagName: 'span'
    });

    Pager.HiddenPage = App.Views.ItemView.extend({
        template: 'pager/page',
        tagName: 'span',
        onRender: function () {
            this.$el.css('display', 'none');
        }
    });


    Pager.Layout = App.Views.CompositeView.extend({
        template: 'pager/layout',
        className: 'pager',
        childView: Pager.Page,
        childViewContainer: '.page-list-container',

        getChildView: function (item) {
            var page = item.get('page');

            var isCurrent = item.get('isCurrent'),
                isDottet = _.any(this.dotted, function (i) { return i.start == page }),
                isHidden = _.any(this.dotted, function (i) { return page > i.start && page < i.end; });

            if (isCurrent) return Pager.CurrentPage;
            if (isDottet) return Pager.DottedPage;
            if (isHidden) return Pager.HiddenPage;
            return Pager.Page;
        },

        onBeforeRender: function () {
            this.dotted = [];
            var showCount = 3, // кол-во страниц около текущего элемента или по краям
                minDottedBySide = 7, // кол-во страниц между текущй и краем
                minDottedCount = 12; // кол-во страниц начиная с которого начинаем скрывать лишние

            var max = this.collection.length,
                min = 1;

            if (max <= minDottedCount) return;

            var current = this.collection.findWhere({ isCurrent: true }).get('page');

            if (current - min > minDottedBySide) {
                this.dotted.push({
                    start: min + showCount,
                    end: current - showCount + 1
                });
            }

            if (max - current > minDottedBySide) {
                this.dotted.push({
                    start: current + showCount,
                    end: max - showCount + 1
                });
            }
        },
        
        onRender: function () {
            var len = this.collection.length;
            if (!len || len == 1) this.$el.hide();
            else this.$el.show();
        }
    });

});