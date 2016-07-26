(function ($, _, Validation) {
    "use strict";

    _.extend(Validation.callbacks, {
        selector: "data-attribute",

        valid: function (view, attr, sel) {
            // Поиск CSS селектора для элемента, на который биндится проперти модели
            var selector = _.findKey(view.bindings, function (propDescr, selector) {
                return (propDescr == attr || propDescr.observe == attr);
            });

            // Получение соответствующего контрола и запуск события валидации, 
            //  UI-компонент ввода сам знает как подсветить себя невалидным
            var control = view.$(selector);
            control.trigger('valid');

            if (view.validationError) {
                view.validationError(attr, null);
            }
        },

        invalid: function (view, attr, error, sel) {
            var selector = _.findKey(view.bindings, function (propDescr, selector) {
                return (propDescr == attr || propDescr.observe == attr);
            });

            var control = view.$(selector);
            control.trigger('invalid');

            if (view.validationError) {
                view.validationError(attr, error, {});
            }
        }
    });
})($, _, Backbone.Validation);