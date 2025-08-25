# Design Sign-Off Widget for Figma

A Figma widget that helps designers track the sign-off process for their designs. This widget provides an organized way to manage design approval workflows with date tracking, role assignments, and status management.

## Features

- **Date Tracking**: Automatically fills Finalization Date and Last Revision with current Persian timestamp
- **Role Management**: Set names for PM, Design Lead, DSM, and Tech Lead
- **Status Tracking**: Monitor approval status with dropdown options (In-Review, Approved, Rejected)
- **Persian Date Format**: Displays dates in Persian calendar format
- **Persistent Data**: All data is synced and saved within the Figma file

## Installation

### Method 1: Development Mode (Recommended for testing)

1. Clone or download this repository
2. Open Figma and go to **Plugins** > **Development** > **New Plugin**
3. Click **Import plugin from manifest**
4. Select the `manifest.json` file from this project
5. The widget will now appear in your **Widgets** panel

### Method 2: Build and Install

1. Clone this repository
2. Install dependencies (if any build process is added later)
3. Build the project
4. Follow the same import steps as Method 1

## Usage

### Adding the Widget to Your Design

1. In Figma, go to the **Widgets** panel (usually on the right side)
2. Find "Design Sign-Off" in the list
3. Drag and drop it onto your canvas
4. The widget will appear with the default layout

### Using the Widget

#### Setting Dates
- Click the **Sign** button to automatically fill both Finalization Date and Last Revision with the current Persian timestamp
- Dates are displayed in Persian calendar format (e.g., "۱۵ فروردین ۱۴۰۳")

#### Managing Roles
- Click on the input field below each role title (PM, Design Lead, DSM, Tech Lead)
- Type the assignee's name
- The name will be automatically saved

#### Updating Status
- Each role has a status pill on the right side
- Click on the status to open a dropdown
- Choose from:
  - **In-Review** (Orange) - Default status for new assignments
  - **Approved** (Green) - When the role has approved the design
  - **Rejected** (Red) - When the role has rejected the design

### Widget Layout

The widget is organized into three main sections:

1. **Title**: "Design Sign-Off" header
2. **Dates Card**: Contains Finalization Date and Last Revision fields
3. **Sign Button**: Orange button to set current dates
4. **Roles Card**: Lists all four roles with name inputs and status pills

## File Structure

```
figma-signoff-widget/
├── manifest.json      # Widget configuration
├── code.js           # Main widget logic
├── ui.html           # Widget interface
└── README.md         # This file
```

## Technical Details

- Built using Figma's Widget API
- Uses React-like syntax with Figma's widget components
- Implements Persian date formatting using Intl.DateTimeFormat
- All data is synced using `useSyncedState` for persistence
- Responsive design that adapts to different canvas sizes

## Persian Date Format

The widget automatically converts Gregorian dates to Persian calendar format using:
- Persian month names (فروردین, اردیبهشت, etc.)
- Persian numerals (۰, ۱, ۲, etc.)
- Proper Persian calendar calculations

## Customization

You can modify the widget by editing:
- `code.js`: Change colors, layout, or add new features
- `ui.html`: Modify the widget's interface
- `manifest.json`: Update widget metadata

## Troubleshooting

### Widget Not Appearing
- Make sure you're in development mode
- Check that the manifest.json file is properly formatted
- Restart Figma if needed

### Dates Not Updating
- Ensure you're clicking the "Sign" button
- Check that your system supports Persian calendar formatting
- Verify the widget has proper permissions

### Status Not Saving
- Make sure you're using the dropdown to change status
- Check that the Figma file is saved
- Verify you have edit permissions on the file

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this widget.

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check the troubleshooting section above or create an issue in the repository.
