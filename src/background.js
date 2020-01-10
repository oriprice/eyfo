chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  if (reason === 'update') {
    const versionArray = previousVersion.split('.').map((digit) => parseInt(digit, 10));
    if (versionArray[0] === 1
      || (versionArray[0] === 2 && versionArray[1] === 0 && versionArray[2] < 7)) {
      window.chrome.storage.sync.set({ options: {} });
    }
  }
});
