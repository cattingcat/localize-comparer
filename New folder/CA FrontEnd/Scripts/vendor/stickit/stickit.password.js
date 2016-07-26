(function (root, $, _, Backbone, Stickit) {

    Stickit.addHandler({
        selector: 'input[type="password"]',
        initialize: function ($el, model, options) {
            var parent = $el.parent(),
                placeholder = parent.find('.password-placeholder');

            $el.focusin(function () {
                placeholder.addClass('off');
            });

            $el.blur(function () {
                var val = $el.val();
                if (!val) {
                    placeholder.removeClass('off');
                }

                model.inputValidation(options.observe, val, {
                    valid: !$el.hasClass('inp-err'),
                    blur: true
                });
            });

            placeholder.on('click', function () {
                placeholder.addClass('off');
                $el.trigger('focus');
            })

            $el.on('keyup', function () {
                var val = $el.val();
                model.inputValidation(options.observe, val, {
                    valid: !$el.hasClass('inp-err'),
                    input: true
                });
            });

            $el.on('change', function () {
                placeholder.addClass('off');
            });

            $el.on('valid', function () {
                $(this).removeClass('inp-err');
            });

            $el.on('invalid', function () {
                $(this).addClass('inp-err');
            })
        }
    });

})(this, $, _, Backbone, Backbone.Stickit)