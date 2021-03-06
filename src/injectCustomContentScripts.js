import { loadOptions, getContentScriptObject } from './utils';

(async () => {
  const { content_scripts: contentScripts } = await loadOptions();
  chrome.tabs.onUpdated.addListener(async function(tabId, { status }, { url }) {
    if (status === 'complete') {
      //get the content scripts to inject for this url
      //NOTE: make sure an array is passed in for contentScripts to force it to search
      //there (and not go looking for the contentScriptObj elsewhere (ie. in manifest.json)).
      let contentScriptObj = await getContentScriptObject(
        url,
        contentScripts || []
      );
      if (contentScriptObj && contentScriptObj.js) {
        //inject the scripts in "js"
        contentScriptObj.js.forEach(file => {
          chrome.tabs.executeScript(tabId, {
            file,
          });
        });
      }
    }
  });
})();
