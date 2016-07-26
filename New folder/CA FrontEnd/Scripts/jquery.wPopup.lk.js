/* &copy; 2013 Kaspersky Lab ZAO. All Right Reserved. */
jQuery.fn.wPopupLK = function (options) {
    var options = jQuery.extend({
        node: '',
        opacity: '0.5',
        duration: 480
    }, options);

    function resizeLK() {
        var node = $('#wPopup-cont');
        var mrLeft = ($(window).width() - node.width()) / 2;
        var mrTop = ($(window).height() - node.height()) / 2;
        node.css({ 'left': mrLeft + 'px', 'top': mrTop + 'px' });
    }

    return this.each(function () {

        $('#wPopup-over:visible').trigger('click');

        if (!options.node) return false;

        var node = $('#' + options.node.attr('data'));
        if (!node.length > 0) return false;

        $('body').prepend('<div id="wPopup-over" style="position:fixed; z-index:7500; width:100%; height:100%; background:#000; opacity:' + options.opacity + ';" class="ie-opacity"></div>')
        .append('<div id="wPopup-cont" style="position:fixed; z-index:8000; left:0; top:0; max-width:100%; width:auto; display:none;"></div>');

        var contNode = node.clone(true);
        contNode.appendTo($('#wPopup-cont')).removeClass('off');
        node.remove();

        resizeLK();

        $('#wPopup-over, #wPopup-cont').stop().fadeIn(options.duration);

        $(window).bind("resize scroll", function () { resizeLK(); });

        $('#wPopup-over, .wp-close').bind('click', function () {
            $(window).unbind("resize scroll");
            $('#wPopup-over, .wp-close').unbind('click');
            contNode.appendTo('body').addClass('off');
            $('#wPopup-over, #wPopup-cont').stop().fadeOut(options.duration);
            $('#wPopup-over, #wPopup-cont').remove();
            return false;
        });


    });

}