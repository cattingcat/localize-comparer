(function (root, $, _, Backbone, Stickit) {

    Stickit.addHandler({
        selector: 'input[type="checkbox"]',
        events: ['change'],
        update: function ($el, val, model, options) {
            var checked = _.isBoolean(val) ? val : val === $el.val();
            $el.attr('checked', checked).prop('checked', checked);
            if (checked) {
                $el.addClass('checked');
                $el.next().addClass('checked');
            } else {
                $el.removeClass('checked');
                $el.next().removeClass('checked');
            }
        },
        getVal: function ($el, event, options) {
            return $el.is(':checked');
        },
        initialize: function ($el, model, options) {
            //_.each(this.bindings, function (item, val) {
            //    options.update($el, options.getVal($el, null, options), model, options);
            //});
            $el.on('change', _.bind(function (e) {
                options.update($(e.target), options.getVal($(e.target), e, options), model, options);
            }, this));
        }
    });


})(this, $, _, Backbone, Backbone.Stickit)