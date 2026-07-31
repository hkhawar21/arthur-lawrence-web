export async function getStorageItemAsync(key: string): Promise<string | null> {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

export async function setStorageItemAsync(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.error('Local storage is unavailable:', e);
  }
}
