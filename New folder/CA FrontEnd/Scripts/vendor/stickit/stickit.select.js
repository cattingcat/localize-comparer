(function (root, $, _, Backbone, Stickit) {

    Stickit.addHandler({
        selector: 'select',
        getVal: function ($el, event, options) {
            return $el.children('option:selected').val();
        },
        initialize: function ($el, model, options) {
            $el.parent().prepend('<i></i>');
            if (model.get(options.observe)) {
                $el.val(model.get(options.observe));
            }
            $el.prev().text($el.children('option:selected').text());
            model.set(options.observe, options.getVal($el));
            $el.change(function () {
                $(this).prev().text($(this).children('option:selected').text());
            });
            this.listenTo(model, 'change:' + options.observe, _.bind(function () {
                if (model.preValidate && (model.isValid(options.observe) || options.validateOnFocusOut !== false)) {
                    model.preValidate(options.observe, model.get(options.observe));
                }
            }, this));
            $el.on('valid', function () {
                $(this).removeClass('inp-err');
            });

            $el.on('invalid', function () {
                $(this).addClass('inp-err');
            });
        }
    });


})(this, $, _, Backbone, Backbone.Stickit)