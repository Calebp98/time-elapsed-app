chrome.tabs.onCreated.addListener((tab) => {
  // Check if the new tab is the default new tab page
  if (tab.pendingUrl === "chrome://newtab/" || tab.url === "chrome://newtab/") {
    chrome.tabs.update(tab.id, { url: chrome.runtime.getURL("index.html") });
  }
});
