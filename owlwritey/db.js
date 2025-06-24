// IndexedDB helper module for WhatsApp Voice Transcriber
// Manages transcript storage, search, and export functionality

class TranscriptDB {
  constructor() {
    this.dbName = 'WhatsAppTranscriberDB';
    this.dbVersion = 1;
    this.storeName = 'transcripts';
    this.db = null;
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Create indexes for efficient querying
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('chatId', 'chatId', { unique: false });
          store.createIndex('language', 'language', { unique: false });
          store.createIndex('hasSummary', 'hasSummary', { unique: false });
        }
      };
    });
  }

  // Save transcript to database
  async saveTranscript(transcriptData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const data = {
        ...transcriptData,
        timestamp: Date.now(),
        id: Date.now() + Math.random() // Simple unique ID
      };

      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all transcripts
  async getAllTranscripts() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Search transcripts by text (regex)
  async searchTranscripts(searchTerm) {
    if (!this.db) await this.init();

    const allTranscripts = await this.getAllTranscripts();
    const regex = new RegExp(searchTerm, 'i');

    return allTranscripts.filter(transcript => 
      regex.test(transcript.transcript) || 
      regex.test(transcript.summary || '') ||
      regex.test(transcript.chatName || '')
    );
  }

  // Filter transcripts by criteria
  async filterTranscripts(filters = {}) {
    if (!this.db) await this.init();

    const allTranscripts = await this.getAllTranscripts();
    
    return allTranscripts.filter(transcript => {
      if (filters.chatId && transcript.chatId !== filters.chatId) return false;
      if (filters.language && transcript.language !== filters.language) return false;
      if (filters.hasSummary && transcript.hasSummary !== filters.hasSummary) return false;
      if (filters.startDate && transcript.timestamp < filters.startDate) return false;
      if (filters.endDate && transcript.timestamp > filters.endDate) return false;
      return true;
    });
  }

  // Get transcript by ID
  async getTranscript(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Update transcript
  async updateTranscript(id, updates) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // First get the existing record
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Transcript not found'));
          return;
        }

        const updated = { ...existing, ...updates };
        const putRequest = store.put(updated);
        
        putRequest.onsuccess = () => resolve(putRequest.result);
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Delete transcript
  async deleteTranscript(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all transcripts
  async clearAll() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Export transcripts to Markdown
  async exportToMarkdown() {
    const transcripts = await this.getAllTranscripts();
    
    let markdown = '# WhatsApp Voice Transcripts\n\n';
    
    transcripts.sort((a, b) => b.timestamp - a.timestamp);
    
    transcripts.forEach(transcript => {
      const date = new Date(transcript.timestamp).toLocaleString();
      markdown += `## ${transcript.chatName || 'Unknown Chat'} - ${date}\n\n`;
      markdown += `**Language:** ${transcript.language || 'Unknown'}\n\n`;
      markdown += `**Transcript:**\n${transcript.transcript}\n\n`;
      
      if (transcript.summary) {
        markdown += `**Summary:**\n${transcript.summary}\n\n`;
      }
      
      if (transcript.keyPoints && transcript.keyPoints.length > 0) {
        markdown += `**Key Points:**\n`;
        transcript.keyPoints.forEach(point => {
          markdown += `- ${point}\n`;
        });
        markdown += '\n';
      }
      
      markdown += '---\n\n';
    });
    
    return markdown;
  }

  // Export transcripts to JSON
  async exportToJSON() {
    const transcripts = await this.getAllTranscripts();
    return JSON.stringify(transcripts, null, 2);
  }

  // Get statistics
  async getStats() {
    const transcripts = await this.getAllTranscripts();
    
    const stats = {
      total: transcripts.length,
      languages: {},
      chats: {},
      withSummaries: 0,
      totalDuration: 0
    };

    transcripts.forEach(transcript => {
      // Language stats
      const lang = transcript.language || 'unknown';
      stats.languages[lang] = (stats.languages[lang] || 0) + 1;
      
      // Chat stats
      const chat = transcript.chatName || 'unknown';
      stats.chats[chat] = (stats.chats[chat] || 0) + 1;
      
      // Summary stats
      if (transcript.hasSummary) stats.withSummaries++;
      
      // Duration stats
      if (transcript.duration) stats.totalDuration += transcript.duration;
    });

    return stats;
  }
}

// Create global instance
const transcriptDB = new TranscriptDB();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TranscriptDB;
} 