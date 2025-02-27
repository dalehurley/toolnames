# ToolNames.com | Free Online Tools

A collection of **free, client-side tools** for everyday tasks. All tools run entirely in your browser with **no server-side processing**, ensuring your data never leaves your device.

## 🔒 Privacy-First Tools

Our commitment to privacy means:

- **No data collection** or tracking
- **No server uploads** - all processing happens locally
- **No account required** - just open and use

## 🧰 Available Tools

### Calculators

- **Mortgage Calculator**: Calculate mortgage payments, interest, and amortization schedules
- **Compound Interest Calculator**: Calculate compound interest and visualize investment growth over time

### File Tools

- **Image Converter**: Convert images between different formats (JPEG, PNG, WebP)

### Converters

- **Color Converter**: Convert colors between HEX, RGB, HSL, HSV, and CMYK formats
- **Unit Converter**: Convert between different units of measurement (length, weight, temperature, etc.)

### Generators

- **Password Generator**: Generate secure, random passwords with customizable options
- **QR Code Generator**: Generate QR codes for URLs, text, and contact information

### Utilities

- **Text Case Converter**: Convert text between different cases (uppercase, lowercase, camel case, etc.)
- **Base64 Encoder/Decoder**: Encode text to Base64 or decode Base64 to text

## 🚀 Key Features

- **100% Client-Side**: All tools run in your browser, no data is sent to any server
- **Modern UI**: Built with React, ShadCN UI, and TailwindCSS
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Extensible Architecture**: Easy to add new tools

## 👨‍💻 Technical Details

The project leverages a modern tech stack:

- **React 19**: For building the user interface
- **TailwindCSS**: For styling and responsive design
- **ShadCN UI**: For beautiful, accessible components
- **TypeScript**: For type safety and better developer experience

## 🏗️ Adding New Tools

The project is designed to make it easy to add new tools. To add a new tool:

1. Create a new component in the appropriate category folder under `src/components/tools/`
2. Add the tool to the `availableTools` array in `src/contexts/ToolsContext.tsx`
3. That's it! The tool will automatically appear in the UI under the correct category

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📜 License

MIT
