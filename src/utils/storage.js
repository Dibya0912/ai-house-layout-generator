// src/utils/storage.js
const PROJECT_KEY = 'aihl_project_v1';

export function saveProjectToStorage(obj) {
  try {
    const s = JSON.stringify(obj);
    localStorage.setItem(PROJECT_KEY, s);
    return true;
  } catch (e) {
    console.error('saveProjectToStorage error', e);
    return false;
  }
}

export function loadProjectFromStorage() {
  try {
    const s = localStorage.getItem(PROJECT_KEY);
    if (!s) return null;
    return JSON.parse(s);
  } catch (e) {
    console.error('loadProjectFromStorage error', e);
    return null;
  }
}

export function clearProjectStorage() {
  try {
    localStorage.removeItem(PROJECT_KEY);
  } catch (e) {
    console.error('clearProjectStorage error', e);
  }
}
