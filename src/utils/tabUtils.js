/* global window */
export default {
  openTab: (url) => {
    window.chrome.tabs.query({ active: true }, (tabs) => {
      const activeTab = tabs[0];
      const newUrl = { url: `https://github.com${url}` };
      if (activeTab && (activeTab.url === 'chrome://newtab/' || activeTab.url === 'about:blank' || activeTab.url === 'about:newtab')) {
        window.chrome.tabs.update(activeTab.id, newUrl);
      } else {
        window.chrome.tabs.create(newUrl);
      }
      window.close();
    });
  },
};
