var App = (function (_, $, Backbone, Marionette, Globalize, moment) {
    'use strict';

    var App = new Marionette.Application();

    App.addRegions({
        headerRegion: '#header-region',
        notifRegion: '#notification-region',
        lecenseErr: '#license-error-region',
        mainRegion: '#main-region',
        backdropRegion: '#backdrop-region',
        footerRegion: '#footer-region',
        modalRegion: '#main-modal-region'
    });

    App.on('start', function (options) {
        App.HeaderApp.show();

        if (!App.enableLogging || typeof console.log !== "function") {
            var f = function () { };
            App.log = f;
            App.warn = f;
            App.error = f;
        }

        this.getVersionsInfo();

        this.startHistory();

        App.commonErrorCodes = App.commonErrorCodes.split(',');
        App.tokenErrorCodes = App.tokenErrorCodes.split(',');

        // Run push notification if user authorized
        if (App.request('auth:isAuthorized')) {
            _.defer(function () { App.execute('hub:start'); });
        }
    });

    App.commands.setHandler('page:reload', function () {
        Backbone.ajax = function () { };
        window.location.reload(true);
    });

    $(document).keyup(function (e) {
        switch (e.keyCode) {
            // enter
            case 13:
                App.vent.trigger('enter:press', e);
                break;

            // escape key maps to keycode `27`
            case 27:
                App.vent.trigger('esc:press', e);
                break;
        }
    });

    $(window).on('resize scroll', function (e) {
        App.vent.trigger('window:resize', e);
    });

    $(window).on('scroll', function (e) {
        App.vent.trigger('window:scroll', e);
    });

    // IE8 fix
    if (typeof console.log === "function") {
        App.log = _.bind(console.log, console);
        App.warn = _.bind(console.warn, console);
        App.error = _.bind(console.error, console);
    } else {
        var f = function () {

        };
        App.log = f;
        App.warn = f;
        App.error = f;
    }

    App.getVersionsInfo = function() {
        var el = $('#assembly-info tbody');
        if (el.length != 0) {
            $.ajax({
                type: 'Get',
                dataType: 'json',
                url: '/api/Diagnostic/GetVersionsInfo',
                success: function (data) {
                    var item = $('<tr><td>Version UI:</td> <td>' + data.VersionUi + '</td></tr>');
                    el.append(item);
                    var item = $('<tr><td>Version Services:</td> <td>' + data.VersionServices + '</td></tr>');
                    el.append(item);
                },
                error: function (resp) {
                    App.error('Error while VersionsInfo requesting', resp);
                }
            });

            $.ajax({
                type: 'Get',
                dataType: 'json',
                url: App.stsServer.getUrl() + '/api/Diagnostic/GetVersionsInfo',
                crossDomain: App.stsServer.isCrossDomain(),
                success: function (data) {
                    var item = $('<tr><td>Version STS:</td> <td>' + data.VersionUi + '</td></tr>');
                    el.append(item);
                    var item = $('<tr><td>Version STS Services:</td> <td>' + data.VersionServices + '</td></tr>');
                    el.append(item);
                },
                error: function (resp) {
                    App.error('Error while VersionsInfo STS requesting', resp);
                }
            });
        } else {
            App.error('No DOM element for assemply-info');
        }
    };

    App.traceAjax = function(method, url, resp) {
        var el = $('#ajax-trace tbody'),
            childs = el.children(),
            headerName = App.requestIdHeader;

        if (el.length == 0) return;

        var status = resp.status,
            statusText = resp.statusText;

        if (childs > (App.traceMessagesCount || 30)) {
            var firslChild = $(childs[0]);
            firslChild.remove();
        }

        var json = resp.responseJSON || resp,
            str = JSON.stringify(json) || '',
            jsonStr = status == 200 ? str.substring(0, 200) : str,
            reqId = resp[headerName];

        var color = status == 200 ? '#D0F5D8' : '#F5DADA';

        var item = $('<tr style="background: ' + color + '"> <td>' + reqId + '</td> <td>' + method + '</td><td>'
            + status + '</td>  <td>' + statusText + '</td><td>'
            + url + '</td> <td style="word-break: break-word;">' + jsonStr + '</td> </tr>');

        el.append(item);
    };

    App.toLocalDate = function (utcDate) {
        if (utcDate) {
            var date = moment.utc(utcDate),
                localDate = date.toDate();

            return localDate;
        } else {
            return utcDate;
        }
    };

    App.toServerDate = function (localeDate) {
        if (localeDate) {
            var localDate = moment(utcDate),
                date = localDate.toDate(),
                dateStr = date.toUTCString(),
                utc = moment.utc(dateStr);

            return utc.toDate();
        } else {
            return localeDate;
        }
    };

    App.responseCode = function (response) {
        var ret = (response.responseJSON && response.responseJSON.Code)
            || response.Code || response.statusText;
        if (!ret) {
            App.warn('Incorrect response', response);
            return 'UnknownError';
        }
        return ret;
    };

    var baseFormatMsg = Globalize.prototype.formatMessage;
    Globalize.formatMessage = function (path) {
        var res = baseFormatMsg.apply(Globalize, arguments);
        
        if (_.isString(res) || !App.replaceLocalizationErrors) {
            return res;
        }

        App.error('Globalization string not found: ' + path);

        return baseFormatMsg.apply(Globalize, ['errors/globalization-not-found']);
    };

    return App;

})(_, $, Backbone, Marionette, Globalize, moment);