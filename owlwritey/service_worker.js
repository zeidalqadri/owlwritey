// Service Worker for WhatsApp Web Voice-Note Transcriber
// Handles background tasks, notifications, and storage management

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('WhatsApp Voice Transcriber installed');
  
  // Set default options
  chrome.storage.local.set({
    autoTranscribe: true,
    generateSummaries: true,
    storeHistory: true,
    batterySaver: true,
    language: 'auto'
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SHOW_NOTIFICATION':
      showNotification(request.title, request.message);
      break;
      
    case 'GET_SETTINGS':
      chrome.storage.local.get([
        'autoTranscribe', 
        'generateSummaries', 
        'storeHistory', 
        'batterySaver',
        'language'
      ], (result) => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'SAVE_TRANSCRIPT':
      saveTranscript(request.data);
      break;
      
    case 'GET_BATTERY_LEVEL':
      getBatteryLevel().then(level => {
        sendResponse({ level });
      });
      return true;
  }
});

// Show Chrome notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'assets/icons/icon48.png',
    title: title,
    message: message
  });
}

// Save transcript to IndexedDB via content script
function saveTranscript(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes('web.whatsapp.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'SAVE_TO_DB',
        data: data
      });
    }
  });
}

// Get battery level
async function getBatteryLevel() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return battery.level;
    } catch (error) {
      console.warn('Battery API not available:', error);
      return 1.0; // Assume full battery if API unavailable
    }
  }
  return 1.0;
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'transcribe-latest') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('web.whatsapp.com')) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TRANSCRIBE_LATEST'
        });
      }
    });
  }
}); 