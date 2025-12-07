const { widget } = figma
const { AutoLayout, Text, SVG, useSyncedState } = widget

const refreshIconSrc = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path d="M18.58 10.311c0.293-0.292 0.768-0.292 1.061 0.001l2.589 2.602c0.292 0.294 0.291 0.768-0.003 1.061s-0.768 0.291-1.061-0.002l-1.33-1.337c-0.323 4.039-3.701 7.217-7.823 7.217-2.516-0-4.755-1.185-6.19-3.024-0.255-0.326-0.197-0.798 0.129-1.053s0.798-0.197 1.053 0.13c1.163 1.49 2.975 2.446 5.009 2.446 3.278 0 5.976-2.484 6.315-5.673l-1.304 1.298c-0.294 0.292-0.769 0.291-1.062-0.003s-0.29-0.768 0.003-1.061l2.615-2.603zM12.013 4.151c2.696 0 5.074 1.36 6.486 3.427 0.233 0.342 0.146 0.808-0.196 1.042s-0.808 0.146-1.042-0.196c-1.145-1.675-3.069-2.772-5.248-2.772-3.364 0-6.115 2.616-6.334 5.925l1.301-1.31c0.292-0.294 0.767-0.295 1.061-0.003s0.296 0.766 0.004 1.059l-2.6 2.622c-0.292 0.294-0.768 0.295-1.062 0.004l-2.606-2.586c-0.294-0.292-0.296-0.768-0.004-1.062s0.767-0.296 1.061-0.004l1.34 1.329c0.195-4.161 3.63-7.475 7.84-7.476z"></path>
</svg>
`

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  const month = monthNames[date.getMonth()]
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year} ${month} ${day} - ${hours}:${minutes}`
}

function getCurrentDateTime(): string {
  return formatDateTime(new Date())
}

function DateRow({ label, date, onRefresh, showSeparator }) {
  return (
    <AutoLayout
      direction="vertical"
      verticalAlignItems="start"
      spacing={4}
      padding={{ top: 12, bottom: 12, left: 0, right: 0 }}
    >
      <Text
        fontSize={14}
        fill="#000000"
        fontWeight="bold"
      >
        {label}
      </Text>
      <AutoLayout
        direction="horizontal"
        verticalAlignItems="center"
        spacing={8}
      >
        <Text
          fontSize={14}
          fill="#000000"
        >
          {date}
        </Text>
        <SVG
          src={refreshIconSrc}
          onClick={onRefresh}
        />
      </AutoLayout>
      {showSeparator && (
        <AutoLayout
          direction="horizontal"
          width="fill-parent"
          height={1}
          fill="#E0E0E0"
        />
      )}
    </AutoLayout>
  )
}

function CheckboxItem({ label, checked, onToggle }) {
  return (
    <AutoLayout
      direction="horizontal"
      verticalAlignItems="center"
      spacing={12}
      padding={{ top: 8, bottom: 8, left: 0, right: 0 }}
      onClick={onToggle}
    >
      <AutoLayout
        width={20}
        height={20}
        verticalAlignItems="center"
        horizontalAlignItems="center"
        fill={checked ? "#6366F1" : "#FFFFFF"}
        cornerRadius={4}
        stroke={{
          type: 'solid',
          color: checked ? "#6366F1" : "#000000"
        }}
        strokeWidth={2}
      >
        {checked && (
          <Text
            fontSize={14}
            fill="#FFFFFF"
          >
            ✓
          </Text>
        )}
      </AutoLayout>
      <Text
        fontSize={14}
        fill="#000000"
      >
        {label}
      </Text>
    </AutoLayout>
  )
}

function CheckboxWidget() {
  const [finalizationDate, setFinalizationDate] = useSyncedState('finalizationDate', getCurrentDateTime())
  const [lastRevision, setLastRevision] = useSyncedState('lastRevision', getCurrentDateTime())
  const [item1, setItem1] = useSyncedState('item1', false)
  const [item2, setItem2] = useSyncedState('item2', false)
  const [item3, setItem3] = useSyncedState('item3', false)

  return (
    <AutoLayout
      direction="vertical"
      verticalAlignItems="start"
      padding={16}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={12}
      width={400}
    >
      <DateRow
        label="Finalization Date"
        date={finalizationDate}
        onRefresh={() => setFinalizationDate(getCurrentDateTime())}
        showSeparator={true}
      />
      <DateRow
        label="Last Revision"
        date={lastRevision}
        onRefresh={() => setLastRevision(getCurrentDateTime())}
        showSeparator={false}
      />
      <CheckboxItem
        label="Item 1"
        checked={item1}
        onToggle={() => setItem1(!item1)}
      />
      <CheckboxItem
        label="Item 2"
        checked={item2}
        onToggle={() => setItem2(!item2)}
      />
      <CheckboxItem
        label="Item 3"
        checked={item3}
        onToggle={() => setItem3(!item3)}
      />
    </AutoLayout>
  )
}

widget.register(CheckboxWidget)
