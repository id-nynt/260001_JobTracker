import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '../context/ThemeContext'
import { ToastProvider } from '../context/ToastContext'
import JobForm from './JobForm'

const groups = [
  { id: 1, name: 'Default', isDefault: true },
  { id: 2, name: '2026_Data', isDefault: false }
]

const renderForm = (onAddJob) =>
  render(
    <ThemeProvider>
      <ToastProvider>
        <JobForm onAddJob={onAddJob} groups={groups} />
      </ToastProvider>
    </ThemeProvider>
  )

const fillRequired = async (user) => {
  await user.type(screen.getByLabelText('Company Name *'), 'Acme')
  await user.type(screen.getByLabelText('Job Title *'), 'Developer')
}

describe('JobForm', () => {
  it('sends the chosen group as a number, then clears the form but stays on that group', async () => {
    const user = userEvent.setup()
    const onAddJob = vi.fn().mockResolvedValue(true)
    renderForm(onAddJob)

    await fillRequired(user)
    await user.selectOptions(screen.getByLabelText('Group'), '2026_Data')
    await user.click(screen.getByRole('button', { name: 'Add Application' }))

    expect(onAddJob).toHaveBeenCalledTimes(1)
    expect(onAddJob.mock.calls[0][0]).toMatchObject({ companyName: 'Acme', jobTitle: 'Developer', periodId: 2 })
    expect(screen.getByLabelText('Company Name *')).toHaveValue('')
    expect(screen.getByLabelText('Group')).toHaveValue('2')
  })

  it('keeps what the user typed when saving fails', async () => {
    const user = userEvent.setup()
    const onAddJob = vi.fn().mockResolvedValue(false)
    renderForm(onAddJob)

    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: 'Add Application' }))

    expect(onAddJob).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Company Name *')).toHaveValue('Acme')
    expect(screen.getByLabelText('Job Title *')).toHaveValue('Developer')
  })
})
