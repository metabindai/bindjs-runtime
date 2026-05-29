/**
 * Creates an action that intercepts and handles URL opening requests.
 * 
 * This function mimics SwiftUI's OpenURLAction, allowing you to intercept links
 * and choose how they are handled: by your custom logic, by the system, or discarded.
 * 
 * @param {Function} urlCallback - A callback function that receives the URL to be opened.
 * @returns {Function} A handler function bound to the runtime context.
 * 
 * @example
 * ```javascript
 * // Handle the URL yourself
 * OpenURLAction((url) => {
 *   console.log(" intercepted:", url);
 *   return { handled: true };
 * })
 * 
 * // Let the system handle it (default behavior)
 * OpenURLAction((url) => {
 *   return { systemAction: true };
 * })
 * 
 * // Modify the URL before letting the system handle it
 * OpenURLAction((url) => {
 *   return { systemAction: { url: url + "?ref=app" } };
 * })
 * 
 * // Open in the same window
 * OpenURLAction((url) => {
 *   return { systemAction: { url: url, preferInApp: true } };
 * })
 * ```
 */
export function OpenURLAction(urlCallback) {
    return (url, resultCallback) => {
        const result = urlCallback(url)

        if (result?.systemAction) {
            if (this?.openURL) {
                // Handle both boolean true and object forms of systemAction
                const systemAction = result.systemAction === true ? {} : result.systemAction
                const targetUrl = systemAction.url ?? url
                const preferInApp = systemAction.preferInApp ?? false

                this.openURL(targetUrl, resultCallback, { preferInApp })
            }
        } else if (resultCallback) {
            resultCallback(result)
        }
    }
}
