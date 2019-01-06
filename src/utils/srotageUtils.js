/* global window */
const storage = window.chrome.storage.sync;

export const setInStorage = storageItem => new Promise((resolve) => {
  storage.set(storageItem, () => {
    resolve();
  });
});

export const getFromStorage = key => new Promise((resolve) => {
  storage.get([key], (result) => {
    const value = result && result[key];
    resolve(value);
  });
});
