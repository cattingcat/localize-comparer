App.module("DocumentApp.List", function (List, App, Backbone, Marionette, $, _) {

    List.LayoutView = App.Views.LayoutView.extend({
        template: "document/list/layout",
        className: "section",
        regions: {
            'modalRegion': '.modal-region',
            'contractListRegion': '.contract-list-region',
            'pagerRegion': '.pager-region'
        },
    });

    List.ContractItem = App.Views.ItemView.extend({
        template: "document/list/contract",
        className: "points pd cf",
        bindings: {
            '.contract-status': {
                observe: 'Status',
                onGet: function (val) {
                    return Globalize.formatMessage('document/statuses/' + val);
                }
            },
            '.date-start': {
                observe: 'StartDate',
                onGet: function (val) {
                    var localDate = App.toLocalDate(val);
                    return Globalize.formatDate(localDate, { date: 'short' });
                }
            },
            '.date-end': {
                observe: 'EndDate',
                onGet: function (val) {
                    var status = this.model.get('Status'),
                        localDate = App.toLocalDate(val),
                        dateStr = Globalize.formatDate(localDate, { date: 'short' });

                    // if not Expired
                    if (status != 2) {
                        var until = Globalize.formatMessage('document/statuses/until');
                        return until + dateStr;
                    } else {
                        return dateStr;
                    }
                }
            }
        },
        events: {
            'click .file-name': 'downloadDocumentFileClick'
        },
        onRender: function () {
            this.stickit();
        },
        serializeData: function () {
            var retVal = App.Views.ItemView.prototype.serializeData.apply(this, arguments);
            var color = this.getStatusColor();
            retVal.badgeColor = 'bg-' + color;
            retVal.statusColor = 'clr-' + color;
            return retVal;
        },
        getStatusColor: function () {
            var model = this.model.toJSON(),
                status = model.Status;

            switch (status) {
                case 1: return 'green';
                case 2: return 'gray';
                default: return 'red';
            }
        },
        downloadDocumentFileClick: function (e) {
            this.downloadFileClick(e);
            App.Analytics.contractsEvent('Contract | Download');
        }
    });

    List.NoContract = App.Views.ItemView.extend({
        template: 'document/list/no-contract'
    });

    List.ContractList = App.Views.CollectionView.extend({
        childView: List.ContractItem,
        getEmptyView: function () {
            App.Analytics.contractsEvent('No contracts | View');
            return List.NoContract;
        }
    });
});