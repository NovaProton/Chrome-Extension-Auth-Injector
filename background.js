// Rebuilds declarativeNetRequest rules from stored credentials whenever
// they change, and on startup/install.

const RULE_ID_BASE = 1000;

async function b64(str) {
  // btoa is available in MV3 service workers
  return btoa(unescape(encodeURIComponent(str)));
}

async function buildRules() {
  const { credentials = [] } = await chrome.storage.sync.get("credentials");

  const rules = [];
  for (let i = 0; i < credentials.length; i++) {
    const { domain, username, password, enabled } = credentials[i];
    if (!domain || !username || enabled === false) continue;

    const encoded = await b64(`${username}:${password || ""}`);

    rules.push({
      id: RULE_ID_BASE + i,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          {
            header: "Authorization",
            operation: "set",
            value: `Basic ${encoded}`
          }
        ]
      },
      condition: {
        requestDomains: [domain],
        resourceTypes: [
          "main_frame",
          "sub_frame",
          "xmlhttprequest",
          "stylesheet",
          "script",
          "image",
          "font",
          "media",
          "object",
          "other"
        ]
      }
    });
  }

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules
  });
}

chrome.runtime.onInstalled.addListener(buildRules);
chrome.runtime.onStartup.addListener(buildRules);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.credentials) {
    buildRules();
  }
});
