// Options JavaScript for WhatsApp Voice Transcriber
// Handles settings management and storage

class OptionsManager {
  constructor() {
    this.settings = {
      autoTranscribe: true,
      generateSummaries: true,
      storeHistory: true,
      batterySaver: true,
      language: 'auto',
      modelSize: 'tiny',
      streaming: true
    };
    
    this.init();
  }

  async init() {
    try {
      // Load current settings
      await this.loadSettings();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Update UI with current settings
      this.updateUI();
      
    } catch (error) {
      console.error('Failed to initialize options:', error);
      this.showStatus('Failed to load settings', 'error');
    }
  }

  // Load settings from storage
  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        'autoTranscribe',
        'generateSummaries', 
        'storeHistory',
        'batterySaver',
        'language',
        'modelSize',
        'streaming'
      ], (result) => {
        this.settings = { ...this.settings, ...result };
        resolve();
      });
    });
  }

  // Save settings to storage
  async saveSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(this.settings, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  // Set up event listeners
  setupEventListeners() {
    // Save button
    const saveBtn = document.getElementById('saveSettings');
    saveBtn.addEventListener('click', () => {
      this.saveCurrentSettings();
    });

    // Auto-save on change
    const inputs = document.querySelectorAll('input[type="checkbox"], select');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateSettingsFromUI();
      });
    });
  }

  // Update UI with current settings
  updateUI() {
    // Checkboxes
    document.getElementById('autoTranscribe').checked = this.settings.autoTranscribe;
    document.getElementById('generateSummaries').checked = this.settings.generateSummaries;
    document.getElementById('storeHistory').checked = this.settings.storeHistory;
    document.getElementById('batterySaver').checked = this.settings.batterySaver;
    document.getElementById('streaming').checked = this.settings.streaming;
    
    // Selects
    document.getElementById('language').value = this.settings.language;
    document.getElementById('modelSize').value = this.settings.modelSize;
  }

  // Update settings from UI
  updateSettingsFromUI() {
    this.settings.autoTranscribe = document.getElementById('autoTranscribe').checked;
    this.settings.generateSummaries = document.getElementById('generateSummaries').checked;
    this.settings.storeHistory = document.getElementById('storeHistory').checked;
    this.settings.batterySaver = document.getElementById('batterySaver').checked;
    this.settings.streaming = document.getElementById('streaming').checked;
    this.settings.language = document.getElementById('language').value;
    this.settings.modelSize = document.getElementById('modelSize').value;
  }

  // Save current settings
  async saveCurrentSettings() {
    try {
      const saveBtn = document.getElementById('saveSettings');
      const statusMessage = document.getElementById('statusMessage');
      
      // Update settings from UI
      this.updateSettingsFromUI();
      
      // Disable save button and show loading
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      
      // Save to storage
      await this.saveSettings();
      
      // Show success message
      this.showStatus('Settings saved successfully!', 'success');
      
      // Re-enable save button
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        this.hideStatus();
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatus('Failed to save settings', 'error');
      
      // Re-enable save button
      const saveBtn = document.getElementById('saveSettings');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }
  }

  // Show status message
  showStatus(message, type = 'success') {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
  }

  // Hide status message
  hideStatus() {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.style.display = 'none';
  }

  // Reset settings to defaults
  resetToDefaults() {
    this.settings = {
      autoTranscribe: true,
      generateSummaries: true,
      storeHistory: true,
      batterySaver: true,
      language: 'auto',
      modelSize: 'tiny',
      streaming: true
    };
    
    this.updateUI();
    this.saveCurrentSettings();
  }

  // Export settings
  exportSettings() {
    const settingsData = {
      settings: this.settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsapp-transcriber-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import settings
  async importSettings(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.settings) {
        this.settings = { ...this.settings, ...data.settings };
        this.updateUI();
        await this.saveCurrentSettings();
        this.showStatus('Settings imported successfully!', 'success');
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (error) {
      console.error('Error importing settings:', error);
      this.showStatus('Failed to import settings', 'error');
    }
  }

  // Get settings summary
  getSettingsSummary() {
    const summary = {
      autoTranscribe: this.settings.autoTranscribe ? 'Enabled' : 'Disabled',
      generateSummaries: this.settings.generateSummaries ? 'Enabled' : 'Disabled',
      storeHistory: this.settings.storeHistory ? 'Enabled' : 'Disabled',
      batterySaver: this.settings.batterySaver ? 'Enabled' : 'Disabled',
      language: this.settings.language === 'auto' ? 'Auto-detect' : this.settings.language.toUpperCase(),
      modelSize: this.settings.modelSize === 'tiny' ? 'Tiny (Fast)' : 'Base (Accurate)',
      streaming: this.settings.streaming ? 'Enabled' : 'Disabled'
    };
    
    return summary;
  }

  // Validate settings
  validateSettings() {
    const errors = [];
    
    if (!['auto', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'].includes(this.settings.language)) {
      errors.push('Invalid language setting');
    }
    
    if (!['tiny', 'base'].includes(this.settings.modelSize)) {
      errors.push('Invalid model size setting');
    }
    
    return errors;
  }

  // Get storage usage
  async getStorageUsage() {
    return new Promise((resolve) => {
      chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
        resolve({
          bytes: bytesInUse,
          kilobytes: Math.round(bytesInUse / 1024 * 100) / 100,
          megabytes: Math.round(bytesInUse / (1024 * 1024) * 100) / 100
        });
      });
    });
  }

  // Clear all storage
  async clearStorage() {
    if (!confirm('Are you sure you want to clear all stored data? This will remove all transcripts and settings.')) {
      return;
    }
    
    try {
      await new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
      
      // Reset to defaults
      this.resetToDefaults();
      this.showStatus('All data cleared successfully!', 'success');
      
    } catch (error) {
      console.error('Error clearing storage:', error);
      this.showStatus('Failed to clear data', 'error');
    }
  }
}

// Initialize options when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.optionsManager = new OptionsManager();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    window.optionsManager.saveCurrentSettings();
  }
  
  // Ctrl/Cmd + R to reset
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    window.optionsManager.resetToDefaults();
  }
}); 