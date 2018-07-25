// @flow
/**
 * Loads script asynchronously.
 * @param {string} url - The url to load.
 * @return {Promise} - The loading promise.
 * @public
 */
function loadScriptAsync(url: string): Promise<*> {
  return new Promise((resolve, reject) => {
    let r = false,
      t = document.getElementsByTagName('script')[0],
      s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = url;
    s.async = true;
    s.onload = s.onreadystatechange = function() {
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true;
        resolve(this);
      }
    };
    s.onerror = s.onabort = reject;
    if (t && t.parentNode) {
      t.parentNode.insertBefore(s, t);
    }
  });
}

export {loadScriptAsync};
