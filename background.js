export function listenForReload() {
    require('./_listenForReload');
}

export function getCurrentWindow() {
    return new Promise((resolve, reject) => {
        chrome.windows.getCurrent(null, resolve);
    });
}
export function setFullscreenOff(window) {
    return new Promise((resolve, reject) => {
        chrome.windows.update(window.id, { state: 'normal'}, resolve);
    });
}
export function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            resolve(tabs[0]);
        });
    });
}
export function getAllTabs() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            resolve(tabs);
        });
    });
}
export function getAllSelectedTabs() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, highlighted: true }, (tabs) => {
            resolve(tabs);
        });
    });
}
export function closeTab(tab) {
    return new Promise((resolve, reject) => {
        chrome.tabs.remove(tab.id, resolve);
    });
}
export function closeTabs(tabs) {
    return new Promise((resolve, reject) => {
        chrome.tabs.remove(tabs.map((tab) => tab.id), resolve);
    })
}

export function createNewWindow(windowOptions) {
    return new Promise((resolve, reject) => {
        chrome.windows.create(windowOptions, (window) => {
            resolve(window);
        });
    });
}

export async function moveTabToNewWindow(tab) {
    return await createNewWindow({ tabId: tab.id });
}

export function moveTabsToExistingWindow(tabs, windowId) {
    return new Promise((resolve, reject) => {
        const tabIds = tabs.map((tab) => tab.id);
        chrome.tabs.move(tabIds, { windowId, index: -1 }, (tabs) => {
            resolve(tabs);
        });
    });
}

function getDisplayInfo() {
    return new Promise((resolve, reject) => {
        chrome.system.display.getInfo((displays) => {
            //displays is an array of displays, which presumably is for when a user
            //has multiple monitors, but i dont so I'm just taking the first one
            resolve(displays[0]);
        });
    });
}

export async function getScreenWidth() {
    const displayInfo = await getDisplayInfo();

    //use workArea since this is the area that excludes the menu bar at the
    //of the screen
    return displayInfo.workArea.width;
}
export async function getScreenHeight() {
    const displayInfo = await getDisplayInfo();

    //use workArea since this is the area that excludes the menu bar at the
    //of the screen
    return displayInfo.workArea.height;
}

export async function moveWindowToRightSide(window) {
    return new Promise(async (resolve, reject) => {
        const options = {
            left: await getScreenWidth() / 2,
            top: 0,
            width: await getScreenWidth() / 2,
            height: await getScreenHeight(),
        };
        chrome.windows.update(window.id, options, resolve);
    });
}
export async function moveWindowToLeftSide(window) {
    return new Promise(async (resolve, reject) => {
        const options = {
            left: 0,
            top: 0,
            width: await getScreenWidth() / 2,
            height: await getScreenHeight(),
        };
        chrome.windows.update(window.id, options, resolve);
    });
}


