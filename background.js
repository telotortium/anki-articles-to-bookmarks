chrome.runtime.onInstalled.addListener(() => {
    let defaultOptions = {
        ankiConnectUrl: 'http://localhost:8765',
        deleteMissingBookmarks: false,
        folderTitle: 'Anki Articles',
        noteQuery: '"deck:Articles"',
    };

    chrome.storage.sync.get(defaultOptions, (items) => {
        // Check each option individually and only set it if undefined
        Object.keys(defaultOptions).forEach(key => {
            if (items[key] === undefined || items[key] === null || items[key] === '') {
                // If the setting is not defined, set the default value
                let toSet = {};
                toSet[key] = defaultOptions[key];
                chrome.storage.sync.set(toSet);
            }
        });
    });
});
