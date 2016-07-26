App.module("Components.FileUpload", function (FileUpload, App, Backbone, Marionette, $, _) {
    FileUpload.Controller = App.Controllers.Base.extend({
        initialize: function (options) {
            this.files = App.request('file:collection:instance');

            var layoutOpts = _.extend(this.options, { collection: this.files });
            this.layoutView = new FileUpload.Layout(layoutOpts);

            this.listenTo(this.layoutView, 'fileAgreement:call', this.onFileAgreementCall);
            this.listenTo(this.layoutView, 'fileAttachError:call', this.onFileAttachError);
            this.listenTo(this.layoutView, 'fileupload:select:click', this.onFileSelectClick);
            this.listenTo(this.layoutView, 'fileupload:file:attached', this.onFileAttached);
            this.listenTo(this.layoutView, 'fileupload:file:delete', this.onFileDelete);
            

            // Агреггированый список ошибок
            this.fileAttachErrors = App.request('file:collection:instance');
            
            // Модальное окно с ошибками
            this.errorlView = null;

            this.listenTo(options.requestInfo, 'change:info', this.onRequestInfoChange);

            this.analyticsRequestType = options.analyticsRequestType;
        },

        onFileSelectClick: function () {
            App.Analytics.newRequestAddFileEvent(this.analyticsRequestType, 'Initiate');
        },

        onFileAttached: function () {
            App.Analytics.newRequestAddFileEvent(this.analyticsRequestType, 'Success');
        },

        onFileDelete: function () {
            App.Analytics.newRequestAddFileEvent(this.analyticsRequestType, 'Delete file');
        },

        onFileAgreementCall: function () {
            this.fileAgreementModel = new Backbone.Model();

            App.request('fileAgreements:view', {
                model: this.fileAgreementModel,
                region: App.modalRegion,
                analyticsRequestType: this.analyticsRequestType,
                analyticsCategory: 'New request',
                success: _.bind(function () {
                    this.options.userInfoModel.set('AcceptedVersion', this.options.userInfoModel.get('CurrentVersion'));
                }, this)
            });
        },

        // При зыкрытии модального окна с ошибками - очищаем коллекцию
        onAttachErrorClose: function () {
            this.fileAttachErrors.reset();
            this.errorlView = null;
        },

        onFileAttachError: function (file, errorMsg, resp) {
            // Парсим ответ сервера
            if (resp && resp.responseJSON) {
                var json = resp.responseJSON;
                if (json.ModelState) {
                    var msg = _.first(_.values(json.ModelState));
                    var code = _.first(msg[0].split('|'));
                    json.Code = code;
                }

                var t = App.ErrorLocalizer.getErrorText('fileupload/errors', resp);
                errorMsg = t.text;
            }

            App.Analytics.newRequestAddFileError(this.analyticsRequestType, resp, errorMsg);

            // Добавляем новую ошибку в список, она автоматически отобразится на модалке
            this.fileAttachErrors.add({ file: file, error: errorMsg });

            // Если окно есть, то ошибка автоматически в него выведется
            if (this.errorlView) return;

            this.errorlView = new FileUpload.ErrorView({
                title: Globalize.formatMessage('fileupload/attachError')
            });
            this.showModalError("", "", {
                region: App.modalRegion,
                errorView: this.errorlView
            });
            
            var errorsListView = new FileUpload.ErrorList({ collection: this.fileAttachErrors });
            this.errorlView.errorsListRegion.show(errorsListView);

            this.listenTo(this.modalWrapper, 'modal:hide', _.bind(this.onAttachErrorClose, this));
        }
    });


    App.reqres.setHandler("fileupload:view", function (options) {
        var controller = new FileUpload.Controller(options);
        return controller.layoutView;
    });
});