App.module("LicenseApp.List", function (List, App, Backbone, Marionette, $, _) {

    List.LayoutView = App.Views.LayoutView.extend({
        template: "license/list/layout",
        className: "section",

        initialize: function () {
            this.listenTo(this.model, 'change', this.onModelChange);
            this.onModelChange(this.model);
        },

        regions: {
            licenseListRegion: '.license-list-region',
            licenseAddRegion: '.license-add-region',
            modalRegion: '.modal-region',
            pagerRegion: '.pager-region'
        },

        bindings: {
            '.filter-status': 'status'
        },

        events: {
            'click .a-filter': 'onSortDirectionChange'
        },

        onModelChange: function (model) {
            var m = model.toJSON(),
                sort = m.sort,
                filter = m.status || m.filter || 'All';

            if (!sort || sort == 'EndDateDesc') {
                this.$('.a-filter').removeClass('a-filter-back');
            }

            var sortFilter = this.$('.license-status-filter'),
                select = sortFilter.find('select'),
                textEl = sortFilter.find('i');

            var text = select.find('option[value="' + filter + '"]').text();
            model.set({ filter: filter, status: filter }, { silent: true });
            textEl.text(text);
        },

        onSortDirectionChange: function () {
            this.$('.a-filter').toggleClass('a-filter-back');
            this.trigger('sort:direction:change', !this.$('.a-filter').hasClass('a-filter-back'));
        },

        onRender: function () {
            this.stickit();
        }
    });

    List.LicenseAdd = App.Views.ItemView.extend({
        template: 'license/list/license-add',
        ui: {
            keyFileInput: '.fileupload-input-key-file',
            addBtn: '.lic-add',
            uploadBtn: '.btn-upload',
            licenseCodeInput: '.license-code'
        },
        events: {
            'change @ui.keyFileInput': 'onKeyFileInputChanged',
            'click @ui.addBtn': 'onSendClick',
            'click @ui.uploadBtn': 'onUploadBtnClick'
        },
        modelEvents:{
            'change:ActivationCode': 'onChangeLicense',
            'change:KeyFile': 'onChangeLicense'
        },

        initialize: function () {
            Backbone.Validation.bind(this, {
                valid: function (view, attr) {
                    Backbone.Validation.callbacks.valid.apply(this, arguments);
                    view.switchErrorMsg(false);
                },
                invalid: function (view, attr, error) {
                    if (view.fieldValidation) {
                        Backbone.Validation.callbacks.invalid.apply(this, arguments);
                        view.switchErrorMsg(error);
                    }
                }
            });
            this.fieldValidation = true;
            this.bindings = {
                '.license-code': 'ActivationCode'
            };
        },

        // Отправка в виде файла
        onKeyFileInputChanged: function () {
            var file = this.ui.keyFileInput[0].files[0];

            var err = this.model.preValidate('KeyFile', file);
            if (err) return;

            this.model.set({
                KeyFile: file,
                ActivationCode: null
            });
            this.trigger("code:send");
        },

        // Отправка в виде кода активации
        onSendClick: function () {
            var add = this.ui.addBtn;
            var isNotLoaded = !(add.hasClass("bg-gray"));
            if (isNotLoaded)
                this.trigger("code:send");
        },

        onUploadBtnClick: function () {
            App.Analytics.licenseAddEvent('Initiate | Key file');
        },

        // При изменении кода активации - дизейблим инпут файла
        onChangeLicense: function (model, code) {
            var hasKeyFile = model.has('KeyFile'),
                hasCode = !!model.get('ActivationCode');

            this.ui.licenseCodeInput.prop('disabled', hasKeyFile);
            this.ui.uploadBtn.toggleClass('disabled-upload', !!code);
            this.ui.keyFileInput.attr('visible', !!code);

            // Очищаем инпут для файла
            if (!hasKeyFile) this.ui.keyFileInput.closest("form").get(0).reset();

            if (hasCode) App.Analytics.licenseAddEvent('Initiate | Code');
        },

        switchErrorMsg: function (error) {
            var errorEl = this.$('.license-upload-err');
            var okEl = this.$('.license-upload-ok');

            if (error) {
                if (_.isString(error)) {
                    errorEl.html(error);
                }
                errorEl.removeClass('off');
                okEl.addClass('off');
            } else {
                errorEl.addClass('off');
            }
        },

        switchLoading: function (state, successed) {
            var add = this.ui.addBtn,
                uploadBtn = this.ui.uploadBtn;

            var loader = this.$('.license-upload-process');
            var okMsg = this.$('.license-upload-ok');

            if (state) {
                uploadBtn.addClass('disabled').addClass('bg-gray').removeClass('bg-green');
                uploadBtn.find("input").hide();

                add.addClass('disabled').addClass('bg-gray').removeClass('bg-green');
                
                loader.removeClass('off');
                okMsg.addClass('off');
            } else {
                uploadBtn.removeClass('disabled').removeClass('bg-gray').addClass('bg-green');
                uploadBtn.find("input").show();

                add.removeClass('disabled').removeClass('bg-gray').addClass('bg-green');

                loader.addClass('off');

                if (successed) {
                    this.successSubmit = true;
                    okMsg.removeClass('off');
                }
            }
        },
        
        onRender: function () {
            this.stickit();
            var codeInput = this.$('.license-code');
            codeInput.mask("*****-*****-*****-*****", { autoclear: false });
            codeInput.on('keydown', function (e) {
                // key-codes for IOL0 and 0 from NumLock
                if ([73, 79, 76, 48, 96].indexOf(e.keyCode) != -1)
                    e.preventDefault();
            });
        }
    });

    List.LicenseItem = App.Views.ItemView.extend({
        template: "license/list/license",
        className: 'points',
        bindings: {
            '.license-sale-list-name': 'SaleListName',
            '.license-activation-code': 'ActivationCode',
            '.license-serial-number': 'SerialNumber',
            '.license-order-number': 'OrderNumber',
            '.license-count': 'LicenseCount',
            '.license-key-file-name': 'KeyFile',
            '.license-comment': {
                observe: ['Comment', 'BlockedDate'],
                onGet: function (val) {
                    var msg = val[0],
                        date = val[1];

                    if (msg && msg != 'Empty') {

                        if (msg == 'Blocked') {
                            if (!date) {
                                App.error('Blocked license withount blocked date');
                                return '';
                            }

                            var localDate = App.toLocalDate(date),
                                blockedDate = Globalize.formatDate(localDate, { date: 'short' });

                            return Globalize.formatMessage('license/comments/' + msg, {
                                BlockedDate: blockedDate
                            });
                        }

                        return Globalize.formatMessage('license/comments/' + msg);

                    } else return '';
                }
            },
            '.license-add-date': {
                observe: 'AddDate',
                onGet: function (val) {
                    var localDate = App.toLocalDate(val);
                    return Globalize.formatDate(localDate, { date: 'short' });
                }
            },
            '.license-status': {
                observe: 'Status',
                onGet: function (val) {
                    return Globalize.formatMessage('license/statuses/' + val);
                }
            },
            '.license-expire-date': {
                observe: 'ExpireDate',
                onGet: function (val) {
                    if (val) {
                        var localDate = App.toLocalDate(val);
                        return Globalize.formatDate(localDate, { date: 'short' });
                    }

                    return '';
                }
            }
        },
        ui: {
            openArea: '.open-area',
            addInfo: '.pd-add'
        },
        events: {
            'click @ui.openArea': 'onOpenAreaClick'
        },
        triggers: {
            'click .compatible-application': 'compatible:show',
            'click .license-remove': 'license:remove'
        },
        onOpenAreaClick: function (e) {
            e.preventDefault();
            this.ui.addInfo.toggleClass('off');
            this.ui.openArea.toggleClass('close-area');

            this.isExpanded = this.ui.openArea.hasClass('close-area');

            this.trigger('toggled');
        },
        onRender: function () {
            this.stickit();
            this.listenTo(App.AuthInfo, 'change:role', this.onRoleChange);
            this.onRoleChange(App.AuthInfo);
        },
        onRoleChange: function (auth) {
            this.$('.license-remove').toggleClass('off', !auth.isMain());
        },
        serializeData: function () {
            var retVal = App.Views.ItemView.prototype.serializeData.apply(this, arguments);
            var statusColor = this.getStatusColor(),
                commentColor = this.getCommentColor();

            retVal.statusBorderClass = 'bg-' + statusColor;
            retVal.statusTextClass = 'clr-' + statusColor;
            retVal.commentTextClass = 'clr-' + commentColor;
            retVal.expand = retVal.expand || false;

            return retVal;
        },
        getStatusColor: function () {
            switch (this.model.get('Status')) {
                case 'NotActivated': return 'gray';
                case 'Valid': return 'green';
                case 'Expired': return 'gray';
                case 'Blocked': return 'gray';
                default: return 'green';
            }
        },
        getCommentColor: function () {
            switch (this.model.get('Comment')) {
                case 'NotActivated': return 'gray';
                case 'ExpiresSoon': return 'red';
                case 'Blocked': return 'gray';
                default: return 'gray';
            }
        }
    });

    List.NoLicense = App.Views.ItemView.extend({
        template: 'license/list/no-license'
    });

    List.NoFilteredLicense = App.Views.ItemView.extend({
        template: 'license/list/no-filtered-license'
    });

    List.LicenseList = App.Views.CollectionView.extend({
        childView: List.LicenseItem,
        getEmptyView: function () {
            var filter = this.collection.state.filter;

            if (!filter || filter.filter == 'All') {
                return List.NoLicense;
            } else {
                return List.NoFilteredLicense;
            }
        },
        initialize: function () {
            this.expandedChilds = [];
        },
        onChildviewToggled: function (childView) {
            var index = this.collection.indexOf(childView.model),
                isExpanded = childView.isExpanded;

            if (isExpanded) {
                this.expandedChilds = _.union(this.expandedChilds, [index]);

                App.Analytics.licenseEvent('Show', childView.model.get('Status'));
            } else {
                this.expandedChilds = _.without(this.expandedChilds, index);
            }
            
            this.trigger('state:changed', this.expandedChilds);
        }
    });

    List.SuccessUserMovedView = App.Views.LayoutView.extend({
        template: 'license/list/success-user-moved',
        triggers: {
            'click input': 'success:click'
        }
    });

});