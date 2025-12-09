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

### 4. **Property Menu Controls**
- **Status Dropdown**: Change the design status (Review, Ready for Dev, Live, Archived)

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

## External Checklist Loading

The widget supports loading checklist content from external URLs, allowing you to maintain and update checklists without modifying the widget code itself.

### How It Works

When a widget is first inserted into a Figma file, it automatically attempts to fetch the checklist from a predefined GitHub URL:

- **Default URL**: `https://raw.githubusercontent.com/sirpooya/figma-signoff-widget/refs/heads/main/src/remote-checklist.json`

The widget performs the following steps:

1. **Fetch Attempt**: On widget initialization, it makes an HTTP GET request to the configured checklist URL
2. **Validation**: The fetched JSON is validated to ensure it matches the expected structure
3. **Storage**: If successful, the checklist data is stored in the widget's synced state
4. **Fallback**: If the fetch fails (network error, invalid JSON, etc.), the widget automatically falls back to the bundled default checklist (`src/fallback-checklist.json`)

### Benefits

- **Dynamic Updates**: Update your checklist content by modifying the JSON file in your repository without rebuilding the widget
- **Version Control**: Track checklist changes through Git history
- **Team Collaboration**: Share checklist updates across your team instantly
- **No Code Changes**: Modify checklist content without touching widget source code

### Network Access

The widget requires network access permissions to fetch external checklists. The domain `https://raw.githubusercontent.com` is allowlisted in `manifest.json` under `networkAccess.allowedDomains`.

## Custom Checklist Setup

You can create and host your own checklist JSON files to customize the checklist content for your team or project.

### Step 1: Create Your Checklist JSON

Create a JSON file following the checklist structure (see [Checklist JSON Structure](#checklist-json-structure) below). You can use the existing `remote-checklist.json` or `fallback-checklist.json` as a template.

### Step 2: Host Your Checklist

You have several options for hosting your checklist:

#### Option A: GitHub (Recommended)

1. Create a repository or use an existing one
2. Upload your checklist JSON file to the repository
3. Get the raw file URL:
   - Navigate to your file in GitHub
   - Click "Raw" button
   - Copy the URL from the address bar
   - Example: `https://raw.githubusercontent.com/username/repo/branch/path/to/checklist.json`

#### Option B: Other Web Servers

You can host your checklist on any web server that:
- Serves files over HTTPS
- Allows CORS requests from Figma
- Returns valid JSON with proper content-type headers

### Step 3: Update the Widget Code

To use your custom checklist URL, modify the `DEFAULT_CHECKLIST_URL` constant in `src/code.tsx`:

```typescript
const DEFAULT_CHECKLIST_URL = 'https://your-domain.com/path/to/your-checklist.json'
```

Then rebuild the widget:

```bash
npm run build
```

### Step 4: Update Manifest (If Needed)

If you're using a domain other than `raw.githubusercontent.com`, you'll need to add it to the `allowedDomains` array in `manifest.json`:

```json
"networkAccess": {
  "allowedDomains": [
    "https://s3-alpha.figma.com",
    "https://s3.figma.com",
    "https://raw.githubusercontent.com",
    "https://your-domain.com"
  ]
}
```

### Best Practices

- **Use HTTPS**: Always use HTTPS URLs for security
- **Version Control**: Keep your checklist JSON in version control for change tracking
- **Test First**: Test your JSON structure before deploying
- **Backup**: Keep a local copy of your checklist as a backup
- **CORS**: Ensure your server allows CORS if hosting on a custom domain

## Checklist Data Persistence

The widget uses Figma's `useSyncedState` hook to persist checklist data for each widget instance. This means:

- **Per-Widget Storage**: Each widget instance stores its own checklist data and checked/unchecked states
- **Persistence**: Checklist data and item states persist across Figma sessions
- **No Re-fetching**: Once loaded, the checklist data is cached in the widget's state, so it won't re-fetch on every load
- **State Synchronization**: All checklist interactions (checking/unchecking items) are automatically saved

Note: The checklist data is stored per widget instance, not globally. Each new widget instance will fetch the checklist on first load.

## Fallback Mechanism

The widget includes a robust fallback system to ensure it always has checklist content available:

1. **Primary Source**: Attempts to fetch from the configured external URL
2. **Validation**: Validates the fetched JSON structure matches the expected format
3. **Automatic Fallback**: If fetching fails or validation fails, automatically uses the bundled `fallback-checklist.json`
4. **Silent Failure**: Errors are logged to the console but don't interrupt the widget's functionality

The fallback ensures the widget remains functional even if:
- The external URL is unreachable
- Network connectivity issues occur
- The external JSON has invalid structure
- CORS restrictions block the request

## Checklist JSON Structure

The widget expects checklist data in a specific JSON format. Understanding this structure is essential for creating custom checklists.

### Required Structure

```json
{
  "sections": [
    {
      "title": "Section Title",
      "items": [
        "Checklist item 1",
        "Checklist item 2",
        "Checklist item 3"
      ]
    }
  ]
}
```

### Field Descriptions

- **`sections`** (array, required): An array of checklist sections
  - Each section represents a category or group of related checklist items
  - Sections are displayed in the order they appear in the array
  
- **`title`** (string, required): The section heading
  - Displayed as a bold title above the section's items
  - Supports any Unicode characters (including Persian, Arabic, etc.)
  - Example: `"Components"` or `"Design Review"`
  
- **`items`** (array of strings, required): The checklist items within the section
  - Each string represents one checklist item
  - Items are displayed as checkboxes in the order they appear
  - Supports multi-line text and special characters
  - Example: `"Latest library update has been applied"`

### Example

Here's a complete example matching the structure:

```json
{
  "sections": [
    {
      "title": "Components",
      "items": [
        "Latest library update has been applied",
        "All colors/spacing are connected to tokens",
        "No detached components or overrides exist"
      ]
    },
    {
      "title": "Pages",
      "items": [
        "Old design frames have been removed",
        "Mobile design uses 375x812 dimensions",
        "Responsive autolayout and constraints are applied"
      ]
    },
    {
      "title": "Edge Cases",
      "items": [
        "Back button navigation is handled",
        "Error states are defined",
        "Empty and loading states are considered"
      ]
    }
  ]
}
```

### Validation Rules

The widget validates the following when loading a checklist:

- ✅ `sections` must be an array
- ✅ Each section must have a `title` (string)
- ✅ Each section must have an `items` array
- ✅ Each item in `items` must be a string
- ✅ At least one section must exist

If validation fails, the widget will fall back to the default checklist.

### Tips for Creating Checklists

- **Keep it Organized**: Use sections to group related items logically
- **Be Specific**: Write clear, actionable checklist items
- **Consider Length**: Very long items may wrap in the UI
- **Test Locally**: Validate your JSON using a JSON validator before deploying
- **Use UTF-8**: Ensure your JSON file is saved with UTF-8 encoding for proper character support

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
