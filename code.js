// Main widget code for Design Sign-Off
const { widget } = figma;
const { AutoLayout, Text, Button, Input, Dropdown, useSyncedState, usePropertyMenu } = widget;

// Persian date formatter
function formatPersianDate(date) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  const gregorianDate = new Date(date);
  const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(gregorianDate);
  
  // Convert English numbers to Persian
  return persianDate.replace(/\d/g, d => persianNumbers[d]);
}

// Get current timestamp in Persian format
function getCurrentPersianTimestamp() {
  const now = new Date();
  return formatPersianDate(now);
}

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: 'in-review', label: 'In-Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
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
  // Synced state for dates
  const [finalizationDate, setFinalizationDate] = useSyncedState('finalizationDate', '');
  const [lastRevisionDate, setLastRevisionDate] = useSyncedState('lastRevisionDate', '');
  
  // Synced state for role names
  const [pmName, setPmName] = useSyncedState('pmName', '');
  const [designLeadName, setDesignLeadName] = useSyncedState('designLeadName', '');
  const [dsmName, setDsmName] = useSyncedState('dsmName', '');
  const [techLeadName, setTechLeadName] = useSyncedState('techLeadName', '');
  
  // Synced state for role statuses
  const [pmStatus, setPmStatus] = useSyncedState('pmStatus', 'in-review');
  const [designLeadStatus, setDesignLeadStatus] = useSyncedState('designLeadStatus', 'in-review');
  const [dsmStatus, setDsmStatus] = useSyncedState('dsmStatus', 'in-review');
  const [techLeadStatus, setTechLeadStatus] = useSyncedState('techLeadStatus', 'in-review');
  
  // Handle sign button click
  const handleSignClick = () => {
    const currentTimestamp = getCurrentPersianTimestamp();
    setFinalizationDate(currentTimestamp);
    setLastRevisionDate(currentTimestamp);
  };
  
  // Get status display properties
  const getStatusDisplay = (status) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    const colors = {
      'in-review': { bg: '#FFF3E0', dot: '#FF9800', text: '#E65100' },
      'approved': { bg: '#E8F5E8', dot: '#4CAF50', text: '#2E7D32' },
      'rejected': { bg: '#FFEBEE', dot: '#F44336', text: '#C62828' }
    };
    
    return {
      ...statusConfig,
      ...colors[status]
    };
  };
  
  // Render status pill
  const renderStatusPill = (status, onStatusChange) => {
    const statusDisplay = getStatusDisplay(status);
    
    return (
      <AutoLayout
        direction="horizontal"
        spacing={6}
        padding={{ horizontal: 12, vertical: 6 }}
        cornerRadius={16}
        fill={statusDisplay.bg}
        stroke={statusDisplay.dot}
        strokeWidth={1}
        verticalAlignItems="center"
      >
        <AutoLayout
          width={6}
          height={6}
          cornerRadius={3}
          fill={statusDisplay.dot}
        />
        <Dropdown
          value={status}
          options={STATUS_OPTIONS}
          onSelection={(value) => onStatusChange(value)}
        >
          <Text
            fontSize={12}
            fontWeight={600}
            fill={statusDisplay.text}
          >
            {statusDisplay.label}
          </Text>
        </Dropdown>
      </AutoLayout>
    );
  };
  
  // Render role row
  const renderRoleRow = (role, name, setName, status, setStatus) => {
    return (
      <AutoLayout
        direction="horizontal"
        spacing={12}
        padding={{ vertical: 8 }}
        width="fill"
        verticalAlignItems="center"
        stroke="#E0E0E0"
        strokeWidth={1}
      >
        <AutoLayout
          direction="vertical"
          spacing={4}
          width="fill"
        >
          <Text
            fontSize={14}
            fontWeight={600}
            fill="#424242"
          >
            {role.label}
          </Text>
          <Input
            value={name}
            placeholder="Enter name..."
            onTextEdit={(e) => setName(e.characters)}
            fontSize={12}
            fill="#757575"
            width="fill"
          />
        </AutoLayout>
        {renderStatusPill(status, setStatus)}
      </AutoLayout>
    );
  };
  
  return (
    <AutoLayout
      direction="vertical"
      spacing={16}
      padding={20}
      width={400}
      fill="#FFFFFF"
      stroke="#E0E0E0"
      strokeWidth={1}
      cornerRadius={8}
    >
      {/* Title */}
      <Text
        fontSize={20}
        fontWeight={700}
        fill="#424242"
        width="fill"
        textAlign="center"
      >
        Design Sign-Off
      </Text>
      
      {/* Dates Card */}
      <AutoLayout
        direction="vertical"
        spacing={0}
        fill="#F5F5F5"
        cornerRadius={6}
        stroke="#E0E0E0"
        strokeWidth={1}
      >
        <AutoLayout
          direction="vertical"
          spacing={4}
          padding={16}
          stroke="#E0E0E0"
          strokeWidth={1}
        >
          <Text
            fontSize={14}
            fontWeight={600}
            fill="#424242"
          >
            Finalization Date
          </Text>
          <Text
            fontSize={12}
            fill="#757575"
          >
            {finalizationDate || '{Date}'}
          </Text>
        </AutoLayout>
        
        <AutoLayout
          direction="vertical"
          spacing={4}
          padding={16}
          width="fill"
        >
          <Text
            fontSize={14}
            fontWeight={600}
            fill="#424242"
          >
            Last Revision
          </Text>
          <Text
            fontSize={12}
            fill="#757575"
          >
            {lastRevisionDate || '{Date}'}
          </Text>
        </AutoLayout>
      </AutoLayout>
      
      {/* Sign Button */}
      <Button
        onClick={handleSignClick}
        fill="#FF9800"
        cornerRadius={6}
        padding={{ horizontal: 16, vertical: 8 }}
      >
        <Text
          fontSize={14}
          fontWeight={600}
          fill="#FFFFFF"
        >
          Sign
        </Text>
      </Button>
      
      {/* Roles Card */}
      <AutoLayout
        direction="vertical"
        spacing={0}
        fill="#F5F5F5"
        cornerRadius={6}
        stroke="#E0E0E0"
        strokeWidth={1}
      >
        {renderRoleRow(ROLES[0], pmName, setPmName, pmStatus, setPmStatus)}
        {renderRoleRow(ROLES[1], designLeadName, setDesignLeadName, designLeadStatus, setDesignLeadStatus)}
        {renderRoleRow(ROLES[2], dsmName, setDsmName, dsmStatus, setDsmStatus)}
        {renderRoleRow(ROLES[3], techLeadName, setTechLeadName, techLeadStatus, setTechLeadStatus)}
      </AutoLayout>
    </AutoLayout>
  );
}

// Register the widget
widget.register(DesignSignoffWidget);
