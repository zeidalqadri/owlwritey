// Whisper Worker for WhatsApp Voice Transcriber
// Handles local transcription using Transformers.js and Whisper models

// Import Transformers.js (this would be loaded via CDN in the actual implementation)
// import { pipeline, AutoTokenizer, AutoModelForSpeechSeq2Seq } from '@xenova/transformers';

class WhisperTranscriber {
  constructor() {
    this.pipeline = null;
    this.currentModel = 'whisper-tiny';
    this.isInitialized = false;
    this.isTranscribing = false;
    this.supportedLanguages = {
      'en': 'english',
      'es': 'spanish',
      'fr': 'french',
      'de': 'german',
      'it': 'italian',
      'pt': 'portuguese',
      'ru': 'russian',
      'ja': 'japanese',
      'ko': 'korean',
      'zh': 'chinese',
      'ar': 'arabic',
      'hi': 'hindi'
    };
  }

  // Initialize the transcription pipeline
  async initialize(modelName = 'whisper-tiny') {
    if (this.isInitialized && this.currentModel === modelName) {
      return;
    }

    try {
      console.log(`Initializing Whisper model: ${modelName}`);
      
      // In a real implementation, this would load the actual Transformers.js pipeline
      // For now, we'll simulate the initialization
      await this.loadModel(modelName);
      
      this.currentModel = modelName;
      this.isInitialized = true;
      console.log('Whisper model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Whisper model:', error);
      throw error;
    }
  }

  // Load the Whisper model
  async loadModel(modelName) {
    // Simulate model loading - in real implementation this would use Transformers.js
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Model ${modelName} loaded successfully`);
        resolve();
      }, 1000);
    });
  }

  // Convert audio blob to the format expected by Whisper
  async prepareAudio(audioBlob) {
    try {
      // Convert blob to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Convert to Float32Array (simplified - in real implementation would use Web Audio API)
      const audioData = new Float32Array(arrayBuffer);
      
      // Resample to 16kHz if needed (Whisper expects 16kHz)
      const resampledAudio = await this.resampleAudio(audioData, 16000);
      
      return resampledAudio;
    } catch (error) {
      console.error('Error preparing audio:', error);
      throw error;
    }
  }

  // Simple audio resampling (simplified implementation)
  async resampleAudio(audioData, targetSampleRate) {
    // This is a simplified resampling - in production would use proper resampling
    return audioData;
  }

  // Transcribe audio
  async transcribe(audioBlob, options = {}) {
    if (this.isTranscribing) {
      throw new Error('Transcription already in progress');
    }

    this.isTranscribing = true;

    try {
      // Check battery level if battery saver is enabled
      if (options.batterySaver) {
        const batteryLevel = await this.getBatteryLevel();
        if (batteryLevel < 0.2) {
          throw new Error('Battery level too low for transcription');
        }
      }

      // Prepare audio
      const audioData = await this.prepareAudio(audioBlob);
      
      // Determine language
      const language = options.language || 'auto';
      
      // Perform transcription
      const result = await this.performTranscription(audioData, language);
      
      return result;
    } finally {
      this.isTranscribing = false;
    }
  }

  // Perform the actual transcription
  async performTranscription(audioData, language) {
    // Simulate transcription process with streaming
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Simulate streaming transcription
      let partialResult = '';
      const finalResult = this.generateMockTranscript(language);
      
      const streamInterval = setInterval(() => {
        const progress = Math.min((Date.now() - startTime) / 3000, 1); // 3 second simulation
        const currentLength = Math.floor(finalResult.length * progress);
        partialResult = finalResult.substring(0, currentLength);
        
        // Send partial result
        this.postMessage({
          type: 'PARTIAL_TRANSCRIPT',
          data: partialResult,
          progress: progress
        });
        
        if (progress >= 1) {
          clearInterval(streamInterval);
          
          const result = {
            transcript: finalResult,
            language: this.detectLanguage(finalResult),
            confidence: 0.95,
            duration: (Date.now() - startTime) / 1000
          };
          
          resolve(result);
        }
      }, 100);
    });
  }

  // Generate mock transcript for demonstration
  generateMockTranscript(language) {
    const transcripts = {
      'en': "Hello, this is a test voice message. I'm demonstrating the transcription functionality of the WhatsApp Voice Transcriber extension. It works entirely locally on your device for maximum privacy.",
      'es': "Hola, este es un mensaje de voz de prueba. Estoy demostrando la funcionalidad de transcripción de la extensión WhatsApp Voice Transcriber. Funciona completamente localmente en tu dispositivo para máxima privacidad.",
      'fr': "Bonjour, ceci est un message vocal de test. Je démontre la fonctionnalité de transcription de l'extension WhatsApp Voice Transcriber. Elle fonctionne entièrement localement sur votre appareil pour une confidentialité maximale.",
      'auto': "Hello, this is a test voice message. I'm demonstrating the transcription functionality of the WhatsApp Voice Transcriber extension. It works entirely locally on your device for maximum privacy."
    };
    
    return transcripts[language] || transcripts['en'];
  }

  // Detect language from transcript
  detectLanguage(transcript) {
    // Simple language detection based on common words
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('hola') || lowerTranscript.includes('gracias')) return 'es';
    if (lowerTranscript.includes('bonjour') || lowerTranscript.includes('merci')) return 'fr';
    if (lowerTranscript.includes('guten tag') || lowerTranscript.includes('danke')) return 'de';
    if (lowerTranscript.includes('ciao') || lowerTranscript.includes('grazie')) return 'it';
    if (lowerTranscript.includes('olá') || lowerTranscript.includes('obrigado')) return 'pt';
    if (lowerTranscript.includes('привет') || lowerTranscript.includes('спасибо')) return 'ru';
    if (lowerTranscript.includes('こんにちは') || lowerTranscript.includes('ありがとう')) return 'ja';
    if (lowerTranscript.includes('안녕하세요') || lowerTranscript.includes('감사합니다')) return 'ko';
    if (lowerTranscript.includes('你好') || lowerTranscript.includes('谢谢')) return 'zh';
    if (lowerTranscript.includes('مرحبا') || lowerTranscript.includes('شكرا')) return 'ar';
    if (lowerTranscript.includes('नमस्ते') || lowerTranscript.includes('धन्यवाद')) return 'hi';
    
    return 'en'; // Default to English
  }

  // Get battery level
  async getBatteryLevel() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        return battery.level;
      } catch (error) {
        console.warn('Battery API not available:', error);
        return 1.0;
      }
    }
    return 1.0;
  }

  // Post message to main thread
  postMessage(message) {
    if (typeof self !== 'undefined' && self.postMessage) {
      self.postMessage(message);
    } else if (typeof window !== 'undefined' && window.postMessage) {
      window.postMessage(message, '*');
    }
  }

  // Generate summary using a local model
  async generateSummary(transcript) {
    // Simulate summary generation
    const sentences = transcript.split('. ').filter(s => s.trim().length > 0);
    const summary = sentences[0] + '.';
    
    const keyPoints = sentences.slice(1, 4).map(sentence => 
      sentence.trim().replace(/^[A-Z]/, (match) => match.toLowerCase())
    );
    
    return {
      summary,
      keyPoints
    };
  }

  // Switch to a different language model
  async switchLanguageModel(language) {
    const modelMap = {
      'en': 'whisper-tiny.en',
      'es': 'whisper-tiny.es',
      'fr': 'whisper-tiny.fr',
      'de': 'whisper-tiny.de',
      'auto': 'whisper-tiny'
    };
    
    const modelName = modelMap[language] || 'whisper-tiny';
    await this.initialize(modelName);
  }

  // Clean up resources
  async cleanup() {
    this.pipeline = null;
    this.isInitialized = false;
    console.log('Whisper transcriber cleaned up');
  }
}

// Create global instance
const whisperTranscriber = new WhisperTranscriber();

// Handle messages from main thread
if (typeof self !== 'undefined') {
  self.addEventListener('message', async (event) => {
    const { type, data } = event.data;
    
    try {
      switch (type) {
        case 'INITIALIZE':
          await whisperTranscriber.initialize(data.modelName);
          self.postMessage({ type: 'INITIALIZED' });
          break;
          
        case 'TRANSCRIBE':
          const result = await whisperTranscriber.transcribe(data.audioBlob, data.options);
          self.postMessage({ type: 'TRANSCRIPTION_COMPLETE', data: result });
          break;
          
        case 'GENERATE_SUMMARY':
          const summary = await whisperTranscriber.generateSummary(data.transcript);
          self.postMessage({ type: 'SUMMARY_COMPLETE', data: summary });
          break;
          
        case 'SWITCH_LANGUAGE':
          await whisperTranscriber.switchLanguageModel(data.language);
          self.postMessage({ type: 'LANGUAGE_SWITCHED' });
          break;
          
        case 'CLEANUP':
          await whisperTranscriber.cleanup();
          self.postMessage({ type: 'CLEANUP_COMPLETE' });
          break;
      }
    } catch (error) {
      self.postMessage({ 
        type: 'ERROR', 
        error: error.message 
      });
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WhisperTranscriber;
} 