/* global window */
export default {
  openTab: (url) => {
    window.chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && (activeTab.url === 'chrome://newtab/' || activeTab.url === 'about:blank' || activeTab.url === 'about:newtab')) {
        window.chrome.tabs.update(activeTab.id, { url });
      } else {
        window.chrome.tabs.create({ url });
      }
    });
  },
};
