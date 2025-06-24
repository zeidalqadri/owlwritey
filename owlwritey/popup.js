// Popup JavaScript for WhatsApp Voice Transcriber
// Handles search, filtering, and export functionality

class PopupManager {
  constructor() {
    this.transcripts = [];
    this.filteredTranscripts = [];
    this.currentFilters = {
      search: '',
      language: '',
      chat: '',
      hasSummary: false
    };
    
    this.init();
  }

  async init() {
    try {
      // Initialize database
      await transcriptDB.init();
      
      // Load transcripts
      await this.loadTranscripts();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Update UI
      this.updateUI();
      
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showError('Failed to load transcripts');
    }
  }

  // Load transcripts from database
  async loadTranscripts() {
    try {
      this.showLoading(true);
      
      this.transcripts = await transcriptDB.getAllTranscripts();
      this.filteredTranscripts = [...this.transcripts];
      
      this.showLoading(false);
      
      // Update chat filter options
      this.updateChatFilter();
      
    } catch (error) {
      console.error('Error loading transcripts:', error);
      this.showError('Failed to load transcripts');
      this.showLoading(false);
    }
  }

  // Set up event listeners
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    searchInput.addEventListener('input', (e) => {
      this.currentFilters.search = e.target.value;
      this.applyFilters();
    });
    
    searchBtn.addEventListener('click', () => {
      this.applyFilters();
    });
    
    // Filter controls
    const languageFilter = document.getElementById('languageFilter');
    const chatFilter = document.getElementById('chatFilter');
    const summaryFilter = document.getElementById('summaryFilter');
    
    languageFilter.addEventListener('change', (e) => {
      this.currentFilters.language = e.target.value;
      this.applyFilters();
    });
    
    chatFilter.addEventListener('change', (e) => {
      this.currentFilters.chat = e.target.value;
      this.applyFilters();
    });
    
    summaryFilter.addEventListener('change', (e) => {
      this.currentFilters.hasSummary = e.target.checked;
      this.applyFilters();
    });
    
    // Export buttons
    const exportMarkdown = document.getElementById('exportMarkdown');
    const exportJSON = document.getElementById('exportJSON');
    const clearAll = document.getElementById('clearAll');
    
    exportMarkdown.addEventListener('click', () => {
      this.exportToMarkdown();
    });
    
    exportJSON.addEventListener('click', () => {
      this.exportToJSON();
    });
    
    clearAll.addEventListener('click', () => {
      this.clearAllTranscripts();
    });
    
    // Footer buttons
    const openOptions = document.getElementById('openOptions');
    const refreshBtn = document.getElementById('refreshBtn');
    
    openOptions.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    
    refreshBtn.addEventListener('click', () => {
      this.loadTranscripts();
    });
  }

  // Apply filters and update display
  async applyFilters() {
    try {
      let filtered = [...this.transcripts];
      
      // Apply search filter
      if (this.currentFilters.search) {
        const searchResults = await transcriptDB.searchTranscripts(this.currentFilters.search);
        filtered = filtered.filter(t => searchResults.some(s => s.id === t.id));
      }
      
      // Apply language filter
      if (this.currentFilters.language) {
        filtered = filtered.filter(t => t.language === this.currentFilters.language);
      }
      
      // Apply chat filter
      if (this.currentFilters.chat) {
        filtered = filtered.filter(t => t.chatId === this.currentFilters.chat);
      }
      
      // Apply summary filter
      if (this.currentFilters.hasSummary) {
        filtered = filtered.filter(t => t.hasSummary);
      }
      
      this.filteredTranscripts = filtered;
      this.updateUI();
      
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  // Update the UI with current data
  updateUI() {
    this.updateTranscriptList();
    this.updateStats();
    this.updateExportButtons();
  }

  // Update transcript list display
  updateTranscriptList() {
    const transcriptsList = document.getElementById('transcriptsList');
    const noResults = document.getElementById('noResults');
    
    if (this.filteredTranscripts.length === 0) {
      transcriptsList.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    
    transcriptsList.style.display = 'block';
    noResults.style.display = 'none';
    
    // Sort by timestamp (newest first)
    const sortedTranscripts = [...this.filteredTranscripts].sort((a, b) => b.timestamp - a.timestamp);
    
    transcriptsList.innerHTML = sortedTranscripts.map(transcript => 
      this.createTranscriptElement(transcript)
    ).join('');
  }

  // Create HTML element for a transcript
  createTranscriptElement(transcript) {
    const date = new Date(transcript.timestamp).toLocaleString();
    const language = transcript.language || 'unknown';
    const chatName = transcript.chatName || 'Unknown Chat';
    
    let summaryHtml = '';
    if (transcript.hasSummary && transcript.summary) {
      summaryHtml = `
        <div class="transcript-summary">
          <strong>Summary:</strong> ${transcript.summary}
        </div>
      `;
    }
    
    let keyPointsHtml = '';
    if (transcript.keyPoints && transcript.keyPoints.length > 0) {
      keyPointsHtml = `
        <div class="transcript-keypoints">
          <strong>Key Points:</strong>
          <ul>
            ${transcript.keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    return `
      <div class="transcript-item" data-id="${transcript.id}">
        <div class="transcript-header">
          <div class="transcript-meta">
            <span class="chat-name">${this.escapeHtml(chatName)}</span>
            <span class="timestamp">${date}</span>
            <span class="language">(${language})</span>
          </div>
          <div class="transcript-actions">
            <button class="delete-btn" onclick="popupManager.deleteTranscript('${transcript.id}')">🗑️</button>
          </div>
        </div>
        
        <div class="transcript-content">
          <div class="transcript-text">${this.escapeHtml(transcript.transcript)}</div>
          ${summaryHtml}
          ${keyPointsHtml}
        </div>
        
        <div class="transcript-footer">
          <span class="confidence">Confidence: ${(transcript.confidence * 100).toFixed(1)}%</span>
          ${transcript.duration ? `<span class="duration">Duration: ${transcript.duration.toFixed(1)}s</span>` : ''}
        </div>
      </div>
    `;
  }

  // Update statistics display
  updateStats() {
    const totalCount = document.getElementById('totalCount');
    totalCount.textContent = this.transcripts.length;
  }

  // Update export buttons state
  updateExportButtons() {
    const exportButtons = document.querySelectorAll('.export-btn');
    const clearButton = document.getElementById('clearAll');
    
    const hasTranscripts = this.transcripts.length > 0;
    
    exportButtons.forEach(btn => {
      btn.disabled = !hasTranscripts;
      btn.style.opacity = hasTranscripts ? '1' : '0.5';
    });
    
    clearButton.disabled = !hasTranscripts;
    clearButton.style.opacity = hasTranscripts ? '1' : '0.5';
  }

  // Update chat filter options
  updateChatFilter() {
    const chatFilter = document.getElementById('chatFilter');
    const chats = [...new Set(this.transcripts.map(t => t.chatId).filter(Boolean))];
    
    // Clear existing options except "All Chats"
    chatFilter.innerHTML = '<option value="">All Chats</option>';
    
    // Add chat options
    chats.forEach(chatId => {
      const chatName = this.transcripts.find(t => t.chatId === chatId)?.chatName || chatId;
      const option = document.createElement('option');
      option.value = chatId;
      option.textContent = this.escapeHtml(chatName);
      chatFilter.appendChild(option);
    });
  }

  // Export to Markdown
  async exportToMarkdown() {
    try {
      const markdown = await transcriptDB.exportToMarkdown();
      this.downloadFile(markdown, 'whatsapp-transcripts.md', 'text/markdown');
    } catch (error) {
      console.error('Error exporting to Markdown:', error);
      this.showError('Failed to export to Markdown');
    }
  }

  // Export to JSON
  async exportToJSON() {
    try {
      const json = await transcriptDB.exportToJSON();
      this.downloadFile(json, 'whatsapp-transcripts.json', 'application/json');
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      this.showError('Failed to export to JSON');
    }
  }

  // Download file
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showSuccess('Export completed!');
  }

  // Clear all transcripts
  async clearAllTranscripts() {
    if (!confirm('Are you sure you want to delete all transcripts? This action cannot be undone.')) {
      return;
    }
    
    try {
      await transcriptDB.clearAll();
      this.transcripts = [];
      this.filteredTranscripts = [];
      this.updateUI();
      this.showSuccess('All transcripts cleared');
    } catch (error) {
      console.error('Error clearing transcripts:', error);
      this.showError('Failed to clear transcripts');
    }
  }

  // Delete single transcript
  async deleteTranscript(id) {
    if (!confirm('Are you sure you want to delete this transcript?')) {
      return;
    }
    
    try {
      await transcriptDB.deleteTranscript(id);
      
      // Remove from local arrays
      this.transcripts = this.transcripts.filter(t => t.id !== id);
      this.filteredTranscripts = this.filteredTranscripts.filter(t => t.id !== id);
      
      this.updateUI();
      this.showSuccess('Transcript deleted');
    } catch (error) {
      console.error('Error deleting transcript:', error);
      this.showError('Failed to delete transcript');
    }
  }

  // Show loading indicator
  showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const transcriptsList = document.getElementById('transcriptsList');
    
    if (show) {
      loadingIndicator.style.display = 'flex';
      transcriptsList.style.display = 'none';
    } else {
      loadingIndicator.style.display = 'none';
      transcriptsList.style.display = 'block';
    }
  }

  // Show success message
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  // Show error message
  showError(message) {
    this.showToast(message, 'error');
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.popupManager = new PopupManager();
}); 