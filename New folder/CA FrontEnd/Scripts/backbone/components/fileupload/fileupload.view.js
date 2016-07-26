App.module("Components.FileUpload", function (FileUpload, App, Backbone, Marionette, $, _) {

    FileUpload.ErrorView = App.Views.LayoutView.extend({
        template: 'fileupload/upload-error',
        regions: {
            errorsListRegion: '.file-errors-list-region'
        },
        serializeData: function () { return this.options; }
    });

    FileUpload.ErrorItem = App.Views.ItemView.extend({
        template: "fileupload/error-item"
    });

    FileUpload.ErrorList = App.Views.CollectionView.extend({
        childView: FileUpload.ErrorItem
    });
    
    FileUpload.Layout = App.Views.LayoutView.extend({
        tagName: 'div',
        template: 'fileupload/layout-file',
        events: {
            'fileuploaddone': 'onDone',
            'fileuploadfail': 'onFail',
            'fileuploadadd': 'onAdd',
            'fileuploaddestroy': 'onDel',
            'fileuploadprocessfail': 'onProcessFail',
            //'click .bt-load': 'onUploadClick'
            'mousedown input[type="file"]': 'onUploadClick',
            'drop input[type="file"]': 'onUploadClick'
        },

        initialize: function (options) {
            this.options = options || {};

            this.acceptFileTypes = this.options.acceptFileTypes;
            this.url = this.options.url;
            this.maxNumberOfFiles = this.options.maxNumberOfFiles;
            this.maxFileSize = this.options.maxFileSize || (+App.limits.maxFileSize);
            this.files = this.options.files;
            this.requestInfo = this.options.requestInfo;

            //Общий Guid всех файлов, для последующей агрегации в одну папку на сервере
            //this.tempFolderGuid = {
            //    "name": "tempFolderGuid." + App.Entities.generateGuid(),
            //    "value": ""
            //};

            // В эту коллекцию попадают все добавленные файлы, но могут быть еще не загруженные на сервер
            this.formFileData = [];
            // В эту коллекцию файлы попадают только после того как будут отправлены на сервер
            this.listenTo(this.collection, 'add remove reset', this.sync);

            //Настройки спиннера, который показывается рядом с загружаемым файлом
            this.spinnerOpts = {
                lines: 7,              // The number of lines to draw
                length: 4,              // The length of each line
                radius: 2,              // The radius of the inner circle
                top: '-2px',            // # Top position relative to parent in px
                left: '2px'           // # Left position relative to parent in px
            };

            _.defaults(this.spinnerOpts, App.request('loading:defaults:spinner'));
        },

        onRender: function () {
            var self = this;
            var $form = this.$('form');

            $form.fileupload({
                url: this.url,
                acceptFileTypes: this.acceptFileTypes,
                processData: false,
                autoUpload: true,
                isFileUpload: true,//флаг-признак для Backbone.ajax
                contentType: false,
                cache: false,
                hasContent: true,
                maxChunkSize: (+App.limits.maxChunkSize),
                formData: function (form, o) {
                    var file = _.first(o.files);
                    //Отправляем метаинформацию вместе с файлом, для последующего точного сопоставления 
                    //(отправляем новое имя файла, полученное в chunkdone)
                    var formArray = form.serializeArray();

                    formArray.push(file.fileDataFileName);
                    formArray.push({
                        "name": "tempFolderGuid",
                        "value": self.requestInfo.get("uploadId")
                    });
                    formArray.push({
                        "name": "RequestInfoHash",
                        "value": self.requestInfo.get("hash")
                    });

                    return formArray;
                },
                downloadTemplate: JST['components/fileupload/templates/download'],
                uploadTemplate: JST['components/fileupload/templates/upload'],
                getFilesFromResponse: _.bind(this.getFilesFromResponse, this),
                maxNumberOfFiles: this.maxNumberOfFiles,
                maxFileSize: this.maxFileSize,
                messages: {
                    maxFileSize: Globalize.formatMessage('fileupload/errors/maxFileSize'),
                    minFileSize: Globalize.formatMessage('fileupload/errors/minFileSize'),
                    acceptFileTypes: Globalize.formatMessage('fileupload/errors/acceptFileTypes'),
                    maxNumberOfFiles: Globalize.formatMessage('fileupload/errors/maxNumberOfFiles')
                },
                destroy: function (e, data) {
                    var that = $(this).data('blueimp-fileupload') || $(this).data('fileupload');
                    that._transition(data.context).done(function () {
                        $(this).remove();
                        that._trigger('destroyed', e, data);
                        self.sync();
                    });
                },
                progress: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('div[data-id="' + data.files[0].id + '"]').css('width', progress + '%');
                },

                chunksend: function (e, data) {
                    var fileId = _.first(data.files).id;
                    self.toggleCancel(fileId, true);
                },
                pauseUpload: function (data) {
                    var fileId = _.first(data.files).id;
                    self.toggleCancel(fileId, false);
                },
                resumeUpload: function (data) {
                    var fileId = _.first(data.files).id;
                    self.toggleCancel(fileId, true);
                },

                chunkdone: function (e, data) {
                    var file = _.first(data.files);
                    //Важно! После окончания загрузки чанка сохраняем новое имя файла (файл может быть переименован), 
                    //т.к. на сервере уже создан файл с этим именем и мы будем "дозаливать" в него
                    file.fileDataFileName = {
                        name: "filename",
                        value: data.result.file.Name
                    };
                },

                addingfailed: function (e, data) {
                    self.removeFileFromList(data.files[0].id);
                    if (data.context) {
                        data.context.remove();
                        data.files.length = 0;
                    }
                }
            });

            var e = $.Event("fileuploaddone");
            $form.fileupload('option', 'done').call($form[0], e, {
                result: {
                    files: (this.collection && this.collection.toJSON())
                }
            });

            var msg;
            if (this.maxFileSize === App.limits.amrMaxFileSize) {
                msg = Globalize.formatMessage('fileupload/file/amrFile');
            } else {
                msg = Globalize.formatMessage('fileupload/file/commonFile');
            }
            this.$('.file-req').html(msg);

            this.syncNumberOfFiles();

            return this;
        },

        serializeData: function () {
            return {
                multiple: (this.maxNumberOfFiles > 1),
                remarkQuestion: this.options.remarkQuestion,
                remarkDescriprion: this.options.remarkDescriprion
            };
        },

        // Нажатие на кнопку отправки файла
        onUploadClick: function (ev) {
            if (this.maxNumberOfFiles <= this.collection.length) {
                ev.stopPropagation();
                ev.preventDefault();
            } else if (!this.checkAgreement()) {
                ev.stopPropagation();
                ev.preventDefault();
                this.trigger('fileAgreement:call');
            } else {
                this.trigger('fileupload:select:click');
            }
        },

        // синхронизция модели-коллекции файлов и представления
        sync: function (item, coll, state) {
            this.files = this.collection.toJSON();
            this.$el.trigger('fileuploadupdate');
            this.syncNumberOfFiles();
        },

        // Сонхронизация кол-ва файлов с представлением, отображаем или прячем кнопку загрузки
        syncNumberOfFiles: function () {
            var canUpload = (this.maxNumberOfFiles > this.formFileData.length);
            this.$('.fileupload-buttonbar').toggleClass('off', !canUpload);
            return canUpload;
        },

        // Проверка соглашения о загрузке файлов
        checkAgreement: function () {
            var userInfo = this.options.userInfoModel.toJSON(),
                accepted = userInfo.AcceptedVersion,
                current = userInfo.CurrentVersion;
            return accepted === current;
        },

        // Отображаем/прячем кнопку отмены для файла с заданным ID
        toggleCancel: function (id, state) {
            var cancelBtn = this.$('#' + id + '-cancel'),
                cancelSpinner = this.$('#' + id + '-spinner');
            cancelBtn.toggleClass('off', !state);
            cancelSpinner.toggleClass('off', state);
            cancelSpinner.spin(!state && this.spinnerOpts);
        },

        // Выбрасываем событие, если при прикреплении файла возникла ошибка
        triggerError: function (file, errorMsg, resp) {
            errorMsg = errorMsg || Globalize.formatMessage('fileupload/errors/uploadError');

            this.trigger('fileAttachError:call', file, errorMsg, resp);
        },

        removeFileFromList: function (fileId) {
            var model = this.collection.find(function (model) {
                return model.fileId === fileId;
            });
            this.collection.remove(model);

            var formFileData = this.formFileData;
            for (var i in formFileData) {
                if (formFileData.hasOwnProperty(i)) {
                    if (formFileData[i].id === fileId) {
                        formFileData.splice(i, 1);
                        break;
                    }
                }
            }

            this.syncNumberOfFiles();
        },

        getFilesFromResponse: function (data) {
            var files = [];
            
            if (_.isArray(data.files) && data.files.length > 0 && data.result) {
                var file = data.result.file;
                files.push($.extend(true, {
                    id: data.files[0].id,
                    name: file.Name,
                    getFileSizeString: this.templateHelpers.getFileSizeString,
                    getFileNameString: this.templateHelpers.getFileNameString,
                    size: file.ContentLength,
                    context: this.options
                }, file));
            }

            return files;
        },


        // Добавление нового файла
        onAdd: function (e, data) {
            var file = _.first(data.files);

            if (this.formFileData.length >= this.maxNumberOfFiles) {
                var msg = Globalize.formatMessage('fileupload/errors/maxNumberOfFiles');
                this.triggerError(file, msg, null);
                return false;
            }

            file.id = App.Entities.generateGuid();
            file.getFileSizeString = this.templateHelpers.getFileSizeString;
            file.getFileNameString = this.templateHelpers.getFileNameString;
            file.context = this.options;
            file.fileDataFileName = {
                "name": "filename",
                "value": file.name
            };

            this.formFileData.push(file);

            this.syncNumberOfFiles();
            
            return true;
        },

        // Файл добавлен и отправлен на сервер
        onDone: function (e, data) {
            if (data.result) {
                var file = data.result.file;
                var model = new Backbone.Model(file);
                model.fileId = data.files[0].id;
                this.collection.add(model);
                this.trigger('fileupload:file:attached');
            }
            // Фикс для IE11. Если нет элемента в фокусе или этот элемент кнопка удаления - событие клика не отрабатывает
            $('body').focus();
        },

        // Удаление файла из списка
        onDel: function (e, data) {
            var model = this.collection.find(function(model) {
                return model.fileId === data.id;
            });
            if (!model) return;

            //Вызов удаления файла на сервере
            App.request('file:delete:model', model.toJSON()).save(null, {
                success: function () { App.log('file deleted successfully') },
                error: function () { App.warn('file not deleted on server') }
            });

            this.removeFileFromList(data.id);

            this.trigger('fileupload:file:delete');
        },

        // Ошибка при отправке файла на сервер
        onFail: function (e, data) {
            var failedFile = _.first(data.files),
                resp = data.jqXHR;

            failedFile.error = true;

            this.removeFileFromList(failedFile.id);
            if (data.context) {
                data.context.remove();
                data.files.length = 0;
            }

            if (!resp) {
                // Ошибка при обновлении токена, обработается раньше
                // this.triggerError(failedFile, null, null);
                return;
            }

            // Если это не пользователь отменил аплоад - выбрасываем ошибку
            if (resp.statusText !== 'abort') {
                this.triggerError(failedFile, null, resp);
            }
        },

        // Ошибка в процессе добавления
        onProcessFail: function (e, data) {
            var file = data.files[0];
            this.triggerError(file, file.error, null);
            file.error = true;
            //this.$('.process-err').text(data.files[0].error).removeClass('off');
        }
    });
});