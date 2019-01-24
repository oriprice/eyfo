/* global window */
export default {
  openTab: (url) => {
    window.chrome.tabs.create({ url: `https://github.com${url}` });
    window.close();
  },
};
