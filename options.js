// Saves options to chrome.storage
function saveOptions() {
    let ankiConnectUrl = document.getElementById('ankiConnectUrl').value;
    let folderTitle = document.getElementById('folderTitle').value;
    let noteQuery = document.getElementById('noteQuery').value;
    let deleteMissingBookmarks = document.getElementById('deleteMissingBookmarks').checked;
    chrome.storage.sync.set({
        ankiConnectUrl: ankiConnectUrl,
        folderTitle: folderTitle,
        noteQuery: noteQuery,
        deleteMissingBookmarks: deleteMissingBookmarks
    }, function() {
        // Update status to let user know options were saved.
        alert('Options saved.');
    });
}

// Restores state using the preferences stored in chrome.storage
function restoreOptions() {
    // Use default value ankiConnectUrl = 'http://localhost:8765' and noteQuery = 'Articles'
    chrome.storage.sync.get({
        ankiConnectUrl,
        noteQuery,
        deleteMissingBookmarks,
    }, function(items) {
        document.getElementById('ankiConnectUrl').value = items.ankiConnectUrl;
        document.getElementById('deleteMissingBookmarks').checked = items.deleteMissingBookmarks;
        document.getElementById('folderTitle').value = items.folderTitle;
        document.getElementById('noteQuery').value = items.noteQuery;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('optionsForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from trying to submit to a server
    saveOptions();
});
