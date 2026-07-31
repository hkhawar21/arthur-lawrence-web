import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import PortfolioForm from './PortfolioForm'
import { portfolioFormInitialValues } from '@/types/portfolio'

describe('PortfolioForm', () => {
  it('shows validation errors and does not submit when required fields are missing', async () => {
    const onSubmit = vi.fn()
    render(
      <PortfolioForm
        initialValues={portfolioFormInitialValues}
        onSubmit={onSubmit}
        submitLabel="Save"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Description is required')).toBeInTheDocument()
    expect(screen.getByText('Project URL is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('flags an invalid URL without blocking on unrelated fields', async () => {
    const onSubmit = vi.fn()
    render(
      <PortfolioForm
        initialValues={{ ...portfolioFormInitialValues, projectUrl: 'not-a-url' }}
        onSubmit={onSubmit}
        submitLabel="Save"
      />,
    )

    await userEvent.type(screen.getByLabelText('Title'), 'My Project')
    await userEvent.type(screen.getByLabelText('Description'), 'Does things')
    await userEvent.type(screen.getByLabelText('Technology'), 'React')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Enter a valid project URL')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with the trimmed, valid values', async () => {
    const onSubmit = vi.fn()
    render(
      <PortfolioForm
        initialValues={portfolioFormInitialValues}
        onSubmit={onSubmit}
        submitLabel="Save"
      />,
    )

    await userEvent.type(screen.getByLabelText('Title'), 'My Project')
    await userEvent.type(screen.getByLabelText('Description'), 'Does things')
    await userEvent.type(screen.getByLabelText('Technology'), 'React')
    await userEvent.type(screen.getByLabelText('Project URL'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'My Project',
      description: 'Does things',
      projectUrl: 'https://example.com',
    })
  })
})
