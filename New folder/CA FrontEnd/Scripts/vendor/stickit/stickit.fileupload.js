(function (root, $, _, Backbone, Stickit) {

    var DEFAULT_NUMBER_OF_FILES = 1;

    Stickit.addHandler({
        selector: '.file-attachment',
        events: ['fileuploadupdate', 'fileuploaddone'],

        update: function ($el, val, model, options) {
            if (options.initialized) {
                if (val) {
                    options.fileUpload.collection.reset(val);
                }
                options.fileUpload.render();
            }
        },

        onSet: function (val, options) {
            if (options.multiple) {
                var innerType = options.innerProperty;
                options.trackLinks || (options.trackLinks = {});
                return _.map(val, function (item) {
                    if (options.trackLinks[item.Id]) {
                        return options.trackLinks[item.Id]
                    } else {
                        return _.object([innerType], [item]);
                    }
                });
            }
            return val;
        },

        onGet: function (val, options) {
            if (options.initialized) {
                return val;
            }
        },

        getVal: function ($el, event, options) {
            if (options.maxNumberOfFiles > 1) {
                return options.fileUpload.files;
            } else {
                return _.first(options.fileUpload.files);
            }
        },
        initialize: function ($el, model, options) {
            options.initialized = true;
            var maxNumberOfFiles = options.maxNumberOfFiles || DEFAULT_NUMBER_OF_FILES;
            options.type || (options.type = $el.data('type'));
            var value = options.onGet.call(this, model.get(options.observe), options);
            options.fileUpload = App.request('fileupload:view', {
                files: value,
                maxNumberOfFiles: maxNumberOfFiles,
                acceptFileTypes: options.acceptFileTypes,
                maxFileSize: options.maxFileSize,
                url: options.url,
                key: options.key,
                license: options.license,
                csr: options.csr,

                remarkQuestion: options.remarkQuestion,
                remarkDescriprion: options.remarkDescriprion,

                userInfoModel: options.userInfoModel,
                requestInfo: options.requestInfo,

                analyticsRequestType: options.analyticsRequestType
            });
            $el.html(options.fileUpload.$el);
            options.update.call(this, $el, value, model, options);
        }

    });

})(window, $, _, Backbone, Backbone.Stickit)