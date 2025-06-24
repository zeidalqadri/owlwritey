# WhatsApp Web Voice-Note Transcriber

A privacy-first Chrome extension that transcribes WhatsApp Web voice messages locally using Whisper AI. All processing happens on your device - no audio data is ever sent to external servers.

## 🔒 Privacy First

- **100% Local Processing**: All transcription happens on your device using Whisper AI
- **No Data Upload**: Audio files are never sent to external servers
- **Local Storage**: Transcripts are stored locally in your browser's IndexedDB
- **Full Control**: You have complete control over your data

## ✨ Features

### Core Functionality (MVP)
- 🎤 **Voice Message Detection**: Automatically detects new voice messages on WhatsApp Web
- 📝 **Inline Transcription**: Adds a "Transcribe" button next to each voice message
- 🔄 **Local Processing**: Uses Whisper AI via Transformers.js for on-device transcription
- 📱 **Chrome Notifications**: Shows notifications with transcript previews
- ⌨️ **Keyboard Shortcuts**: Ctrl+Alt+T to transcribe the latest voice message

### Enhanced Features (Phase 2)
- 🌍 **Multilingual Support**: Auto-detects language and supports 12+ languages
- 📊 **Smart Summaries**: Generates one-sentence summaries and key points
- 🗂️ **Persistent Library**: Search, filter, and export your transcript history
- ⚡ **Battery Optimization**: Pauses transcription when battery is low
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode support
- ⚙️ **Customizable Settings**: Fine-tune transcription preferences

## 🚀 Installation

### Development Setup

1. **Clone or Download**
   ```bash
   git clone <repository-url>
   cd whatsapp-voice-transcriber
   ```

2. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension directory

3. **Access WhatsApp Web**
   - Go to [web.whatsapp.com](https://web.whatsapp.com)
   - Scan the QR code with your phone
   - The extension will automatically activate

### Web Store Installation (Coming Soon)
- Search for "WhatsApp Voice Transcriber" in the Chrome Web Store
- Click "Add to Chrome"
- No additional setup required

## 📖 Usage

### Basic Usage
1. **Open WhatsApp Web** in Chrome
2. **Receive a voice message** - the extension automatically detects it
3. **Click "Transcribe"** or wait for auto-transcription
4. **View the transcript** inline below the voice message

### Advanced Features
- **Search Transcripts**: Use the popup to search through your transcript history
- **Export Data**: Export transcripts as Markdown or JSON files
- **Language Detection**: Automatically detects and displays the language
- **Summaries**: Toggle between full transcript and summary view

### Keyboard Shortcuts
- `Ctrl + Alt + T`: Transcribe the latest voice message
- `Ctrl + S` (in options): Save settings
- `Ctrl + R` (in options): Reset to defaults

## ⚙️ Configuration

### Settings Page
Access settings by clicking the extension icon → "Settings" or go to `chrome://extensions/` → "Details" → "Extension options"

**Transcription Settings:**
- **Auto-transcribe**: Automatically transcribe new voice messages
- **Generate summaries**: Create summaries and key points
- **Store history**: Save transcripts for search and export
- **Language detection**: Auto-detect or specify language

**Performance Settings:**
- **Battery saver**: Pause transcription when battery < 20%
- **Model size**: Choose between fast (tiny) or accurate (base) models
- **Streaming**: Show partial results as transcription progresses

## 🛠️ Technical Details

### Architecture
- **Content Script**: Detects voice messages and handles UI
- **Service Worker**: Manages background tasks and notifications
- **IndexedDB**: Local storage for transcripts and settings
- **Web Workers**: Handles transcription processing
- **Transformers.js**: Runs Whisper AI models locally

### Supported Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)

### File Structure
```
whatsapp-voice-transcriber/
├── manifest.json          # Extension manifest
├── content.js             # Main content script
├── service_worker.js      # Background service worker
├── db.js                  # IndexedDB helper
├── whisper-worker.js      # Transcription worker
├── popup.html             # Extension popup
├── popup.js               # Popup functionality
├── options.html           # Settings page
├── options.js             # Settings management
├── styles.css             # Shared styles
├── assets/
│   └── icons/             # Extension icons
├── tests/                 # Test files
├── README.md              # This file
├── PRIVACY_POLICY.md      # Privacy policy
└── STORE_DESCRIPTION.md   # Web Store listing
```

## 🧪 Testing

### Manual Testing Checklist
1. **Installation**: Load unpacked extension successfully
2. **Detection**: Voice messages are detected on WhatsApp Web
3. **Transcription**: Click transcribe button works
4. **Auto-transcribe**: New messages are transcribed automatically
5. **Language Detection**: Different languages are detected correctly
6. **Summaries**: Summary toggle works properly
7. **Search**: Popup search finds transcripts
8. **Export**: Markdown and JSON export work
9. **Settings**: All settings save and load correctly
10. **Battery Saver**: Transcription pauses when battery is low

### Automated Tests
Run the test suite:
```bash
# Install dependencies (if any)
npm install

# Run tests
npm test
```

## 🔧 Development

### Building for Production
1. **Optimize Code**: Minify JavaScript and CSS
2. **Create Icons**: Generate all required icon sizes
3. **Update Version**: Increment version in manifest.json
4. **Test Thoroughly**: Run all tests and manual checks
5. **Package**: Create ZIP file for Web Store submission

### Adding New Features
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Implement**: Add code and tests
3. **Test**: Run tests and manual verification
4. **Document**: Update README and comments
5. **Submit PR**: Create pull request for review

## 📝 Privacy Policy

This extension:
- ✅ Processes all audio locally on your device
- ✅ Never uploads audio files to external servers
- ✅ Stores transcripts only in your browser's local storage
- ✅ Does not collect or share any personal data
- ✅ Respects your privacy and data ownership

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for complete details.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd whatsapp-voice-transcriber

# Install dependencies (if any)
npm install

# Start development
# Load extension in Chrome as described above
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Extension not working:**
- Ensure you're on WhatsApp Web (web.whatsapp.com)
- Check that the extension is enabled
- Refresh the page and try again

**Transcription not starting:**
- Check your internet connection (for initial model download)
- Verify microphone permissions
- Try refreshing the page

**Slow transcription:**
- Switch to "Tiny" model in settings for faster processing
- Close other tabs to free up memory
- Ensure battery saver is not enabled

### Getting Help
- 📧 **Email**: support@example.com
- 🐛 **Issues**: Create an issue on GitHub
- 📖 **Documentation**: Check this README and inline help

## 🗺️ Roadmap

### Version 1.1
- [ ] Voice command control
- [ ] Cross-tab synchronization
- [ ] Custom keyboard shortcuts
- [ ] Advanced filtering options

### Version 1.2
- [ ] Offline mode improvements
- [ ] Batch transcription
- [ ] Custom language models
- [ ] Integration with other messaging platforms

### Version 2.0
- [ ] Real-time transcription
- [ ] Speaker identification
- [ ] Sentiment analysis
- [ ] Advanced analytics

---

**Made with ❤️ for privacy-conscious users** 