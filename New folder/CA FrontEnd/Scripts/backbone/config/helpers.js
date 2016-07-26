Helpers = {};

Helpers.getColorByStatus = function (status) {
    switch (status) {
        case 'PendingAdditionalInformationNeeded': return 'red';
        case 'InProgress': return 'green';
        case 'ResolvedSolutionProvided': return 'orange';
        case 'ResolvedRequiredInfoNotProvided': return 'orange';
        default: return 'gray';
    }
};

Helpers.loadLangFile = function (fileName, cb) {
    var lang = App.request('settings:entity').get('language').value;
    $.when(
        $.get('/Scripts/globalize/messages/' + lang + '/' + fileName + '.json?v=' + App.version)
    ).then(function (resp, state) {
        return resp;
    }).then(Globalize.load).then(cb);
};