App.module("UserApp.List", function (List, App, Backbone, Marionette, $, _) {

    List.LayoutView = App.Views.LayoutView.extend({
        template: "user/list/layout",
        className: "section",
        ui: {
            createBtn: '.user-create',
            filter: '.a-filter'
        },
        regions: {
            modalRegion:      '.modal-region',
            userListRegion:   '.user-list-region',
            pagerRegion:      '.pager-region'
        },
        bindings: {
            '.filter-country': 'country',
            '.filter-organization': 'organization'
        },
        events: {
            'click @ui.filter': 'onSortDirectionChange'
        },

        serializeData: function () {
            var base = App.Views.LayoutView.prototype.serializeData.call(this);
            var filters = this.options.filters;

            var res = _.extend(base, {
                countries: filters.get('Countries'),
                filials: filters.get('Organizations')
            });

            return res;
        },

        onSortDirectionChange: function () {
            var filter = this.ui.filter;

            filter.toggleClass('a-filter-back');
            this.trigger('sort:direction:change', !filter.hasClass('a-filter-back'));
        },

        showCreateBtn: function () {
            this.ui.createBtn.removeClass('off');
        },

        switchPagination: function (state) {
            this.$('.pager-region').toggleClass('off', !state)
        },

        onRender: function () {
            this.stickit();

            var sort = this.model.get('sort'),
                isAsc = !sort || (sort == 'LastNameAsc');
            this.ui.filter.toggleClass('a-filter-back', isAsc);
        }
    });

    List.UserItem = App.Views.ItemView.extend({
        template: "user/list/user",
        className: "points pd cf elem-hover",
        events: {
            'click': 'onItemClick'
        },

        onItemClick: function (ev) {
            ev.preventDefault();
            // Различаем событие клика и событие выбора текста
            if (!getSelection().toString())
                this.trigger('user:view');
        },
        onRender: function () {
            this.stickit();
        }
    });

    List.NoUser = App.Views.ItemView.extend({
        template: 'user/list/no-user'
    });

    List.UserList = App.Views.CollectionView.extend({
        childView: List.UserItem,
        getEmptyView: function () {
            /* different states: no users and No Filtered users
            
            if (!this.collection.state.filter || this.collection.state.filter.filterStatus == '') {
                return List.NoUser;
            } else {
                return List.NoFilteredUser;
            }
            */
            return List.NoUser;
        }
    });

});