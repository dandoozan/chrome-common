export function getManifest() {
    return chrome.runtime.getManifest();
}

export function getExtensionId() {
    return chrome.runtime.id;
}

export function isWindowFullscreen(window) {
    return window.state === 'fullscreen';
}

export function getCurrentWindow() {
    return new Promise((resolve, reject) => {
        chrome.windows.getCurrent(null, resolve);
    });
}
export function setFullscreenOff(window) {
    return new Promise((resolve, reject) => {
        chrome.windows.update(window.id, { state: 'normal' }, resolve);
    });
}
export function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, active: true }, function(
            tabs
        ) {
            resolve(tabs[0]);
        });
    });
}
export function getAllTabs() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true }, tabs => {
            resolve(tabs);
        });
    });
}
export function getAllSelectedTabs() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ currentWindow: true, highlighted: true }, tabs => {
            resolve(tabs);
        });
    });
}
export async function closeTab(tab) {
    await closeTabs([tab]);
}
export function closeTabs(tabs) {
    return new Promise((resolve, reject) => {
        chrome.tabs.remove(tabs.map(tab => tab.id), resolve);
    });
}

export function createTab(url) {
    return new Promise((resolve, reject) => {
        chrome.tabs.create({ url }, resolve);
    });
}

export function duplicateTab(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.duplicate(tabId, resolve);
    })
}

export function createNewWindow(windowOptions) {
    return new Promise((resolve, reject) => {
        chrome.windows.create(windowOptions, window => {
            resolve(window);
        });
    });
}

//todo: move this to ChromeKeyboardShortcuts
export async function moveTabToNewWindow(tab) {
    return await createNewWindow({ tabId: tab.id });
}
//todo: move this to ChromeKeyboardShortcuts
export async function moveTabToNewWindowOnTheRight(tab) {
    return await createNewWindow({
        tabId: tab.id,
        left: (await getScreenWidth()) / 2,
        top: 0,
        width: (await getScreenWidth()) / 2,
        height: await getScreenHeight(),
    });
}

async function focusTab(tab) {
    return new Promise((resolve, reject) => {
        chrome.tabs.update(tab.id, { active: true }, tab => resolve);
    });
}

export function moveTabsToWindow(tabs, window) {
    return new Promise((resolve, reject) => {
        const tabIds = tabs.map(tab => tab.id);
        chrome.tabs.move(
            tabIds,
            { windowId: window.id, index: -1 },
            async tabOrTabs => {
                //focus the first tab (otherwise, they're unfocused)
                await focusTab(
                    Array.isArray(tabOrTabs) ? tabOrTabs[0] : tabOrTabs
                );
                resolve(tabOrTabs);
            }
        );
    });
}

function getDisplayInfo() {
    return new Promise((resolve, reject) => {
        chrome.system.display.getInfo(displays => {
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

//todo: move this to ChromeKeyboardShortcuts
export async function moveWindowToRightSide(window) {
    return new Promise(async (resolve, reject) => {
        const options = {
            left: (await getScreenWidth()) / 2,
            top: 0,
            width: (await getScreenWidth()) / 2,
            height: await getScreenHeight(),
        };
        chrome.windows.update(window.id, options, resolve);
    });
}
//todo: move this to ChromeKeyboardShortcuts
export async function moveWindowToLeftSide(window) {
    return new Promise(async (resolve, reject) => {
        const options = {
            left: 0,
            top: 0,
            width: (await getScreenWidth()) / 2,
            height: await getScreenHeight(),
        };
        chrome.windows.update(window.id, options, resolve);
    });
}

function getAllWindows() {
    return new Promise((resolve, reject) => {
        chrome.windows.getAll(
            {
                populate: true,
                windowTypes: ['normal'],
            },
            resolve
        );
    });
}

//todo: move this to ChromeKeyboardShortcuts
async function isWindowHalfScreenSize(window) {
    return (
        window.width === (await getScreenWidth()) / 2 &&
        window.height === (await getScreenHeight())
    );
}
//todo: move this to ChromeKeyboardShortcuts
async function isWindowOnRightSideOfScreen(window) {
    return (
        (await isWindowHalfScreenSize(window)) &&
        window.left === (await getScreenWidth()) / 2
    );
}

//todo: move this to ChromeKeyboardShortcuts
export async function getWindowsOnRightSideOfScreen() {
    const windows = await getAllWindows();
    const windowsOnRightSideOfScreen = [];
    for (const window of windows) {
        if (await isWindowOnRightSideOfScreen(window)) {
            windowsOnRightSideOfScreen.push(window);
        }
    }
    return windowsOnRightSideOfScreen;
}
