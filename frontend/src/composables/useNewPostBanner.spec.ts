import { describe, it, expect, beforeEach } from 'vitest'
import { useNewPostBanner } from './useNewPostBanner'
import type { Post } from '../types'

const make = (id: string, title: string): Post => ({
  id,
  title,
  body: '',
  author: { id: '1', email: 'a@b.c' },
})

describe('useNewPostBanner', () => {
  beforeEach(() => useNewPostBanner().dismiss())

  it('shows the most recent post, replacing the previous one', () => {
    const { latestPost, show } = useNewPostBanner()
    show(make('1', 'first'))
    expect(latestPost.value?.title).toBe('first')
    show(make('2', 'second'))
    expect(latestPost.value?.title).toBe('second') // latest-wins; only one slot
  })

  it('dismiss clears the banner', () => {
    const { latestPost, show, dismiss } = useNewPostBanner()
    show(make('1', 'first'))
    dismiss()
    expect(latestPost.value).toBeNull()
  })
})
