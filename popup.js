const pspToggle = document.getElementById('pspToggle');
const devToggle = document.getElementById('devModeToggle');
const applyButton = document.getElementById('applyButton');

const MIGRATE_RULE_IDS = [1000, 1001]; // Rule IDs must be unique integers

// URLs to match
const MIGRATE_JS_URL = "https://adtcdn.unidadeditorial.es/mdw/migrate.js";
const MIGRATE_MAP_URL = "https://adtcdn.unidadeditorial.es/mdw/migrate.js.map";

// URLs to redirect to
const MIGRATE_DEV_JS_URL = "https://adtcdn.unidadeditorial.es/mdw/migrate-devel.js";
const MIGRATE_DEV_MAP_URL = "https://adtcdn.unidadeditorial.es/mdw/migrate-devel.js.map";

chrome.storage.sync.get(['psp', 'devMode'], (data) => {
  pspToggle.checked = data.psp === true;
  devToggle.checked = data.devMode === true;
});

pspToggle.addEventListener('change', () => {
  const value = pspToggle.checked;
  chrome.storage.sync.set({ psp: value });

  chrome.cookies.set({
    url: "https://www.marca.com",
    name: "pspDebug",
    value: value ? "yes" : "no",
    path: "/"
  });
});

devToggle.addEventListener('change', async () => {
  const enabled = devToggle.checked;
  chrome.storage.sync.set({ devMode: enabled });

  try {
    if (enabled) {
      console.log('Enabling development mode URL redirection...');
      const result = await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1000,
            priority: 1,
            action: {
              type: "redirect",
              redirect: { url: MIGRATE_DEV_JS_URL }
            },
            condition: {
              urlFilter: MIGRATE_JS_URL,
              resourceTypes: ["script"]
            }
          },
          {
            id: 1001,
            priority: 1,
            action: {
              type: "redirect",
              redirect: { url: MIGRATE_DEV_MAP_URL }
            },
            condition: {
              urlFilter: MIGRATE_MAP_URL,
              resourceTypes: ["script"]
            }
          }
        ],
        removeRuleIds: [] // nothing to remove
      });
      console.log('URL redirection rules added successfully:', result);
    } else {
      console.log('Disabling development mode URL redirection...');
      const result = await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [],
        removeRuleIds: MIGRATE_RULE_IDS
      });
      console.log('URL redirection rules removed successfully:', result);
    }
  } catch (error) {
    console.error('Error updating URL redirection rules:', error);
  }
});

// Function to update extension icon color based on PSP status
function updateExtensionIcon(pspEnabled, devMode) {
  let color;
  if (devMode && pspEnabled) {
    color = '#FFA500'; // orange for dev mode
  } else if (pspEnabled) {
    color = '#4CAF50'; // green for PSP enabled
  } else {
    color = '#F44336'; // red for PSP disabled
  }
  
  chrome.action.setIcon({
    path: {
      "16": `icons/${color}16.png`,
      "32": `icons/${color}32.png`,
      "48": `icons/${color}48.png`
     }
  });
}

// Apply changes and reload the page
applyButton.addEventListener('click', async () => {
  try {
    // Get current tab to reload it
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url.includes('marca.com')) {
      // Reload the page to apply changes
      chrome.tabs.reload(tab.id);
      
      // Close the popup
      window.close();
    } else {
      alert('Please navigate to marca.com to apply changes.');
    }
  } catch (error) {
    console.error('Error applying changes:', error);
  }
});

// Update icon when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    chrome.storage.sync.get(['psp', 'devMode'], ({ psp, devMode }) => {
      updateExtensionIcon(psp, devMode);
    });
  }
});

// Initialize icon on popup load
chrome.storage.sync.get(['psp', 'devMode'], ({ psp, devMode }) => {
  updateExtensionIcon(psp, devMode);
});
