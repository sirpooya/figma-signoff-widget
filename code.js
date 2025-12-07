// Simple Hello Widget
// Based on https://developers.figma.com/docs/widgets/setup-guide/

function HelloWidget() {
  return figma.widget.h('Frame', {
    width: 200,
    height: 100,
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
    children: [
      figma.widget.h('Text', {
        characters: 'Hello',
        fontSize: 24,
        fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
      })
    ]
  });
}

figma.widget.register(HelloWidget);
