# Design Sign-Off Widget

A Figma widget for managing design sign-off processes with approval tracking, date management, and checklist functionality.

## Features

### 1. **Title Section**
- Displays "Design Sign-Off" title
- Status badge with color-coded labels:
  - **Review** (Orange) - Design is under review
  - **Ready for Dev** (Green) - Design is ready for development
  - **Live** (Blue) - Design is live in production
  - **Archived** (Red) - Design is archived
- Status can be changed via property menu dropdown

### 2. **Date Section**
- **Finalization Date**: Tracks when the design was finalized
- **Last Revision**: Tracks the most recent revision date
- Both dates display in format: `YYYY Month DD - HH:MM` (e.g., "2025 December 06 - 11:20")
- Refresh button (🔄) next to each date to update to current datetime
- Dates are automatically initialized to current datetime on first load

### 3. **Approval Section**
- Three approval roles:
  - **PM** (Product Manager)
  - **Design Lead**
  - **DSM** (Design System Manager)
- Each role has a toggle button with two states:
  - **🟠 In-Review** (Light orange background) - Pending approval
  - **✅ Approved** (Light green background) - Approved
- When toggled to "Approved":
  - Automatically captures the current user's name
  - Displays user's avatar (24x24, rounded) next to the name
  - Shows placeholder avatar if user has no profile photo
- Assignee information persists across widget instances

### 4. **Checklist Section**
- Three Persian-language checklist items:
  - از کامپوننت صحیح برای usecaseها استفاده شده باشد
  - حالت خالی و لودینگ — بدون داده، استفاده برای اولین بار
  - حالت افلاین — ویژگی‌های محدود، تلاش مجدد
- Each item can be checked/unchecked by clicking anywhere on the row
- Uses Vazirmatn font for Persian text support
- Right-to-left (RTL) text alignment
- Can be toggled on/off via property menu

### 5. **Property Menu Controls**
- **Status Dropdown**: Change the design status (Review, Ready for Dev, Live, Archived)
- **Toggle Checklist**: Show/hide the checklist section

## Installation

### Prerequisites
- Node.js (comes with NPM) - [Download here](https://nodejs.org/en/download/)
- Figma Desktop App

### Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the widget:
   ```bash
   npm run build
   ```

## Development

### Build Commands

- **Build once**: `npm run build`
- **Watch mode** (auto-rebuild on changes): `npm run dev`
- **Type check**: `npm test`

### Project Structure

```
figma-signoff-widget/
├── src/
│   ├── code.tsx          # Main widget source code
│   └── tsconfig.json     # TypeScript configuration
├── dist/
│   └── code.js           # Compiled JavaScript (auto-generated)
├── manifest.json         # Widget manifest/configuration
├── package.json          # NPM dependencies and scripts
└── README.md            # This file
```

### Loading the Widget in Figma

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this project
4. The widget will appear in your widgets panel
5. Insert the widget into your design file

### Development Workflow

1. Make changes to `src/code.tsx`
2. Run `npm run build` (or use watch mode with `npm run dev`)
3. In Figma, the widget will automatically reload when you make changes
4. If the widget doesn't reload, remove and re-add it to the canvas

## Usage

### Setting Status
1. Select the widget on the canvas
2. In the property menu (top of widget), use the dropdown to select status
3. The status badge will update with the corresponding color

### Managing Dates
- Click the refresh button (🔄) next to any date to update it to the current datetime
- Dates are automatically initialized when the widget is first created

### Approving Items
1. Click the toggle button for any role (PM, Design Lead, or DSM)
2. When switched to "Approved", your username and avatar will be automatically captured
3. The assignee information will be displayed below the role name
4. Click again to toggle back to "In-Review"

### Using the Checklist
1. Click anywhere on a checklist item row to toggle it
2. The checkbox will show a checkmark when selected
3. Use the "Toggle Checklist" button in the property menu to show/hide the entire checklist section

## Permissions

This widget requires the following permission:
- **currentuser**: To capture and display the username and avatar of users who approve items

The permission is configured in `manifest.json` and will be requested when the widget is first loaded.

## Technical Details

### Widget API Version
- Widget API: 1.0.0
- Figma API: 1.0.0

### State Management
- Uses `useSyncedState` hook for persistent state across widget instances
- State is synced between all instances of the widget in the same file

### Font Support
- **Vazirmatn**: Used for Persian/Arabic text in checklist items
- Falls back to Inter if Vazirmatn is not available

### Browser Compatibility
- Works in Figma Desktop App
- Compatible with Figma and FigJam

## Troubleshooting

### Widget not loading
- Ensure `dist/code.js` exists (run `npm run build`)
- Check that `manifest.json` points to `dist/code.js`
- Try removing and re-adding the widget

### Avatar not showing
- Ensure you're logged into Figma
- Check that your Figma account has a profile photo set
- If no photo is available, a placeholder rectangle will be shown

### Font not displaying correctly
- Vazirmatn is a Google Font - ensure you have internet connection
- If font doesn't load, text will fall back to Inter

### Dates not updating
- Click the refresh button (🔄) to manually update dates
- Dates are initialized on widget creation

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
