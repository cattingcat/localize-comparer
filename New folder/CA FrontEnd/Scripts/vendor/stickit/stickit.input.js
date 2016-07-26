(function (root, $, _, Backbone, Stickit) {

    var handler = {
        update: function ($el, val, model, options) {
            if (val) {
                $el.val(val);
                $el.removeClass('data-placeholder');
            } else {
                $el.val($el.attr('data-placeholder'));
                $el.addClass('data-placeholder');
            }
        },
        onSet: function (text, options) {
            var el = this.$(options.selector),
                placeholded = el.hasClass('data-placeholder');

            if (placeholded) {
                return '';
            }

            var retVal = $.trim(text);
            if (options.toLower) {
                retVal = retVal.toLowerCase();
            }
            return retVal;
        },
        initialize: function ($el, model, options) {
            /* if value=default, clear field  */
            $el.focusin(function () {
                var el = $(this),
                    placeholder = el.attr('data-placeholder');

                $el.attr('spellcheck', true);

                el.addClass('focus');
                if (!el.is('.no-clear') && el.val() == placeholder) {
                    el.val('');
                    $el.removeClass('data-placeholder');
                }
            });

            /* if value empty, add default help  */
            $el.blur(function () {
                var el = $(this),
                    placeholder = el.attr('data-placeholder');

                el.removeClass('focus');

                var val = el.val(),
                    /*  формат маски для jQuery masked input 
                        Маска записывается как значение инпута,
                        поэтому нужно проверять введено ли что-то кроме маски   */
                    maskRegex = /^[-_]*$/gi; 

                if (val == '' || (el.hasClass('masked') && maskRegex.test(val))) {
                    val = '';
                    el.val(placeholder);
                    $el.addClass('data-placeholder');
                    $el.attr('spellcheck', false);
                }

                model.inputValidation(options.observe, val, {
                    valid: !$el.hasClass('inp-err'),
                    blur: true
                });

                //if ($el.updateInterval) clearInterval($el.updateInterval);
            });

            $el.on('keyup', function (ev) {
                var val = $el.val();
                model.inputValidation(options.observe, val, {
                    valid: !$el.hasClass('inp-err'),
                    input: true
                });
            })

            $el.on('valid', function () {
                $(this).removeClass('inp-err');
            });

            $el.on('invalid', function () {
                $(this).addClass('inp-err');
            })
        }
    };

    handler.selector = 'input[type="text"]';
    Stickit.addHandler(handler);

    handler.selector = 'textarea';
    Stickit.addHandler(handler);

})(this, $, _, Backbone, Backbone.Stickit)