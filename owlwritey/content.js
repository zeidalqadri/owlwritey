// Content Script for WhatsApp Web Voice-Note Transcriber
// Detects voice messages, extracts audio, and handles transcription

class WhatsAppVoiceTranscriber {
  constructor() {
    this.observer = null;
    this.transcriber = null;
    this.settings = {};
    this.processedMessages = new Set();
    this.isInitialized = false;
    this.debounceTimer = null;
    
    // Selectors for WhatsApp Web elements
    this.selectors = {
      voiceMessage: '[data-testid="audio-play"]',
      audioElement: 'audio',
      messageContainer: '[data-testid="msg-meta"]',
      chatName: '[data-testid="conversation-title"]',
      messageBubble: '[data-testid="msg-container"]'
    };
    
    this.init();
  }

  async init() {
    try {
      console.log('Initializing WhatsApp Voice Transcriber...');
      
      // Load settings
      await this.loadSettings();
      
      // Initialize transcriber
      await this.initializeTranscriber();
      
      // Start observing DOM changes
      this.startObserving();
      
      // Add keyboard shortcuts
      this.addKeyboardShortcuts();
      
      // Add styles
      this.injectStyles();
      
      this.isInitialized = true;
      console.log('WhatsApp Voice Transcriber initialized successfully');
      
      // Process existing voice messages
      this.processExistingVoiceMessages();
      
    } catch (error) {
      console.error('Failed to initialize WhatsApp Voice Transcriber:', error);
    }
  }

  // Load settings from storage
  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
        this.settings = response || {
          autoTranscribe: true,
          generateSummaries: true,
          storeHistory: true,
          batterySaver: true,
          language: 'auto'
        };
        resolve();
      });
    });
  }

  // Initialize the Whisper transcriber
  async initializeTranscriber() {
    // Create a worker for transcription
    const workerBlob = new Blob([`
      // Import the whisper-worker.js content here
      ${this.getWhisperWorkerCode()}
    `], { type: 'application/javascript' });
    
    this.transcriber = new Worker(URL.createObjectURL(workerBlob));
    
    this.transcriber.onmessage = (event) => {
      this.handleTranscriberMessage(event.data);
    };
    
    // Initialize the worker
    this.transcriber.postMessage({
      type: 'INITIALIZE',
      data: { modelName: 'whisper-tiny' }
    });
  }

  // Get the Whisper worker code (simplified for demo)
  getWhisperWorkerCode() {
    return `
      // Simplified worker implementation
      self.addEventListener('message', async (event) => {
        const { type, data } = event.data;
        
        if (type === 'TRANSCRIBE') {
          // Simulate transcription
          setTimeout(() => {
            self.postMessage({
              type: 'TRANSCRIPTION_COMPLETE',
              data: {
                transcript: 'Hello, this is a test transcription.',
                language: 'en',
                confidence: 0.95,
                duration: 2.5
              }
            });
          }, 2000);
        }
      });
    `;
  }

  // Start observing DOM changes
  startObserving() {
    this.observer = new MutationObserver((mutations) => {
      // Debounce the processing
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.processNewVoiceMessages(mutations);
      }, 100);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-testid']
    });
  }

  // Process existing voice messages on page load
  processExistingVoiceMessages() {
    const voiceMessages = document.querySelectorAll(this.selectors.voiceMessage);
    voiceMessages.forEach(message => {
      this.processVoiceMessage(message);
    });
  }

  // Process new voice messages from mutations
  processNewVoiceMessages(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a voice message
            const voiceMessages = node.querySelectorAll ? 
              node.querySelectorAll(this.selectors.voiceMessage) : [];
            
            if (node.matches && node.matches(this.selectors.voiceMessage)) {
              voiceMessages.push(node);
            }
            
            voiceMessages.forEach(message => {
              this.processVoiceMessage(message);
            });
          }
        });
      }
    });
  }

  // Process a single voice message
  processVoiceMessage(voiceMessageElement) {
    const messageId = this.getMessageId(voiceMessageElement);
    
    if (this.processedMessages.has(messageId)) {
      return;
    }
    
    this.processedMessages.add(messageId);
    
    // Add transcribe button
    this.addTranscribeButton(voiceMessageElement);
    
    // Auto-transcribe if enabled
    if (this.settings.autoTranscribe) {
      setTimeout(() => {
        this.transcribeVoiceMessage(voiceMessageElement);
      }, 1000);
    }
  }

  // Get unique message ID
  getMessageId(element) {
    const messageContainer = element.closest(this.selectors.messageContainer);
    return messageContainer ? messageContainer.textContent.slice(0, 50) : Date.now().toString();
  }

  // Add transcribe button to voice message
  addTranscribeButton(voiceMessageElement) {
    // Check if button already exists
    if (voiceMessageElement.querySelector('.transcribe-btn')) {
      return;
    }
    
    const button = document.createElement('button');
    button.className = 'transcribe-btn';
    button.innerHTML = '➜ 📝 Transcribe';
    button.style.cssText = `
      margin-left: 8px;
      padding: 4px 8px;
      background: #25D366;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.transcribeVoiceMessage(voiceMessageElement);
    });
    
    button.addEventListener('mouseenter', () => {
      button.style.background = '#128C7E';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = '#25D366';
    });
    
    // Insert button after the voice message
    voiceMessageElement.parentNode.insertBefore(button, voiceMessageElement.nextSibling);
  }

  // Transcribe a voice message
  async transcribeVoiceMessage(voiceMessageElement) {
    try {
      // Check battery level if battery saver is enabled
      if (this.settings.batterySaver) {
        const batteryLevel = await this.getBatteryLevel();
        if (batteryLevel < 0.2) {
          this.showToast('Battery saver: Transcription paused', 'warning');
          return;
        }
      }
      
      // Show loading state
      this.showLoadingState(voiceMessageElement);
      
      // Extract audio blob
      const audioBlob = await this.extractAudioBlob(voiceMessageElement);
      
      if (!audioBlob) {
        throw new Error('Could not extract audio from voice message');
      }
      
      // Get chat information
      const chatInfo = this.getChatInfo();
      
      // Start transcription
      this.transcriber.postMessage({
        type: 'TRANSCRIBE',
        data: {
          audioBlob,
          options: {
            language: this.settings.language,
            batterySaver: this.settings.batterySaver
          }
        }
      });
      
      // Store context for when transcription completes
      voiceMessageElement.transcriptionContext = {
        chatInfo,
        audioBlob,
        startTime: Date.now()
      };
      
    } catch (error) {
      console.error('Error transcribing voice message:', error);
      this.showError(voiceMessageElement, error.message);
    }
  }

  // Extract audio blob from voice message
  async extractAudioBlob(voiceMessageElement) {
    try {
      // Find the audio element
      const audioElement = voiceMessageElement.querySelector(this.selectors.audioElement);
      
      if (!audioElement || !audioElement.src) {
        throw new Error('No audio element found');
      }
      
      // Convert audio URL to blob
      const response = await fetch(audioElement.src);
      const audioBlob = await response.blob();
      
      return audioBlob;
    } catch (error) {
      console.error('Error extracting audio blob:', error);
      return null;
    }
  }

  // Get chat information
  getChatInfo() {
    const chatNameElement = document.querySelector(this.selectors.chatName);
    const chatName = chatNameElement ? chatNameElement.textContent : 'Unknown Chat';
    
    return {
      chatName,
      chatId: chatName, // Simplified for demo
      timestamp: Date.now()
    };
  }

  // Handle messages from transcriber worker
  handleTranscriberMessage(message) {
    switch (message.type) {
      case 'INITIALIZED':
        console.log('Transcriber worker initialized');
        break;
        
      case 'PARTIAL_TRANSCRIPT':
        this.updatePartialTranscript(message.data);
        break;
        
      case 'TRANSCRIPTION_COMPLETE':
        this.handleTranscriptionComplete(message.data);
        break;
        
      case 'SUMMARY_COMPLETE':
        this.handleSummaryComplete(message.data);
        break;
        
      case 'ERROR':
        console.error('Transcriber error:', message.error);
        this.showToast(`Transcription error: ${message.error}`, 'error');
        break;
    }
  }

  // Update partial transcript display
  updatePartialTranscript(partialData) {
    // Find the current transcription element and update it
    const transcriptionElements = document.querySelectorAll('.transcription-result');
    const latestElement = transcriptionElements[transcriptionElements.length - 1];
    
    if (latestElement) {
      latestElement.textContent = partialData.data;
      latestElement.style.opacity = '0.7';
    }
  }

  // Handle completed transcription
  async handleTranscriptionComplete(result) {
    try {
      // Find the voice message element that was being transcribed
      const voiceMessages = document.querySelectorAll(this.selectors.voiceMessage);
      let targetElement = null;
      
      for (const element of voiceMessages) {
        if (element.transcriptionContext) {
          targetElement = element;
          break;
        }
      }
      
      if (!targetElement) {
        console.warn('No target element found for transcription result');
        return;
      }
      
      const context = targetElement.transcriptionContext;
      delete targetElement.transcriptionContext;
      
      // Display the transcript
      this.displayTranscript(targetElement, result, context);
      
      // Generate summary if enabled
      if (this.settings.generateSummaries) {
        this.generateSummary(result.transcript);
      }
      
      // Store in database if enabled
      if (this.settings.storeHistory) {
        await this.saveTranscript(result, context);
      }
      
      // Show notification
      this.showNotification(result.transcript);
      
      // Show success toast
      this.showToast('Transcription completed!', 'success');
      
    } catch (error) {
      console.error('Error handling transcription complete:', error);
    }
  }

  // Display transcript inline
  displayTranscript(voiceMessageElement, result, context) {
    // Remove loading state
    this.removeLoadingState(voiceMessageElement);
    
    // Create transcript container
    const transcriptContainer = document.createElement('div');
    transcriptContainer.className = 'transcription-result';
    transcriptContainer.style.cssText = `
      margin-top: 8px;
      padding: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.4;
      border-left: 3px solid #25D366;
    `;
    
    // Add language indicator
    const languageIndicator = document.createElement('div');
    languageIndicator.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    `;
    languageIndicator.textContent = `(${result.language})`;
    transcriptContainer.appendChild(languageIndicator);
    
    // Add transcript text
    const transcriptText = document.createElement('div');
    transcriptText.textContent = result.transcript;
    transcriptContainer.appendChild(transcriptText);
    
    // Add summary toggle if summary is available
    if (result.summary) {
      const summaryToggle = document.createElement('button');
      summaryToggle.textContent = '🗂 Summary/Full';
      summaryToggle.style.cssText = `
        margin-top: 8px;
        padding: 4px 8px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      `;
      
      let showingSummary = false;
      summaryToggle.addEventListener('click', () => {
        if (showingSummary) {
          transcriptText.textContent = result.transcript;
          summaryToggle.textContent = '🗂 Summary/Full';
        } else {
          transcriptText.textContent = result.summary;
          summaryToggle.textContent = '🗂 Full/Summary';
        }
        showingSummary = !showingSummary;
      });
      
      transcriptContainer.appendChild(summaryToggle);
    }
    
    // Insert after the transcribe button
    const transcribeButton = voiceMessageElement.parentNode.querySelector('.transcribe-btn');
    if (transcribeButton) {
      transcribeButton.parentNode.insertBefore(transcriptContainer, transcribeButton.nextSibling);
    } else {
      voiceMessageElement.parentNode.appendChild(transcriptContainer);
    }
  }

  // Generate summary
  generateSummary(transcript) {
    this.transcriber.postMessage({
      type: 'GENERATE_SUMMARY',
      data: { transcript }
    });
  }

  // Handle summary completion
  handleSummaryComplete(summaryData) {
    // Update the latest transcript with summary
    const transcriptionElements = document.querySelectorAll('.transcription-result');
    const latestElement = transcriptionElements[transcriptionElements.length - 1];
    
    if (latestElement) {
      // Add summary data to the element
      latestElement.summaryData = summaryData;
    }
  }

  // Save transcript to database
  async saveTranscript(result, context) {
    try {
      const transcriptData = {
        transcript: result.transcript,
        language: result.language,
        confidence: result.confidence,
        duration: result.duration,
        chatName: context.chatInfo.chatName,
        chatId: context.chatInfo.chatId,
        timestamp: context.chatInfo.timestamp,
        hasSummary: !!result.summary,
        summary: result.summary,
        keyPoints: result.keyPoints
      };
      
      // Use the database helper
      if (typeof transcriptDB !== 'undefined') {
        await transcriptDB.saveTranscript(transcriptData);
      }
      
    } catch (error) {
      console.error('Error saving transcript:', error);
    }
  }

  // Show loading state
  showLoadingState(voiceMessageElement) {
    const button = voiceMessageElement.parentNode.querySelector('.transcribe-btn');
    if (button) {
      button.textContent = '⏳ Transcribing...';
      button.disabled = true;
      button.style.background = '#666';
    }
  }

  // Remove loading state
  removeLoadingState(voiceMessageElement) {
    const button = voiceMessageElement.parentNode.querySelector('.transcribe-btn');
    if (button) {
      button.textContent = '➜ 📝 Transcribe';
      button.disabled = false;
      button.style.background = '#25D366';
    }
  }

  // Show error
  showError(voiceMessageElement, errorMessage) {
    this.removeLoadingState(voiceMessageElement);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      margin-top: 8px;
      padding: 8px;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
      font-size: 12px;
      border-left: 3px solid #c62828;
    `;
    errorDiv.textContent = `Error: ${errorMessage}`;
    
    voiceMessageElement.parentNode.appendChild(errorDiv);
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'transcriber-toast';
    
    const colors = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      background: ${colors[type] || colors.info};
      color: white;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Show Chrome notification
  showNotification(transcript) {
    const title = 'WhatsApp Voice Transcriber';
    const message = transcript.length > 120 ? 
      transcript.substring(0, 120) + '...' : transcript;
    
    chrome.runtime.sendMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      message
    });
  }

  // Get battery level
  async getBatteryLevel() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_BATTERY_LEVEL' }, (response) => {
        resolve(response ? response.level : 1.0);
      });
    });
  }

  // Add keyboard shortcuts
  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl + Alt + T to transcribe latest voice message
      if (e.ctrlKey && e.altKey && e.key === 'T') {
        e.preventDefault();
        this.transcribeLatestVoiceMessage();
      }
    });
  }

  // Transcribe the latest voice message
  transcribeLatestVoiceMessage() {
    const voiceMessages = document.querySelectorAll(this.selectors.voiceMessage);
    const latestMessage = voiceMessages[voiceMessages.length - 1];
    
    if (latestMessage) {
      this.transcribeVoiceMessage(latestMessage);
    } else {
      this.showToast('No voice messages found', 'warning');
    }
  }

  // Inject CSS styles
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .transcribe-btn:hover {
        background: #128C7E !important;
      }
      
      .transcription-result {
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // Cleanup
  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.transcriber) {
      this.transcriber.terminate();
    }
    
    console.log('WhatsApp Voice Transcriber cleaned up');
  }
}

// Initialize the transcriber when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppVoiceTranscriber();
  });
} else {
  new WhatsAppVoiceTranscriber();
}

// Handle messages from service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'TRANSCRIBE_LATEST':
      // This will be handled by the transcriber instance
      break;
      
    case 'SAVE_TO_DB':
      // Handle saving to database
      if (typeof transcriptDB !== 'undefined') {
        transcriptDB.saveTranscript(request.data);
      }
      break;
  }
}); 