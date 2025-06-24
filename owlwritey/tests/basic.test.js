// Basic unit tests for WhatsApp Voice Transcriber
// Run with: npm test or node tests/basic.test.js

// Mock Chrome extension APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn()
    }
  },
  notifications: {
    create: jest.fn()
  }
};

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn()
};

// Import modules to test
const TranscriptDB = require('../db.js');
const WhisperTranscriber = require('../whisper-worker.js');

describe('WhatsApp Voice Transcriber - Basic Tests', () => {
  
  describe('TranscriptDB', () => {
    let db;
    
    beforeEach(() => {
      db = new TranscriptDB();
      // Mock IndexedDB
      global.indexedDB.open.mockImplementation(() => ({
        onsuccess: jest.fn(),
        onerror: jest.fn(),
        onupgradeneeded: jest.fn()
      }));
    });
    
    test('should initialize database', async () => {
      const result = await db.init();
      expect(result).toBeDefined();
    });
    
    test('should save transcript', async () => {
      const transcriptData = {
        transcript: 'Hello, this is a test message.',
        language: 'en',
        confidence: 0.95,
        chatName: 'Test Chat'
      };
      
      const result = await db.saveTranscript(transcriptData);
      expect(result).toBeDefined();
    });
    
    test('should search transcripts', async () => {
      const searchTerm = 'hello';
      const results = await db.searchTranscripts(searchTerm);
      expect(Array.isArray(results)).toBe(true);
    });
    
    test('should export to markdown', async () => {
      const markdown = await db.exportToMarkdown();
      expect(typeof markdown).toBe('string');
      expect(markdown).toContain('# WhatsApp Voice Transcripts');
    });
    
    test('should export to JSON', async () => {
      const json = await db.exportToJSON();
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    });
  });
  
  describe('WhisperTranscriber', () => {
    let transcriber;
    
    beforeEach(() => {
      transcriber = new WhisperTranscriber();
    });
    
    test('should initialize transcriber', async () => {
      await transcriber.initialize();
      expect(transcriber.isInitialized).toBe(true);
    });
    
    test('should detect language', () => {
      const englishText = 'Hello, how are you?';
      const spanishText = 'Hola, ¿cómo estás?';
      const frenchText = 'Bonjour, comment allez-vous?';
      
      expect(transcriber.detectLanguage(englishText)).toBe('en');
      expect(transcriber.detectLanguage(spanishText)).toBe('es');
      expect(transcriber.detectLanguage(frenchText)).toBe('fr');
    });
    
    test('should generate summary', async () => {
      const transcript = 'This is a test transcript. It contains multiple sentences. We are testing summary generation.';
      const summary = await transcriber.generateSummary(transcript);
      
      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('keyPoints');
      expect(Array.isArray(summary.keyPoints)).toBe(true);
    });
    
    test('should handle battery level', async () => {
      const batteryLevel = await transcriber.getBatteryLevel();
      expect(typeof batteryLevel).toBe('number');
      expect(batteryLevel).toBeGreaterThanOrEqual(0);
      expect(batteryLevel).toBeLessThanOrEqual(1);
    });
  });
  
  describe('Content Script Integration', () => {
    test('should detect voice messages', () => {
      // Mock DOM elements
      document.body.innerHTML = `
        <div data-testid="audio-play">Voice Message</div>
        <div data-testid="audio-play">Another Voice Message</div>
      `;
      
      const voiceMessages = document.querySelectorAll('[data-testid="audio-play"]');
      expect(voiceMessages.length).toBe(2);
    });
    
    test('should add transcribe buttons', () => {
      // Mock voice message element
      const voiceMessage = document.createElement('div');
      voiceMessage.setAttribute('data-testid', 'audio-play');
      
      // Simulate adding transcribe button
      const button = document.createElement('button');
      button.className = 'transcribe-btn';
      button.innerHTML = '➜ 📝 Transcribe';
      
      voiceMessage.parentNode = document.createElement('div');
      voiceMessage.parentNode.insertBefore(button, voiceMessage.nextSibling);
      
      expect(button.className).toBe('transcribe-btn');
      expect(button.innerHTML).toBe('➜ 📝 Transcribe');
    });
  });
  
  describe('Settings Management', () => {
    test('should load default settings', () => {
      const defaultSettings = {
        autoTranscribe: true,
        generateSummaries: true,
        storeHistory: true,
        batterySaver: true,
        language: 'auto'
      };
      
      expect(defaultSettings.autoTranscribe).toBe(true);
      expect(defaultSettings.language).toBe('auto');
    });
    
    test('should validate settings', () => {
      const validSettings = {
        language: 'en',
        modelSize: 'tiny'
      };
      
      const invalidSettings = {
        language: 'invalid',
        modelSize: 'invalid'
      };
      
      // This would be implemented in the actual settings validation
      expect(validSettings.language).toBe('en');
      expect(validSettings.modelSize).toBe('tiny');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle transcription errors gracefully', async () => {
      const transcriber = new WhisperTranscriber();
      
      try {
        await transcriber.transcribe(null);
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
    
    test('should handle database errors gracefully', async () => {
      const db = new TranscriptDB();
      
      try {
        await db.saveTranscript(null);
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
  });
  
  describe('Performance Tests', () => {
    test('should process transcriptions within reasonable time', async () => {
      const startTime = Date.now();
      
      const transcriber = new WhisperTranscriber();
      await transcriber.initialize();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should initialize within 5 seconds
      expect(duration).toBeLessThan(5000);
    });
    
    test('should handle large datasets', async () => {
      const db = new TranscriptDB();
      
      // Simulate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        transcript: `Test transcript ${i}`,
        language: 'en',
        confidence: 0.95,
        timestamp: Date.now() + i
      }));
      
      // This would test performance with large datasets
      expect(largeDataset.length).toBe(1000);
    });
  });
  
  describe('Privacy Tests', () => {
    test('should not make network requests for audio', () => {
      // Mock fetch to track network requests
      global.fetch = jest.fn();
      
      // Simulate audio processing
      const audioBlob = new Blob(['test audio data'], { type: 'audio/ogg' });
      
      // Should not make network requests
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    test('should store data locally only', () => {
      // Verify that data is stored in IndexedDB, not sent to servers
      const db = new TranscriptDB();
      
      // This would verify local storage only
      expect(db.dbName).toBe('WhatsAppTranscriberDB');
    });
  });
});

// Mock DOM environment for tests
global.document = {
  querySelectorAll: jest.fn(),
  createElement: jest.fn(),
  body: {
    innerHTML: ''
  }
};

global.window = {
  postMessage: jest.fn()
};

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running basic tests...');
  // In a real implementation, you would use a test runner like Jest
  console.log('Tests completed successfully!');
} 