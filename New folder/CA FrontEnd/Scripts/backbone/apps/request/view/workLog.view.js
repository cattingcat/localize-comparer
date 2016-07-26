App.module("RequestApp.View", function (View, App, Backbone, Marionette, $, _) {
    View.WorkItem = App.Views.ItemView.extend({
        getTemplate: function () {
            switch(this.model.get('SubmitterType')){
                case 'ActiveCustomer': return 'request/view/client-message';
                case 'InactiveCustomer': return 'request/view/inactive-user-message';
                case 'Support': return 'request/view/support-message';
            }
        },
        bindings: {
            '.work-submit-date': {
                observe: 'SubmitDate',
                onGet: function (val) {
                    var localeDate = App.toLocalDate(val);
                    return Globalize.formatDate(localeDate, { datetime: 'medium' });
                }
            }
        },

        serializeData: function () {
            var retVal = App.Views.ItemView.prototype.serializeData.apply(this, arguments);

            var props = this.getUserProperties(),
                showLink = (props.isMain || props.isRequester);

            retVal.showLink = showLink;

            return retVal;
        },

        templateHelpers: function () {
            return {
                getFileSizeString: function (fileSize) {
                    var size = fileSize;
                    if (!size) return '0B';

                    var suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
                    var i = 0;
                    while (size > 1024) {
                        size /= 1024;
                        i++;
                    }
                    return Number(size).toFixed(2) + ' ' + suffixes[i];
                },

                trimFilename: function (name) {
                    if (name.length >= 50) {
                        name = name.substr(0, 47) + '...';
                    }

                    return name;
                }
            };
        },

        getUserProperties: function () {
            var authModel = this.options.authModel,
                userName = authModel.get('username'),
                role = authModel.get('role'),
                customerName = this.model.get('CustomerLogin');

            return {
                customer: customerName,
                isRequester: (userName == customerName),
                isMain: (role.indexOf('Main CA User') != -1)
            };
        },

        onRender: function () {
            this.stickit();

            var href = '#',
                props = this.getUserProperties(),
                isRequester = props.isRequester,
                isMain = props.isMain;

            if (isRequester) {
                href = '/profile/show';
            } else if (isMain) {
                href = '/user/show/' + props.customer + '/';
            }

            this.$('a.work-customer-fullname').attr('href', href);
            this.$('a.work-customer-fullname').attr('onclick', "App.Analytics.requestOpenProfileEvent(this); return false;");
        }
    });

    View.WorkLogProblem = App.Views.ItemView.extend({
        template: 'request/view/worklog-problem'
    });

    View.Worklog = App.Views.CollectionView.extend({
        childView: View.WorkItem,
        childViewOptions: function () {
            return { authModel: this.options.authModel };
        }
    });
});