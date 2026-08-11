import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import SignUpForm from '@/components/SignUpForm'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const { register } = vi.hoisted(() => ({ register: vi.fn() }))

vi.mock('@/api/auth', () => ({
  register,
}))

describe('SignUpForm', () => {
  it('shows a mismatch error and does not call the api when passwords differ', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignUpForm onSwitchToLogin={() => {}} />)

    await user.type(screen.getByLabelText('Username'), 'chef')
    await user.type(screen.getByLabelText('Password'), 'secretpw')
    await user.type(screen.getByLabelText('Confirm password'), 'different')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })
})
