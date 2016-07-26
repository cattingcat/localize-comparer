App.module("Views", function (Views, App, Backbone, Marionette, $, _) {

    Views.ItemView = Marionette.ItemView.extend({
        templateHelpers: {
            getFileSizeString: function (fileSize) {
                var size = fileSize || this.size;
                if (!size) return '';

                var suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
                var i = 0;
                while (size > 1024) {
                    size /= 1024;
                    i++;
                }
                return Number(size).toFixed(2) + ' ' + suffixes[i];
            },
            getFileNameString: function (fileName, fileNameEllipsis) {
                var maxFileNameLength = fileNameEllipsis || App.fileNameEllipsis;
                var name = fileName || this.name;
                var fpath = name.replace(/\\/g, '/');

                var ext = "";
                var fname = "";
                if (fpath.lastIndexOf('.') > 0) {
                    ext = fpath.substring(fpath.lastIndexOf('.'), fpath.length);
                    fname = fpath.substring(fpath.lastIndexOf('/') + 1, fpath.lastIndexOf('.'));
                }
                else {
                    fname = fpath.substring(fpath.lastIndexOf('/') + 1, fpath.length);
                }

                if ((fname.length + ext.length) >= maxFileNameLength) {
                    var middle = maxFileNameLength - 3;
                    return fname.substr(0, middle / 2) + '...' + fname.substr(fname.length - middle / 2, fname.length) + ext;
                } else {
                    return fname + ext;
                }
            }
        },
        serializeData: function () {
            var data = {};

            if (this.model) {
                data = Backbone.Model.prototype.toJSON.apply(this.model);
            } else if (this.collection) {
                data = { items: Backbone.Collection.prototype.toJSON.apply(this.collection) };
            }

            return data;
        }
    });
});