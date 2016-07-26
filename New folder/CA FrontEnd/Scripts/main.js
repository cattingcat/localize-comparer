$(document).ready(function () {

    function brdResize() {
        $('.v-resize').each(function () {
            $(this).height($(this).parent().innerHeight());
        });
    };

    brdResize();

    /* function for folder-triggers */
    $('.folder-names a').click(function () {
        var curNode = $(this).parent().find('.cur');
        if (curNode) {
            $('#' + curNode.attr('data')).addClass('off');
            curNode.removeClass('cur');
        }
        $('#' + $(this).attr('data')).removeClass('off');
        brdResize();
        $(this).addClass('cur');
        return (false);
    });
    /* run only after click-function - start position */
    $('.folder-names a:first').trigger('click');

    /* add tags for picture-button, corner-elements */
    $('.pre-em').each(function () {
        $(this).prepend('<em></em>');
    });
    $('.app-em').each(function () {
        $(this).append('<em></em>');
    });

    /* on-off add-area */
    $('.open-area').click(function () {
        $(this).toggleClass('close-area').next().toggleClass('off');
        brdResize();
        return (false);
    });

    /* notices popup-win */
    $('.link-modal-win').click(function () {
        $(window).wPopupLK({ 'node': $(this), 'opacity': '0.4', 'duration': '240' });
        return (false);
    });

    /*  remarks */
    $('a.sub-remark').click(function () {
        $(this).next().removeClass('off');
        return (false);
    });
    $('.remark-area a.re-close').click(function () {
        $(this).parent().addClass('off');
        return (false);
    });

    $(document).mouseup(function () {
        var node = $('.remark-area:not(.off)');
        if (node.length != 0) node.addClass('off');
    });

    /* textarea - tools */
    $('textarea.txt').focusin(function () {
        var node = $(this).next();
        node.find('.ta-edit').addClass('off'); node.find('.ta-save').removeClass('off');
    });
    $('.ta-edit').click(function () {
        $(this).parent().prev().trigger('focusin').focus();
        return (false);
    });

    $('textarea.txt').focusout(function () {
        var node = $(this).next();
        node.find('.ta-edit').removeClass('off'); node.find('.ta-save').addClass('off');
    });

    /* change style a-filter */
    $('.a-filter').click(function () {
        $(this).toggleClass('a-filter-back');
        return (false);
    });


    /* ============================================================================== */
    /* init custom select and date */
    // начальная инициализация отображаемого текста при загрузке страницы
    $('select').each(function () {
        $(this).parent().prepend('<i></i>');
        $(this).prev().text($(this).children('option:selected').text());
    });
    // и чекбоксов
    $('label').each(function () {
        var node = $('#' + $(this).attr('for'));
        if (node.attr("checked")) $(this).addClass("checked");
    });

    // изменение текста при изменении select
    $('select').change(function () {
        $(this).prev().text($(this).children('option:selected').text());
    });

    // изменение чекбокса
    $('label').click(function () {
        var node = $('#' + $(this).attr('for'));
        // клик по чекбоксу
        //if (node.attr("type") == "checkbox") {

        //    if (!node.attr("checked")) { node.attr("checked", "checked"); $(this).addClass("checked"); }
        //    else { node.removeAttr("checked"); $(this).removeClass("checked"); }
        //    /* add для соглашений */
        //    if (node.attr("data") != '') {
        //        var cont = $('#' + node.attr("data"));
        //        if (node.attr('checked')) { cont.find('span').addClass('off'); cont.find('a').removeClass('off'); }
        //        else { cont.find('span').removeClass('off'); cont.find('a').addClass('off'); }
        //    }

        //}
            // клик по радио
        if (node.attr("type") == "radio") {
            node.siblings('[checked]').removeAttr("checked").next().removeClass("checked");
            $(this).addClass("checked").prev().attr("checked", "checked");
        }
    });


    /* ============ click-clear fields input && psw =========== */
    $('[type="text"]').each(function () {
        $(this).attr('name', $(this).val())
    });

    /* if value=default, clear field  */
    $('[type="text"]').focusin(function () {
        $(this).addClass('focus');
        if (!$(this).is('.no-clear') && $(this).val() == $(this).attr('name')) $(this).val('');
    });

    /* if value empty, add default help  */
    $('[type="text"]').focusout(function () {
        if ($(this).val() == '') $(this).val($(this).attr('name')).removeClass('focus');
    });

    /* show password */
    $('.psw').focus(function () {
        $(this).addClass('off');
        $(this).next().removeClass('off').trigger('focus');
    });

    /* if psw value empty, show default help  */
    $('[type="password"]').focusout(function () {
        if ($(this).val() == '') $(this).addClass('off').prev().removeClass('off');
        else $(this).prev().val($(this).prev().attr('name'));
    });

    /* for textarea */
    $('textarea').each(function () {
        $('textarea').html($(this).attr('value'));
    });
    $('textarea').focusin(function () {
        if ($(this).html() == $(this).attr('value')) $(this).html('');
    });
    $('textarea').focusout(function () {
        if ($(this).html() == '') $(this).html($(this).attr('value'));
    });

    /* скрипт для радио-чеков */
    $('[type="radio"][data!=""]').change(function () {
        var node = $('#' + $(this).attr('name'));
        if ($(this).attr('data') == 'on') { if (node.hasClass('off')) node.removeClass('off'); }
        else { if (!node.hasClass('off')) node.addClass('off'); }
    });

    /* скрипт для логин-рег */
    $('.info-txt i').hover(
        function () { $(this).find('span').removeClass('off'); },
        function () { $(this).find('span').addClass('off'); }
    );




    /* ================================  */
    /* скрипт для спец-селектора с добавлением\фильтрацией */

    var list1 = "<span>Полный</span><span>список</span><span>филиалов</span>";
    var list2 = "<span>Список</span><span>филиалов</span><span>по фильтру</span>";

    $('.spec-sel input').bind("focus change click keydown keyup keypress", function () {
        var areaCont;
        if ($(this).val() == '') areaCont = list1; else areaCont = list2;
        $(this).siblings('.sel-area').html(areaCont).removeClass('off');

        /* вешаем обработчик на выбор */
        $(this).siblings('.sel-area').children('span').bind("click", function () {
            $(this).parent().siblings('input').val($(this).html()).trigger('focusout');
            $(this).parent().addClass('off');
        });
        /* == */

    });

    /* клик вне селектора */
    $(document).click(function (event) {
        if ($(event.target).closest(".spec-sel .sel-area, .spec-sel input").length) return;
        if ($(event.target).closest(".spec-sel .bt-add").length) {
            $('.spec-sel .spec-bt span').html($('.spec-sel input').val());
            $('.spec-sel input').addClass("off");
            $('.spec-sel .bt-add').addClass("off");
            $('.spec-sel .spec-bt').removeClass("off");
        }
        $('.spec-sel .sel-area span').unbind("click");
        $('.spec-sel .sel-area').addClass("off");
        event.stopPropagation();
    });
    /* ====================================== */


    /* end */
});