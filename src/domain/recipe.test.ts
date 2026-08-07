import { describe, expect, it } from 'vitest'
import { requiredShots } from './recipe'

describe('requiredShots', () => {
  it('カフェラテは M で1ショット、L で2ショット', () => {
    expect(requiredShots('latte', 'M')).toBe(1)
    expect(requiredShots('latte', 'L')).toBe(2)
  })

  it('バニララテはカフェラテと同じショット数', () => {
    expect(requiredShots('vanilla-latte', 'M')).toBe(1)
    expect(requiredShots('vanilla-latte', 'L')).toBe(2)
  })

  it('アメリカーノはラテより1ショット多い', () => {
    expect(requiredShots('americano', 'M')).toBe(2)
    expect(requiredShots('americano', 'L')).toBe(3)
  })
})
