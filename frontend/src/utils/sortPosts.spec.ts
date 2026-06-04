import { describe, it, expect } from 'vitest'
import { sortPostsByIdDesc } from './sortPosts'
import type { Post } from '../types'

const make = (id: string): Post => ({
  id,
  title: `t${id}`,
  body: '',
  author: { id: '1', email: 'a@b.c' },
})

describe('sortPostsByIdDesc', () => {
  it('orders posts newest (highest id) first', () => {
    const result = sortPostsByIdDesc([make('1'), make('3'), make('2')])
    expect(result.map((p) => p.id)).toEqual(['3', '2', '1'])
  })

  it('does not mutate the input array', () => {
    const input = [make('1'), make('2')]
    const snapshot = input.map((p) => p.id)
    sortPostsByIdDesc(input)
    expect(input.map((p) => p.id)).toEqual(snapshot)
  })
})
