
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
export function createNewWindowWithTabs(tabs, cb) {
    const tabUrls = tabs.map((tab) => tab.url);
    chrome.windows.create({
        url: tabUrls
    }, cb);
}