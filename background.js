
export function listenForReload() {
    require('./_listenForReload');
}

export function getCurrentTab(cb) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        cb(tabs[0]);
    });
}
export function getAllTabs(cb) {
    chrome.tabs.query({
        currentWindow: true
    }, (tabs) => {
        cb(tabs);
    });
}
export function getAllSelectedTabs(cb) {
    chrome.tabs.query({
        currentWindow: true,
        highlighted: true
    }, (tabs) => {
        cb(tabs);
    });
}
export function closeTab(tab, cb) {
    chrome.tabs.remove(tab.id, cb);
}
export function closeTabs(tabs, cb) {
    chrome.tabs.remove(tabs.map((tab) => tab.id), cb);
}

export function createNewWindow(cb) {
    chrome.windows.create({}, cb);
}

export function moveTabToNewWindow(tab, cb) {
    chrome.windows.create({ tabId: tab.id }, cb);
}

export function moveTabsToExistingWindow(tabs, windowId, cb) {
    const tabIds = tabs.map((tab) => tab.id);
    chrome.tabs.move(tabIds, { windowId, index: -1 }, cb);
}