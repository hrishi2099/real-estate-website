import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    mockOnSearch.mockClear()
  })

  it('renders with default props', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('renders with custom placeholder', () => {
    const customPlaceholder = 'Search properties...'
    render(<SearchBar onSearch={mockOnSearch} placeholder={customPlaceholder} />)
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument()
  })

  it('renders with default value', () => {
    const defaultValue = 'test query'
    render(<SearchBar onSearch={mockOnSearch} defaultValue={defaultValue} />)
    
    const input = screen.getByDisplayValue(defaultValue)
    expect(input).toBeInTheDocument()
  })

  it('updates input value when typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test query')
    
    expect(input).toHaveValue('test query')
  })

  it('calls onSearch when form is submitted', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test query')
    await user.keyboard('{Enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  it('calls onSearch when form is submitted by clicking search icon', () => {
    render(<SearchBar onSearch={mockOnSearch} defaultValue="test query" />)
    
    const form = document.querySelector('form')
    fireEvent.submit(form!)
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query')
  })

  it('shows clear button when input has value', () => {
    render(<SearchBar onSearch={mockOnSearch} defaultValue="test" />)
    
    const clearButton = screen.getByRole('button')
    expect(clearButton).toBeInTheDocument()
  })

  it('hides clear button when input is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const clearButton = screen.queryByRole('button')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('clears input and calls onSearch when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} defaultValue="test query" />)
    
    const clearButton = screen.getByRole('button')
    await user.click(clearButton)
    
    const input = screen.getByPlaceholderText('Search...')
    expect(input).toHaveValue('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('applies custom className', () => {
    const customClass = 'custom-search-bar'
    render(<SearchBar onSearch={mockOnSearch} className={customClass} />)
    
    const form = document.querySelector('form')
    expect(form).toHaveClass('relative', customClass)
  })

  it('prevents default form submission', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const form = document.querySelector('form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    
    fireEvent(form!, submitEvent)
    
    expect(submitEvent.defaultPrevented).toBe(true)
  })

  it('shows and hides clear button dynamically', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('Search...')
    
    // Initially no clear button
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    
    // Type something - clear button should appear
    await user.type(input, 'test')
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    // Clear input - clear button should disappear
    await user.clear(input)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')
    
    const clearButton = screen.queryByRole('button')
    if (clearButton) {
      expect(clearButton).toHaveAttribute('type', 'button')
    }
  })
})