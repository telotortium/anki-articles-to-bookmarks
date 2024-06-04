async function fetchUrlsFromAnki(ankiConnectUrl, noteQuery) {
    const response = await fetch(ankiConnectUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'findNotes',
            version: 6,
            params: {
                query: noteQuery
            }
        }),
    });

    let resp = await response.json();
    if (resp.error !== null) {
        throw new Exception(resp.error);
    }
    let notes = resp.result;
    let result = [];
    for (let i = 0; i < notes.length; i += 100) {
        // Assume these notes are simple with the whole URL as the front text; you may need to adjust this logic.
        // Next, get notes detail which includes the card's content (including URL).
        // This is an example and might need modification to fit your exact note structure.
        const detailResponse = await fetch(ankiConnectUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'notesInfo',
                version: 6,
                params: {
                    notes: notes.slice(i, i+100),
                }
            }),
        });

        let details = await detailResponse.json();
        if (details.error !== null) {
            throw new Exception(details.error);
        }


        // Process and return URLs from details.
        // This step highly depends on your Anki card structure.
        for (let j = 0; j < details.result.length; j += 1) {
            let detail = details.result[j];
            if (detail.fields.resolved_title.value !== '' && detail.fields.resolved_url.value !== '') {
                result.push({
                    title: detail.fields.resolved_title.value,
                    url: detail.fields.resolved_url.value,
                    tags: detail.tags
                });
            }
            if (detail.fields.resolved_url.value !== detail.fields.given_url.value && detail.fields.given_title.value !== '' && detail.fields.given_url.value !== '') {
                result.push({
                    title: detail.fields.given_title.value,
                    url: detail.fields.given_url.value,
                    tags: detail.tags
                });
            }
            if (detail.fields.resolved_title.value !== detail.fields.custom_title.value && detail.fields.custom_title.value !== '') {
                result.push({
                    title: detail.fields.custom_title.value,
                    url: detail.fields.resolved_url.value,
                    tags: detail.tags
                });
            }
        }
    }
    return result;
}

async function updateBookmarks(folderTitle, detailsFromAnki, deleteMissingBookmarks) {
    let folderSearchResults = await chrome.bookmarks.search({title: folderTitle});
    let folder;
    for (let result of folderSearchResults) {
        if (!('url' in result)) {
            folder = result;
            break;
        }
    }
    let bookmarks = {};
    let folderChildren = await chrome.bookmarks.getChildren(folder.id);
    for (let child of folderChildren) {
        bookmarks[child.url] = child;
    }
    if (deleteMissingBookmarks) {
        for (let child of folderChildren) {
            if (!(child.url in bookmarks)) {
                chrome.bookmarks.remove(child.id);
            }
        }
    }
    for (let detail of detailsFromAnki) {
        if (detail.url in bookmarks) {
            // Bookmark already exists, update it
            await chrome.bookmarks.update(bookmarks[detail.url].id, {title: `${detail.title} -- (${detail.tags.join(" ")})`, url: detail.url});
        } else {
            // Bookmark doesn't exist, create it
            await chrome.bookmarks.create({parentId: folder.id, title: `${detail.title} -- (${detail.tags.join(" ")})`, url: detail.url});
        }
    }
}

let addArticleBtn = document.getElementById('addArticleBtn');
addArticleBtn.addEventListener('click', async () => {
    let loader = document.createElement('span');
    loader.classList.add('loader');
    try {
        addArticleBtn.appendChild(loader);
        const settings = await chrome.storage.sync.get([
            'ankiConnectUrl',
            'deleteMissingBookmarks',
            'folderTitle',
            'noteQuery',
        ]);
        const results = await fetchUrlsFromAnki(settings.ankiConnectUrl, settings.noteQuery);
        updateBookmarks(settings.folderTitle, results, settings.deleteMissingBookmarks);
    } finally {
        addArticleBtn.removeChild(loader);
    }
});
