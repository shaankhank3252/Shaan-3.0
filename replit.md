# ARIF-MARIA-V3 - Facebook Messenger Chat Bot

## Overview
A Facebook Messenger chatbot project built with Node.js. The bot connects to Facebook's messaging platform and provides various commands and automated responses.

## Project Structure
- `index.js` - Main entry point that starts the Express server and spawns the bot process
- `ARIF-BABU.js` - Main bot logic that handles commands and events
- `modules/commands/` - Bot command modules
- `modules/events/` - Event handler modules
- `config.json` - Bot configuration settings
- `utils/` - Utility functions

## Running the Bot
The bot runs on port 5000 with an Express server for keep-alive functionality.

```bash
npm start
```

## Configuration
The bot requires Facebook credentials to be configured in `ARIF-LOGACC.json` with:
- EMAIL - Facebook account email
- PASSWORD - Facebook account password
- OTPKEY - 2FA OTP key (if enabled)

Alternatively, set ACCESSTOKEN directly in `config.json`.

## Database
Uses SQLite database (`data.sqlite`) for storing user data and bot state.

## Dependencies
The bot uses numerous npm packages including:
- `fca-priyansh` - Facebook Chat API library
- `express` - Web server
- `axios` - HTTP client
- `canvas` - Image generation
- And many more for various bot features

## Recent Changes
- Initial import to Replit environment (January 2026)
