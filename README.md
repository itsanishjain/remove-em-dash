# ChatGPT Copy Fix Chrome Extension

A simple Chrome extension that removes em dashes (—) when copying text from ChatGPT responses.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the folder containing this extension
4. The extension will be automatically active on ChatGPT pages

## How it works

The extension intercepts clicks on ChatGPT's copy buttons and automatically removes em dashes from the copied text before placing it in your clipboard.

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main script that handles copy button interception
- `README.md` - This file

## Usage

Simply click any copy button on ChatGPT as usual. The extension will automatically clean the text by removing em dashes before copying it to your clipboard.