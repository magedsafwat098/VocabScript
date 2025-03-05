# VocabScript - Chrome Extension

## Overview
VocabScript is a Chrome extension designed to help users learn English by translating selected words into Arabic. The extension saves all translations locally, allowing users to build their vocabulary over time, with automatic file updates for convenient review.

## Features
- Translate English words to Arabic with a right-click or from the extension popup
- Automatically save translations to a local file (vocabscript_translations.txt)
- View a history of all translations in the extension popup
- Delete individual translations or clear all translations
- Toggle automatic file updates on/off

## How to Use

### Translation Methods
1. **Right-click Translation:**
   - Select any English word on a webpage
   - Right-click and select "Translate with VocabScript"
   - The translation will appear and be saved automatically

2. **Extension Popup Translation:**
   - Click the VocabScript icon in the browser toolbar
   - Enter a word in the text field
   - Click "Translate" to get the Arabic translation

### Managing Translations
- **View History:** Open the extension popup to see a list of all translated words
- **Delete Individual Translations:** Click the red 'X' next to a translation 
- **Clear All Translations:** Use the "Clear All" button in the extension popup
- **Download Translations:** Click the "Download Translations" button to manually download your translation history
- **Auto-Download Setting:** Toggle the "Automatically update translations file" checkbox to control automatic file updates

## Technical Information
VocabScript uses Google's Translation API to provide accurate translations. All translations are stored locally in your browser and can be exported to a text file. The extension works offline once translations are stored.

## 🚀 First-Time Setup

1. **Get API Key**  
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project → Enable "Cloud Translation API"
   - Create credentials → API key

2. **Save API Key in Extension**  
   - Open VocabScript → Click the extension icon
   - Paste your API key in the "API Settings" section
   - Click "Save Key"

3. **Start Translating!**  
   - Right-click any English text or use the popup input
   - Translations auto-save to `vocabscript_translations.txt`

## Security Note
- Never share your exported extension files after saving an API key  
- Always restrict keys in Google Cloud Console 

## Installation
1. Clone this repository
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

## Features
- Right-click translation
- Translation history
- Auto-save to file 

## File Structure
- `manifest.json`: Extension configuration
- `background.js`: Handles background processes including translation API calls and file downloads
- `popup.html/js`: User interface for the extension popup
- `content.js`: Manages integration with webpage content for right-click translation
- `icon.png`: Extension icon

## Credits
Developed by Maged Safwat

## Copyright
All rights reserved © 2025 Maged Safwat. This extension and its code are the exclusive property of the developer. Unauthorized copying, modification, distribution, or use is strictly prohibited.

---

*Note: This extension requires the "downloads" permission to save your translations locally, and internet access for performing translations via Google's Translation API.*
