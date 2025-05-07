# HeadlessPilot

![HeadlessPilot Logo](https://via.placeholder.com/150x150.png?text=HeadlessPilot)

A powerful desktop application for browser automation with intuitive recording and replay capabilities.

## Features

- **Interactive Recording:** Capture browser interactions in real-time with visual feedback
- **Smart Element Detection:** Automatically detect forms, inputs, and interactive elements
- **Headless Execution:** Run automation sequences in the background
- **Screenshot Capture:** Take screenshots at specific points during automation
- **Sequence Management:** Save, edit, and organize your automation workflows
- **Scheduling:** Schedule automation runs with flexible timing options

## Screenshots

![Application Screenshot](https://via.placeholder.com/800x450.png?text=HeadlessPilot+Screenshot)

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Google Chrome or Chromium browser

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/phxmg/headless-ng.git
cd headless-ng

# Install dependencies
npm install

# Start the application
npm start
```

### Using Docker

```bash
# Build the Docker image
docker build -t headlesspilot .

# Run the application
docker run --rm -it \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  -e DISPLAY=$DISPLAY \
  --device /dev/dri \
  --shm-size 2g \
  headlesspilot
```

## Development

```bash
# Install development dependencies
npm install

# Run in development mode
npm run dev

# Build distribution package
npm run build
```

## Usage Examples

### Basic Automation

1. Open HeadlessPilot
2. Enter a URL in the navigation bar
3. Click the "Record" button
4. Perform actions in the browser (fill forms, click buttons, etc.)
5. Click "Stop Recording"
6. Save your sequence
7. Run headlessly by clicking "Play"

### Creating Login Automation

```javascript
// Example code snippet
const sequence = new AutomationSequence();
sequence.navigate('https://example.com/login');
sequence.type('#username', 'your-username');
sequence.type('#password', 'your-password');
sequence.click('#login-button');
sequence.waitForNavigation();
sequence.takeScreenshot('after-login');
```

## Configuration

HeadlessPilot can be configured using a `config.json` file in the application directory:

```json
{
  "browserPath": "/path/to/chrome",
  "defaultScreenshotDir": "./screenshots",
  "defaultSequenceDir": "./sequences",
  "puppeteerOptions": {
    "headless": true,
    "defaultViewport": { "width": 1920, "height": 1080 }
  }
}
```

## Project Structure

```
headless-ng/
├── src/
│   ├── main/              # Electron main process
│   ├── renderer/          # React application (renderer process)
│   ├── common/            # Shared utilities
│   ├── recorder/          # Interaction recording module
│   ├── player/            # Sequence playback module
│   └── analyzer/          # Element analysis module
├── build/                 # Build configuration
├── dist/                  # Distribution packages
└── docs/                  # Documentation
```

## Troubleshooting

### Common Issues

- **Error: Browser not found**: Ensure Chrome/Chromium is installed and properly configured in the settings
- **Recording doesn't capture clicks**: Try using selector mode by right-clicking elements
- **Headless mode fails**: Increase shared memory size if using Docker

## Roadmap

- [ ] Multi-browser support (Firefox, Edge)
- [ ] Cloud sync for sequences
- [ ] Advanced scheduling options
- [ ] Visual sequence editor
- [ ] AI-assisted selector generation

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Puppeteer](https://pptr.dev/) - Headless Chrome Node.js API
- [Electron](https://www.electronjs.org/) - Desktop application framework
- [React](https://reactjs.org/) - UI library

## macOS Builds and Code Signing

### Self-Signed Build (No Apple Developer Account)

You can now create a self-signed build without an Apple Developer account:

1. Run the self-signed build command:
   ```
   npm run build:mac:self-signed
   ```

2. The app will be created in:
   - DMG file: `dist/electron-build/HeadlessPilot-0.1.0-arm64.dmg`
   - App bundle: `dist/electron-build/mac-arm64/HeadlessPilot.app`

3. **Installing and Running the Self-Signed App**:
   - Open the DMG file and drag the HeadlessPilot app to your Applications folder
   - When you try to open the app, macOS will show a security warning
   - To bypass this:
     - Right-click (or Control+click) on the app in Finder
     - Select "Open" from the context menu
     - Click "Open" in the dialog that appears
     - The app will be allowed to run and remembered as an exception

   - **Alternative Method** (if the above doesn't work):
     - Open System Preferences/Settings > Security & Privacy > General
     - You should see a message about the blocked app
     - Click "Open Anyway" or "Allow"
     - Or, use Terminal to remove the quarantine attribute:
       ```
       xattr -cr /Applications/HeadlessPilot.app
       ```

### Official Signed Build (With Apple Developer Account)

For distribution to other users, using an official Apple Developer account is recommended:

1. Set up your environment variables in the `.env` file:
   ```
   APPLE_ID=your.apple.developer@email.com
   APPLE_ID_PASSWORD=your-app-specific-password
   APPLE_TEAM_ID=your-team-id
   ```

2. Run the signed build command:
   ```
   npm run build:mac:signed
   ```

3. The build process will:
   - Sign the application with your developer certificate
   - Notarize the application with Apple
   - Create a DMG file that can be distributed

## Building for Production

```
npm run build
```

For platform-specific builds:
```
npm run build:mac
npm run build:win 
npm run build:linux
``` 