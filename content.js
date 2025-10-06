function createOverlay(pspEnabled, devMode) {
  devMode = devMode && pspEnabled; // devMode can't be used without PSP enabled

  let overlay = document.getElementById('psp-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'psp-overlay';
    document.body.appendChild(overlay);
  }

  overlay.textContent = `PSP: ${pspEnabled ? 'ENABLED' : 'DISABLED'}` + (devMode ? ' (devel mode)' : '');

  if (devMode) {
    overlay.style.backgroundColor = '#FFA500'; // orange
  } else {
    overlay.style.backgroundColor = pspEnabled ? '#4CAF50' : '#F44336'; // green or red
  }
}

function updateOverlay() {
  chrome.storage.sync.get(['psp', 'devMode'], ({ psp, devMode }) => {
    createOverlay(psp, devMode);
  });
}

updateOverlay();

chrome.storage.onChanged.addListener(() => {
  updateOverlay();
});

