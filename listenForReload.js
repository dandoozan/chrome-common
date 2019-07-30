const CRX_RELOADER_EXTENSION_ID = 'dbjgnbnjfkknapiglekebcdofafafkok';
const RELOAD_MESSAGE = 'dpd_reloadExtension';

const BADGE_MESSAGE = 'RLD'; //for 'reloaded'
const BADGE_COLOR = '#4cb749'; //green
const BADGE_TIMEOUT_IN_MS = 1000;

function showBadge(msgOf4CharsOrLess, colorAsCSSCompatibleString) {
    chrome.browserAction.setBadgeText({ text: msgOf4CharsOrLess });
    chrome.browserAction.setBadgeBackgroundColor({
        color: colorAsCSSCompatibleString,
    });
}

function removeBadge() {
    //i guess just set the badge text to '' to remove it; i don't see anything in
    //the documentation for how to remove a badge, and I can't think of any other way
    //to do it
    chrome.browserAction.setBadgeText({ text: '' });
}

function flashBadge(
    msgOf4CharsOrLess,
    colorAsCSSCompatibleString,
    timeoutInMs
) {
    showBadge(msgOf4CharsOrLess, colorAsCSSCompatibleString);
    setTimeout(removeBadge, timeoutInMs);
}

function handleOnInstalled() {
    flashBadge(BADGE_MESSAGE, BADGE_COLOR, BADGE_TIMEOUT_IN_MS);
}

function reloadThisExtension() {
    chrome.runtime.reload();
}

function handleOnMessageExternal(request, sender, sendResponse) {
    if (sender.id === CRX_RELOADER_EXTENSION_ID) {
        //ensure the msg is coming from the CrxReloader extension
        if (request.msg === RELOAD_MESSAGE) {
            reloadThisExtension();
        }
    }
}

chrome.runtime.onInstalled.addListener(handleOnInstalled);
chrome.runtime.onMessageExternal.addListener(handleOnMessageExternal);
