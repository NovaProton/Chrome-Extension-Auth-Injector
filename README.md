# Auto Basic Auth

A Manifest V3 Chrome extension that automatically sends HTTP Basic Auth credentials to domains you configure, so you never see the browser's login prompt on staging sites, dev servers or other password-protected environments.

## How it works

The extension doesn't intercept or answer the login prompt. Instead, it uses Chrome's `declarativeNetRequest` API to add an `Authorization: Basic …` header to every request sent to a configured domain. The server receives valid credentials on the first request, so the prompt never appears.

- Credentials are saved in `chrome.storage.sync`.
- `background.js` rebuilds the dynamic header rules whenever the stored credentials change, and again on install and on browser startup.
- Each enabled domain gets one rule, applied to all common resource types (pages, iframes, XHR/fetch, scripts, stylesheets, images, fonts, media and so on).

## Installation Chrome Web Store

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-%234285F4.svg?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/auto-basic-auth/kkbnekjlaihkfhmlamgioaahobdajfdm)

## Installation Local

1. Clone or download this repository.
2. Add icons at `icons/icon16.png`, `icons/icon48.png` and `icons/icon128.png` (Chrome will refuse to load the extension if the files listed in the manifest are missing).
3. Open `chrome://extensions` and switch on **Developer mode**.
4. Click **Load unpacked** and select the project folder.

## Usage

1. Click the extension icon in the toolbar (or open the extension's options page).
2. Enter the **domain**, **username** and, optionally, **password**.
3. Click **Add / update domain**.

The rule takes effect straight away; reload the page if it was already open.

- **Domains**: enter a bare hostname such as `staging.example.com`. If you paste a full URL, the protocol and path are stripped automatically.
- **Subdomains**: a rule for `example.com` also matches `www.example.com`, `dev.example.com` and so on. Add the more specific hostname if you only want one subdomain covered.
- **Updating**: adding a domain that already exists replaces its credentials.
- **Removing**: click **Remove** next to an entry.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Extension manifest (MV3); declares `declarativeNetRequest`, `storage` and `<all_urls>` host permissions |
| `background.js` | Service worker that turns stored credentials into dynamic header rules |
| `options.html` | Popup and options page UI |
| `options.js` | Adds, lists and removes credentials in storage |

## Permissions

- `declarativeNetRequest`: adds the `Authorization` header to matching requests.
- `storage`: keeps the list of domains and credentials.
- `<all_urls>` host permission: needed so header modification can apply to whichever domains you add.

## Security notes

Please read these before using the extension with anything sensitive.

- **Credentials are stored in plain text** in `chrome.storage.sync`, which means they are synced to your Google account and every signed-in Chrome profile that has the extension installed. Switch to `chrome.storage.local` if you don't want them synced.
- **The header is sent on plain HTTP as well as HTTPS.** Basic Auth is only base64-encoded, not encrypted, so avoid configuring domains you reach over unencrypted HTTP on untrusted networks.
- **The header is sent on every matching request**, including requests triggered by other sites (for example, an image on another page that loads from your configured domain).
- Anyone with access to your browser profile can read the saved passwords via the extension's storage or developer tools.

This extension is intended for convenience on development and staging environments, not as a password manager.

## Known limitations

- There's no UI to disable an entry temporarily. The `enabled` flag is supported in storage and respected by `background.js`, but the options page always saves entries as enabled.
- Rule IDs are based on each entry's position in the list, so all rules are cleared and rebuilt on every change. This is fine for a handful of domains.
- The domain list is inserted with `innerHTML` in `options.js`; switching to `textContent` would be safer if entries ever come from anywhere other than your own typing.
