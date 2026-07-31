import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/test/msw/server'
import { usePortfolioStore } from './portfolio-store'
import type { PortfolioItem } from '@/types/portfolio'

const API_URL = 'http://localhost:4000/api'

const initialStoreState = usePortfolioStore.getState()

function makeItem(overrides: Partial<PortfolioItem> = {}): PortfolioItem {
  return {
    id: 1,
    title: 'Project',
    description: 'A project',
    technology: 'React',
    projectUrl: 'https://example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('portfolio-store CRUD', () => {
  beforeEach(() => {
    usePortfolioStore.setState(initialStoreState, true)
  })

  afterEach(() => {
    usePortfolioStore.setState(initialStoreState, true)
  })

  it('create: adds the new item to the front of the list on success', async () => {
    const created = makeItem({ id: 2, title: 'New Project' })
    server.use(
      http.post(`${API_URL}/portfolio`, () =>
        HttpResponse.json({ success: true, message: 'ok', data: created }, { status: 201 }),
      ),
    )

    const result = await usePortfolioStore.getState().createItem({
      title: 'New Project',
      description: 'A project',
      technology: 'React',
      projectUrl: 'https://example.com',
    })

    expect(result).toEqual(created)
    const state = usePortfolioStore.getState()
    expect(state.ids[0]).toBe(2)
    expect(state.itemsById[2]).toEqual(created)
    expect(state.createError).toBeNull()
  })

  it('update: replaces the item in place without duplicating it', async () => {
    const original = makeItem()
    usePortfolioStore.setState({ ids: [1], itemsById: { 1: original } })
    const updated = { ...original, title: 'Updated Title' }
    server.use(
      http.put(`${API_URL}/portfolio/1`, () => HttpResponse.json({ success: true, message: 'ok', data: updated })),
    )

    const result = await usePortfolioStore.getState().updateItem(1, { title: 'Updated Title' })

    expect(result?.title).toBe('Updated Title')
    const state = usePortfolioStore.getState()
    expect(state.ids).toEqual([1])
    expect(state.itemsById[1].title).toBe('Updated Title')
  })

  it('delete: removes the item from state on success', async () => {
    usePortfolioStore.setState({ ids: [1], itemsById: { 1: makeItem() } })
    server.use(
      http.delete(`${API_URL}/portfolio/1`, () =>
        HttpResponse.json({ success: true, message: 'ok', data: makeItem() }),
      ),
    )

    const success = await usePortfolioStore.getState().deleteItem(1)

    expect(success).toBe(true)
    const state = usePortfolioStore.getState()
    expect(state.ids).toEqual([])
    expect(state.itemsById[1]).toBeUndefined()
  })

  it('create: leaves the list untouched and records an error on failure', async () => {
    usePortfolioStore.setState({ ids: [1], itemsById: { 1: makeItem() } })
    server.use(
      http.post(`${API_URL}/portfolio`, () => HttpResponse.json({ message: 'Invalid input' }, { status: 400 })),
    )

    const result = await usePortfolioStore.getState().createItem({
      title: '',
      description: '',
      technology: '',
      projectUrl: '',
    } as never)

    expect(result).toBeUndefined()
    const state = usePortfolioStore.getState()
    expect(state.ids).toEqual([1])
    expect(state.createError).toBe('Invalid input')
    expect(state.isCreating).toBe(false)
  })

  it('delete: keeps the item in state and records an error on failure', async () => {
    const item = makeItem()
    usePortfolioStore.setState({ ids: [1], itemsById: { 1: item } })
    server.use(
      http.delete(`${API_URL}/portfolio/1`, () => HttpResponse.json({ message: 'Cannot delete' }, { status: 500 })),
    )

    const success = await usePortfolioStore.getState().deleteItem(1)

    expect(success).toBe(false)
    const state = usePortfolioStore.getState()
    expect(state.ids).toEqual([1])
    expect(state.itemsById[1]).toEqual(item)
    expect(state.deleteError).toBe('Cannot delete')
    expect(state.deletingIds).toEqual([])
  })
})
