const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'
const ICON_SPRITE_PATH = '/icons.svg'

export const createIconElement = (name, sourceElement = null) => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  const use = document.createElementNS(SVG_NS, 'use')
  const sourceClassName = sourceElement?.getAttribute('class') || ''

  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.setAttribute('class', `${sourceClassName} icon icon-${name}`.trim())

  const inlineStyle = sourceElement?.getAttribute('style')

  if (inlineStyle) {
    svg.setAttribute('style', inlineStyle)
  }

  const spriteRef = `${ICON_SPRITE_PATH}#${name}`
  use.setAttribute('href', spriteRef)
  use.setAttributeNS(XLINK_NS, 'xlink:href', spriteRef)
  svg.append(use)

  return svg
}

export const replaceIcons = (root = document) => {
  root.querySelectorAll('[data-feather]').forEach((node) => {
    const iconName = node.getAttribute('data-feather')

    if (!iconName) {
      return
    }

    node.replaceWith(createIconElement(iconName, node))
  })
}
