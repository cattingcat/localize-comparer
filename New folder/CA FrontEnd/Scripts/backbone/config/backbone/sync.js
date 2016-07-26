(function (Backbone, _) {
    var _sync = Backbone.sync;

    var methods = {
        beforeSend: function (xhr) {
            this.trigger("sync:start", this);

            if (App.sendRequestIdFromUi) {
                var headerName = App.requestIdHeader,
                guid = App.Entities.generateGuid();


                if (headerName) {
                    xhr.setRequestHeader(headerName, guid);
                    xhr[headerName] = guid;
                }
            }
        },

        complete: function (resp) {
            this.trigger("sync:stop", this);

            var headerName = App.requestIdHeader,
                reqId = resp[headerName];
        }
    }

    Backbone.sync = function (method, entity, options) {
        options || (options = {});

        _.defaults(options, {
            beforeSend: _.bind(methods.beforeSend, entity),
            complete: _.bind(methods.complete, entity),
            noExceptHandler: entity.noExceptHandler
        });

        var sync = _sync(method, entity, options);

        if (!entity._fetch && method === "read") {
            entity._fetch = sync;
        }

        return sync;
    };


})(Backbone, _);
