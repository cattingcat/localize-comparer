var BackboneHelpers = {};

BackboneHelpers.trimObject = {
    onGet: function (val) {
        return $.trim(val);
    },
    onSet: function (val, binding) {
        var trimVal = $.trim(val);
        if (val != trimVal) {
            this.$el.find(binding.selector).val(trimVal);
        }
        return trimVal;
    }
};

BackboneHelpers.ajaxError = function (model, resp, options) {
    options = options || {};
    var moduleName = options.moduleName || '';
    var errors = options.errors || [];
    var showWrapper = options.showWrapper || false;

    if (resp.responseJSON && resp.responseJSON.ModelState) {
        var errorName = resp.responseJSON.ModelState[""] && resp.responseJSON.ModelState[""][0] ? resp.responseJSON.ModelState[""][0] : '';

        if (_.isArray(errors) && errors.indexOf(errorName) > -1) {
            model.set('error', App.request('resource:text', moduleName + 'errors/' + errorName));
            model.validate();
            model.set('error', null);
        }

        return;
    }

    var errorCode = resp.responseJSON && resp.responseJSON.Code;
    if (errorCode) {
        var errorName = errorCode ? errorCode : '';

        if (_.isArray(errors) && errors.indexOf(errorName) > -1) {
            var errorTitle = App.request('resource:text', moduleName + 'errors/' + errorName);
            var errorDescription = App.request('resource:text', moduleName + 'errors/' + errorName + 'Description');
        } else {
            var errorTitle = App.request('resource:text', moduleName + 'errors/UnknownError');
            var errorDescription = App.request('resource:text', moduleName + 'errors/UnknownErrorDescription');
        }

        this.errorView = this.getErrorView(new Backbone.Model({
            errorTitle: errorTitle,
            errorDescription: errorDescription
        }));

        if (showWrapper) {
            this.modalWrapper = App.request('modal:wrapper', { contentView: this.errorView });
            this.show(this.modalWrapper, { loading: false });
        } else {
            this.modalWrapper.setContent(this.errorView);
        }
    }
};