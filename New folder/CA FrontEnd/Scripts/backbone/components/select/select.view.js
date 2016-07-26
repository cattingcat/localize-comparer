App.module("Components.Select", function (Select, App, Backbone, Marionette, $, _) {
    'use strict';

    // ‘ункци€ дл€ форматировани€ вывода текстового пол€
    //  ”меет принимать в качестве имени пол€ как строку, так и функцию форматировани€
    function getTextFromModel(model, field) {
        var getterFunc;
        if (_.isString(field)) {
            getterFunc = function (m) { return m[field]; };
        } else if (_.isFunction(field)) {
            getterFunc = field;
        }

        if (model.attributes) {
            return getterFunc(model.attributes);
        } else {
            return getterFunc(model);
        }
    }

    // Common option for Select and SelectInput
    Select.Option = App.Views.ItemView.extend({
        template: false,
        tagName: 'option',
        onRender: function () {
            var value = this.model.get(this.options.valueField),
                text = getTextFromModel(this.model, this.options.textField);

            if (this.options.wholeModel) {
                this.$el.data('value', this.model);
            } else {
                this.$el.attr('value', value);
            }

            this.$el.attr('value', value);
            this.$el.html(text);
        }
    });

    Select.OptionInput = Select.Option.extend({
        tagName: 'span'
    });
    

    // InputSelect
    Select.LayoutInput = App.Views.CompositeView.extend({
        template: 'select/layout-input',
        className: 'spec-sel',
        childViewContainer: '.sel-area',
        childView: Select.OptionInput,
        ui: {
            input: '.sel-cust-input',
            drop: '.sel-area'
        },
        events: {
            'keyup @ui.input': 'onKeyUpInput',
            'focusout @ui.input': 'onFocusOutInput',
            'mousedown @ui.input': 'onInputClick',

            'click .sel-area span': 'onClickItem',

            'click .bt-add': 'onBtClick'
        },
        initialize: function () {
            
        },
        onBtClick: function (e) {
            if (this.$el.parent().hasClass('disabled-box')) return;
            this.ui.drop.toggleClass('off');
        },

        onInputClick: function () {
            if (this.$el.parent().hasClass('disabled-box')) return;
            if (this.ui.drop.hasClass('off'))
                this.preventFocusOut = true;

            this.toggleDropdown();
        },

        onFocusOutInput: function () {
            var prevent = this.preventFocusOut;
            _.delay(_.bind(function () {
                var el = this.ui.input,
                    val = el.val();

                this.initialValue = $.trim(val);
                this.focused = false;

                if (!val) {
                    el.val(this.options.placeholder)
                        .attr('val', '')
                        .addClass('data-placeholder');
                }

                if (!prevent) {
                    this.ui.drop.addClass('off');
                }

                this.trimVal();
            }, this), 200);
        },

        hidePlaceholder: function () {
            var el = this.ui.input;

            el.removeClass('data-placeholder');
            var val = el.val();
            if (val == this.options.placeholder) {
                el.val('');
            }

            return val;
        },

        showDropdown: function () {
            var dropEl = this.ui.drop,
                val = this.hidePlaceholder();

            this.refreshDropdown(val);
            dropEl.removeClass('off');
        },

        toggleDropdown: function () {
            var dropEl = this.ui.drop,
                val = this.hidePlaceholder();

            this.refreshDropdown(val);
            dropEl.toggleClass('off');
        },

        onClickItem: function (e) {
            var target = $(e.target),
                val = target.attr('value'),
                text = target.text();

            this.ui.input
                .val(text)
                .attr('val', val);

            this.ui.input.removeClass('data-placeholder');

            this.trimVal();

            this.initialValue = $.trim(val);

            this.ui.drop.addClass('off');
        },

        trimVal: function () {
            var el = this.ui.input,
                textEl = this.$('.spec-bt span'),
                val = el.val();

            var trimed = $.trim(val);
            if (trimed == '' || trimed == '- Not defined -' || trimed == this.options.placeholder) {
                textEl.text('');
            } else {
                textEl.text(val);
            }

            this.$el.trigger('change');
            this.trigger('change', trimed);
        },

        onRender: function () {
            var el = this.ui.input;

            el.val(this.options.placeholder)
                .attr('val', '')
                .addClass('data-placeholder');
        },

        onKeyUpInput: function (e) {
            this.$('.sel-area span').css('display', 'none');
            var val = $(e.target).val();

            this.refreshDropdown(val);

            this.trimVal();
        },

        refreshDropdown: function (val) {
            val = $.trim(val);
            if (val != this.initialValue) {
                var elements = this.options.collection.filter(_.bind(function (item) {
                    var itemText = item.get(this.options.textField).toLowerCase();
                    return itemText.indexOf(val.toLowerCase()) > -1;
                }, this));

                _.each(elements, _.bind(function (item) {
                    this.$('.sel-area span[value="' + item.get(this.options.valueField) + '"]').css('display', 'block');
                }, this));
            } else {
                this.options.collection.each(_.bind(function (item) {
                    this.$('.sel-area span[value="' + item.get(this.options.valueField) + '"]').css('display', 'block');
                }, this));
            }
        },

        childViewOptions: function () {
            return _.pick(this.options, ['textField', 'valueField']);
        },

        setValue: function (val) {
            if (_.isObject(val)) {
                val = val[this.options.valueField];
            }

            this.initialValue = val;
            var el = this.ui.input;

            if (!val) {
                // no value - add default text and placeholder and return
                el.val(this.options.placeholder);
                el.addClass('data-placeholder');
                return;
            }

            // Try to find model from collection
            var model = this.options.collection.find(_.bind(function (i) {
                return i.get(this.options.valueField).toLowerCase().indexOf(val.toLowerCase()) > -1;
            }, this));

            if (model) {
                // if found - use model

                var value = model.get(this.options.valueField),
                    text = model.get(this.options.textField);

                el.val(text).attr('val', value);
                el.removeClass('data-placeholder');
                this.trimVal();
            } else {
                // Model not found, use text-value

                el.val(val).attr('val', val);
                el.removeClass('data-placeholder');
                this.trimVal();
            }
        },

        getValue: function () {
            var actualVal = this.ui.input.val();

            if (!actualVal || this.ui.input.hasClass('data-placeholder'))
                return this.options.defaultValue;

            return actualVal;
        }
    });



    // Select
    Select.Layout = App.Views.CompositeView.extend({
        template: 'select/layout',
        tagName: 'span',
        className: 'sel-cust',
        childViewContainer: 'select',
        childView: Select.Option,
        events: {
            'change select': 'onChange'
        },
        ui: {
            select: 'select',
            textEl: 'i'
        },

        childViewOptions: function () {
            return _.pick(this.options, ['textField', 'valueField', 'wholeModel']);
        },

        onChange: function (e) {
            var selectOpt = this.$('option:selected'),
                text = selectOpt.text(),
                val = selectOpt.val();

            this.setText(val, text);
            this.trigger('change', val);
        },

        setValue: function (val) {
            if (!val || val == "null") {
                this.setText();
                return;
            }

            // value is BackboneModel
            if (_.isObject(val)) {
                var text = getTextFromModel(val, this.options.textField);

                if (!this.options.wholeModel) {
                    var value = val[this.options.valueField];
                    this.setText(value, text);
                } else {
                    this.setText(val, text);
                }

            } else { // value is a string
                var criteria = {};
                criteria[this.options.valueField] = val;
                var model = this.collection.findWhere(criteria);

                if (model) {
                    var text = getTextFromModel(model, this.options.textField),
                        value = model.get(this.options.valueField);

                    this.setText(value, text);
                } else {
                    App.error('Couldnt find model for this value');
                }
            }
        },

        setText: function(value, text) {
            if (!value) {
                this.ui.textEl.text(this.options.placeholder || '---').addClass('data-placeholder');
                this.ui.select.val('');
            } else {
                this.ui.select.val(value);
                this.ui.textEl.text(text).removeClass('data-placeholder');
            }
        },

        getValue: function () {
            if (this.options.wholeModel) {
                return this.$('option:selected').data('value');
            }
            return this.ui.select.val();
        }
    });

    //глобальный обработчик, скрывающий все .spec-sel выпадающие списки при клике вне их области, объ€вл€етс€ 1 раз (данное решение необходимо дл€ поддержки вертикального скрола с выпадающим списком в IE11)
    $(document).on('click.select-component-dropdown', function (event) {
        var selectEl = $(event.target).closest(".spec-sel");
        if (selectEl == null || selectEl.length) return;
        $('.spec-sel .sel-area').addClass("off");
    });
});