export function getManifest() {
    return chrome.runtime.getManifest();
}

export async function loadOptions() {
    try {
        //get the options from options.json if it exists
        return require('../options.json');
    } catch (error) {
        //otherwise, get the options from storage
        return JSON.parse(
            (await readFromStorage({
                options: JSON.stringify(sampleOptions),
            })).options
        );
    }
}

export function readFromStorage(whatToGet) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(whatToGet, resolve);
    });
}

export function clearStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.clear(resolve);
    });
}

export function writeToStorage(whatToSet) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(whatToSet, resolve);
    });
}

export function getContentScriptObject(
    url,
    contentScripts = getManifest().content_scripts
) {
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
    if (contentScripts) {
        for (let contentScriptObj of contentScripts) {
            let matchesArr = contentScriptObj.matches;
            for (let urlGlob of matchesArr) {
                if (
                    url === urlGlob ||
                    convertMatchPatternToRegExp(urlGlob).test(url)
                ) {
                    return contentScriptObj;
                }
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

export function getAllWindows() {
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