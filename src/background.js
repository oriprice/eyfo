chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  if (reason === 'update') {
    const version = parseInt(previousVersion.replace(/\./g, ''), 10);
    if (version < 207) {
      window.chrome.storage.sync.set({ options: {} });
    }
  }
});
