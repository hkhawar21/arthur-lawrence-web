import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/test/msw/server'
import { usePortfolioStore } from '@/store/portfolio-store'
import Home from './Home'

const API_URL = 'http://localhost:4000/api'

const initialStoreState = usePortfolioStore.getState()

function mockPortfolioResponse(items, overrides = {}) {
  server.use(
    http.get(`${API_URL}/portfolio`, () =>
      HttpResponse.json({
        success: true,
        message: 'ok',
        data: {
          items,
          pagination: { page: 1, limit: 10, total: items.length, totalPages: 1, ...overrides },
        },
      }),
    ),
  )
}

function makeItem(id) {
  return {
    id,
    title: `Project ${id}`,
    description: 'A project',
    technology: 'React',
    projectUrl: 'https://example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }
}

describe('Home portfolio listing', () => {
  beforeEach(() => {
    usePortfolioStore.setState(initialStoreState, true)
  })

  afterEach(() => {
    usePortfolioStore.setState(initialStoreState, true)
  })

  it('shows an empty state when there are no items', async () => {
    mockPortfolioResponse([])
    render(<Home />, { wrapper: MemoryRouter })

    expect(await screen.findByText('No portfolio items yet.')).toBeInTheDocument()
  })

  it('renders a full page of items', async () => {
    const items = Array.from({ length: 10 }, (_, i) => makeItem(i + 1))
    mockPortfolioResponse(items)
    render(<Home />, { wrapper: MemoryRouter })

    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(10))
    expect(screen.getByText('Project 1')).toBeInTheDocument()
    expect(screen.getByText('Project 10')).toBeInTheDocument()
  })

  it('shows an error state instead of crashing when the request fails', async () => {
    server.use(
      http.get(`${API_URL}/portfolio`, () =>
        HttpResponse.json({ success: false, message: 'Server error' }, { status: 500 }),
      ),
    )
    render(<Home />, { wrapper: MemoryRouter })

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})
