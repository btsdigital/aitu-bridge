export function isIframe(): boolean {
  if (!globalThis.window) {
    return false;
  }
  
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
