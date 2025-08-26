// Direct JavaScript Figma Widget - No build process needed!
const { widget } = figma;
const { AutoLayout, Text, useSyncedState } = widget;

// Persian date formatter
function formatPersianDate(date) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
  
  // Convert English numbers to Persian
  return persianDate.replace(/\d/g, d => persianNumbers[d]);
}

// Get current timestamp in Persian format
function getCurrentPersianTimestamp() {
  const now = new Date();
  return formatPersianDate(now);
}

// Status options for approval
const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'in-review', label: '👀 In Review' },
  { value: 'approved', label: '✅ Approved' },
  { value: 'rejected', label: '❌ Rejected' }
];

// Role definitions
const ROLES = [
  { key: 'pm', label: 'PM' },
  { key: 'designLead', label: 'Design Lead' },
  { key: 'dsm', label: 'DSM' },
  { key: 'techLead', label: 'Tech Lead' }
];

// Widget component
function DesignSignoffWidget() {
  // Synced state for timestamp
  const [timestamp, setTimestamp] = useSyncedState('timestamp', '');
  
  // Synced state for approval statuses
  const [pmStatus, setPmStatus] = useSyncedState('pmStatus', 'pending');
  const [designLeadStatus, setDesignLeadStatus] = useSyncedState('designLeadStatus', 'pending');
  const [dsmStatus, setDsmStatus] = useSyncedState('dsmStatus', 'pending');
  const [techLeadStatus, setTechLeadStatus] = useSyncedState('techLeadStatus', 'pending');
  
  // Handle timestamp button click
  const handleTimestampClick = () => {
    const currentTimestamp = getCurrentPersianTimestamp();
    setTimestamp(currentTimestamp);
  };
  
  // Handle status click - cycle through statuses
  const handleStatusClick = (currentStatus, setStatus) => {
    const currentIndex = STATUS_OPTIONS.findIndex(s => s.value === currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
    setStatus(STATUS_OPTIONS[nextIndex].value);
  };
  
  // Get status display properties
  const getStatusDisplay = (status) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return {
      value: statusConfig?.value || 'pending',
      label: statusConfig?.label || '⏳ Pending'
    };
  };
  
  // Create the main widget layout
  return AutoLayout({
    direction: 'vertical',
    spacing: 16,
    padding: 20,
    width: 320,
    fill: '#FFFFFF',
    stroke: '#E0E0E0',
    strokeWidth: 1,
    cornerRadius: 12,
    children: [
      // Header
      Text({
        characters: '🎯 Design Sign-Off',
        fontSize: 20,
        fontWeight: 700,
        fill: '#424242'
      }),
      
      // Timestamp section
      AutoLayout({
        direction: 'vertical',
        spacing: 8,
        children: [
          Text({
            characters: '📅 Timestamp',
            fontSize: 14,
            fontWeight: 600,
            fill: '#666666'
          }),
          AutoLayout({
            direction: 'horizontal',
            spacing: 8,
            children: [
              Text({
                characters: timestamp || 'No timestamp set',
                fontSize: 12,
                fill: '#666666'
              }),
              Text({
                characters: '🕐 Set Now',
                fontSize: 12,
                fontWeight: 600,
                fill: '#FF9800',
                onClick: handleTimestampClick
              })
            ]
          })
        ]
      }),
      
      // Approval statuses section
      AutoLayout({
        direction: 'vertical',
        spacing: 12,
        children: [
          Text({
            characters: '👥 Approval Status',
            fontSize: 14,
            fontWeight: 600,
            fill: '#666666'
          }),
          AutoLayout({
            direction: 'vertical',
            spacing: 8,
            children: ROLES.map(role => {
              const status = role.key === 'pm' ? pmStatus : 
                           role.key === 'designLead' ? designLeadStatus :
                           role.key === 'dsm' ? dsmStatus : techLeadStatus;
              const statusDisplay = getStatusDisplay(status);
              
              return AutoLayout({
                direction: 'horizontal',
                spacing: 8,
                children: [
                  Text({
                    characters: role.label,
                    fontSize: 12,
                    fontWeight: 600,
                    fill: '#424242'
                  }),
                  Text({
                    characters: statusDisplay.label,
                    fontSize: 11,
                    fill: '#666666',
                    onClick: () => {
                      if (role.key === 'pm') handleStatusClick(pmStatus, setPmStatus);
                      else if (role.key === 'designLead') handleStatusClick(designLeadStatus, setDesignLeadStatus);
                      else if (role.key === 'dsm') handleStatusClick(dsmStatus, setDsmStatus);
                      else handleStatusClick(techLeadStatus, setTechLeadStatus);
                    }
                  })
                ]
              });
            })
          })
        ]
      }),
      
      // Instructions
      Text({
        characters: '💡 Click status text to cycle through options',
        fontSize: 10,
        fill: '#999999'
      })
    ]
  });
}

widget.register(DesignSignoffWidget);
