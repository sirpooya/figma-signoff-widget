const { widget } = figma
const { AutoLayout, Text, useSyncedState } = widget

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
