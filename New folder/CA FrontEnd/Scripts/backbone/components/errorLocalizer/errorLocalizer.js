App.module("ErrorLocalizer", function (ErrorLocalizer, App, Backbone, Marionette, $, _) {
    "use strict";

    var glob = _.bind(Globalize.formatMessage, Globalize);

    // path - путь в файлах локализации, или несколько путей, упорядоченных по приоритету
    // resp - ответ сервера, должен содержать Code и  Type
    // options - опции, которые передаются в Globalize.formatString()
    ErrorLocalizer.getModalText = function (path, resp, options) {
        if (!resp) App.error('Incorrect call response are empty');

        var data = resp.responseJSON || {};

        if (!data.Code) App.error('Incorrect call response.Code are empty');

        var fullKey = false,
            obj = false;

        if (data.Type) fullKey = data.Type + '_' + data.Code;

        path = _.flatten([path]);

        for (var i = 0; i < path.length; ++i) {
            var p = path[i];

            if (fullKey) {
                obj = glob(p + '/' + fullKey);
                if (!_.isEmpty(obj)) {
                    return {
                        title: obj.title(options),
                        text: obj.text(options)
                    };
                }
            }

            obj = glob(p + '/' + data.Code);
            if (!_.isEmpty(obj)) {
                return {
                    title: obj.title(options),
                    text: obj.text(options)
                };
            }
        }


        obj = glob('errors/' + data.Code);
        if (!_.isEmpty(obj)) {
            return {
                title: obj.title(options),
                text: obj.text(options)
            };
        }

        obj = glob(_.first(path) + '/UnknownError');
        if (!_.isEmpty(obj)) {
            return {
                title: obj.title(options),
                text: obj.text(options)
            };
        }

        obj = glob('errors/UnknownError');
        if (!_.isEmpty(obj)) {
            return {
                title: obj.title(options),
                text: obj.text(options)
            };
        }

        App.error('Localization error while error messages receiving');
    };

    ErrorLocalizer.getErrorText = function (path, resp, options) {
        if (!resp) App.error('Incorrect call response are empty');

        var data = resp.responseJSON || {};

        if (!data.Code) App.error('Incorrect call response.Code are empty');

        var fullKey = false,
            obj = false;

        if (data.Type) fullKey = data.Type + '_' + data.Code;

        path = _.flatten([path]);

        for (var i = 0; i < path.length; ++i) {
            var p = path[i];

            if (fullKey) {
                obj = glob(p + '/' + fullKey);
                if (!_.isEmpty(obj)) {
                    return { text: obj };
                }
            }

            obj = glob(p + '/' + data.Code);
            if (!_.isEmpty(obj)) {
                return { text: obj };
            }
        }


        obj = glob('errors/' + data.Code);
        if (!_.isEmpty(obj)) {
            return { text: obj };
        }

        obj = glob(_.first(path) + '/UnknownError');
        if (!_.isEmpty(obj)) {
            return { text: obj };
        }

        obj = glob('errors/UnknownError');
        if (!_.isEmpty(obj)) {
            return { text: obj.text };
        }

        App.error('Localization error while error messages receiving');
    };

});