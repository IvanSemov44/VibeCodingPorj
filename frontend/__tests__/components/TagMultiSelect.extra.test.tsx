import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../tests/test-utils'
import { vi } from 'vitest'

vi.mock('../../lib/api', () => ({
  useGetTagsQuery: () => ({ data: [{ id: 1, name: 'tag1' }], isLoading: false }),
}))

test('renders TagMultiSelect input', async () => {
  const { default: TagMultiSelect } = await import('../../components/TagMultiSelect')
  renderWithProviders(<TagMultiSelect selected={[]} onChange={() => {}} />)
  expect(await screen.findByPlaceholderText('Add tags...')).toBeTruthy()
})
