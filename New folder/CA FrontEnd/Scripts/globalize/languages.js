(function (App) {
    App.request('settings:set:supportedLanguages',
    [
        
        { "value": "en", "text": "English" },
        { "value": "ja", "text": "Japan" },
        { "value": "ru", "text": "Русский" },
        { "value": "it", "text": "Italiano" },
        { "value": "es", "text": "Español" },
        //TODO: CA-2113 раскомментить после бэтты
        //{ "value": "pl", "text": "Polski" },
        { "value": "fr", "text": "Français" },
        { "value": "de", "text": "Deutsch" },
        { "value": "pt", "text": "Português" }

    ]);
})(App);
