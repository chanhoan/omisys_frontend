import { describe, expect, it } from 'vitest'

import { darkTheme, lightTheme, theme } from './index'

describe('design themes', () => {
  it('provides matching semantic color roles for light and dark mode', () => {
    expect(Object.keys(darkTheme.colors)).toEqual(Object.keys(lightTheme.colors))
    expect(lightTheme.colors.background).toBe('#f5f5f7')
    expect(darkTheme.colors.background).toBe('#000000')
  })

  it('keeps the legacy theme alias on the light palette', () => {
    expect(theme.colors.ink).toBe(lightTheme.colors.text)
    expect(theme.colors.paper).toBe(lightTheme.colors.background)
  })

  it('exposes shared shape and motion values', () => {
    expect(theme.radii.card).toBeGreaterThan(theme.radii.control)
    expect(theme.motion.standard).toContain('cubic-bezier')
  })
})
