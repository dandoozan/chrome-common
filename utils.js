export function getManifest() {
    return chrome.runtime.getManifest();
}

/*The below is from: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Match_patterns
/**
 * Transforms a valid match pattern into a regular expression
 * which matches all URLs included by that pattern.
 *
 * @param  {string}  pattern  The pattern to transform.
 * @return {RegExp}           The pattern's equivalent as a RegExp.
 * @throws {TypeError}        If the pattern is not a valid MatchPattern
 */
function convertMatchPatternToRegExp(pattern) {
    if (pattern === '') {
        return /^(?:http|https|file|ftp|app):\/\//;
    }

    const schemeSegment = '(\\*|http|https|file|ftp)';
    const hostSegment = '(\\*|(?:\\*\\.)?(?:[^/*]+))?';
    const pathSegment = '(.*)';
    const matchPatternRegExp = new RegExp(
        `^${schemeSegment}://${hostSegment}/${pathSegment}$`
    );

    let match = matchPatternRegExp.exec(pattern);
    if (!match) {
        throw new TypeError(`"${pattern}" is not a valid MatchPattern`);
    }

    let [, scheme, host, path] = match;
    if (!host) {
        throw new TypeError(`"${pattern}" does not have a valid host`);
    }

    let regex = '^';

    if (scheme === '*') {
        regex += '(http|https)';
    } else {
        regex += scheme;
    }

    regex += '://';

    if (host && host === '*') {
        regex += '[^/]+?';
    } else if (host) {
        if (host.match(/^\*\./)) {
            regex += '[^/]*?';
            host = host.substring(2);
        }
        regex += host.replace(/\./g, '\\.');
    }

    if (path) {
        if (path === '*') {
            regex += '(/.*)?';
        } else if (path.charAt(0) !== '/') {
            regex += '/';
            regex += path.replace(/\./g, '\\.').replace(/\*/g, '.*?');
            regex += '/?';
        }
    }

    regex += '$';
    return new RegExp(regex);
}

export function getMatchesObjectFromManifest(url) {
    console.log('​getMatchesObjectFromManifest -> url=', url);
    //this function gets the "matches" object for the given url (ie. the
    //object that looks like:
    //{
    //     "matches": ["https://www.google.com/search?*"],
    //     "js": [
    //         "js/contentScripts/google.bundle.js",
    //         "js/contenScripts/_main.js"
    //     ],
    //     "keyboard_shortcuts": [
    //         { "keyCombo": "alt+enter", "fnName": "openAllLinks" }
    //     ]
    //}
    let contentScripts = getManifest().content_scripts;
    for (let matchesObj of contentScripts) {
        let matchesArr = matchesObj.matches;
        for (let urlPatternAsMatchPattern of matchesArr) {
            let urlPatternAsRegex = convertMatchPatternToRegExp(
                urlPatternAsMatchPattern
            );
            if (urlPatternAsRegex.test(url)) {
                return matchesObj;
            }
        }
    }
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
    });
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
