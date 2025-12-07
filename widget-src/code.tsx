const { widget } = figma
const { AutoLayout, Text } = widget

function CheckboxWidget() {
  return (
    <AutoLayout
      direction="horizontal"
      verticalAlignItems="center"
      padding={16}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={12}
    >
      <Text
        fontSize={14}
        fill="#000000"
      >
        Item 1
      </Text>
    </AutoLayout>
  )
}

widget.register(CheckboxWidget)
