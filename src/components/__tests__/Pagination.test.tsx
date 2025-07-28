import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from '../Pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders pagination with basic props', () => {
    render(<Pagination {...defaultProps} />)
    
    expect(screen.getByText('Showing 1 to 10 of 50 results')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows items per page selector by default', () => {
    const onItemsPerPageChange = jest.fn()
    render(<Pagination {...defaultProps} onItemsPerPageChange={onItemsPerPageChange} />)
    
    expect(screen.getByDisplayValue('10 per page')).toBeInTheDocument()
  })

  it('hides items per page selector when showItemsPerPage is false', () => {
    const onItemsPerPageChange = jest.fn()
    render(
      <Pagination 
        {...defaultProps} 
        onItemsPerPageChange={onItemsPerPageChange}
        showItemsPerPage={false}
      />
    )
    
    expect(screen.queryByDisplayValue('10 per page')).not.toBeInTheDocument()
  })

  it('does not render pagination when totalPages is 1 and no items per page selector', () => {
    const { container } = render(
      <Pagination 
        {...defaultProps} 
        totalPages={1}
        showItemsPerPage={false}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders only items info when totalPages is 1 but items per page selector is enabled', () => {
    const onItemsPerPageChange = jest.fn()
    render(
      <Pagination 
        {...defaultProps} 
        totalPages={1}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    )
    
    expect(screen.getAllByText('Showing 1 to 10 of 50 results')).toHaveLength(2) // Mobile and desktop
    expect(screen.getByDisplayValue('10 per page')).toBeInTheDocument()
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
  })

  it('calls onPageChange when page button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()
    
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />)
    
    await user.click(screen.getByText('2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange when Previous button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()
    
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)
    
    const prevButtons = screen.getAllByText('Previous')
    await user.click(prevButtons[0])
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange when Next button is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()
    
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />)
    
    const nextButtons = screen.getAllByText('Next')
    await user.click(nextButtons[0])
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables Previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)
    
    // Find actual button elements, not span elements with sr-only text
    const prevButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Previous') || button.getAttribute('aria-label')?.includes('Previous')
    )
    
    expect(prevButtons.length).toBeGreaterThan(0)
    prevButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('disables Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />)
    
    // Find actual button elements, not span elements with sr-only text
    const nextButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('Next') || button.getAttribute('aria-label')?.includes('Next')
    )
    
    expect(nextButtons.length).toBeGreaterThan(0)
    nextButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)
    
    const currentPageButton = screen.getByRole('button', { name: '3' })
    expect(currentPageButton).toHaveClass('bg-blue-50', 'border-blue-500', 'text-blue-600')
  })

  it('calls onItemsPerPageChange when items per page is changed', async () => {
    const user = userEvent.setup()
    const onItemsPerPageChange = jest.fn()
    
    render(
      <Pagination 
        {...defaultProps} 
        onItemsPerPageChange={onItemsPerPageChange}
      />
    )
    
    const select = screen.getByDisplayValue('10 per page')
    await user.selectOptions(select, '25')
    
    expect(onItemsPerPageChange).toHaveBeenCalledWith(25)
  })

  it('uses custom items per page options', () => {
    const customOptions = [5, 15, 30]
    const onItemsPerPageChange = jest.fn()
    
    render(
      <Pagination 
        {...defaultProps} 
        onItemsPerPageChange={onItemsPerPageChange}
        itemsPerPageOptions={customOptions}
        itemsPerPage={5}
      />
    )
    
    expect(screen.getByText('5 per page')).toBeInTheDocument()
    expect(screen.getByText('15 per page')).toBeInTheDocument()
    expect(screen.getByText('30 per page')).toBeInTheDocument()
  })

  it('shows ellipsis for large page ranges', () => {
    render(
      <Pagination 
        {...defaultProps} 
        currentPage={10}
        totalPages={20}
      />
    )
    
    const ellipsisElements = screen.getAllByText('...')
    expect(ellipsisElements.length).toBeGreaterThan(0)
  })

  it('calculates correct item range display', () => {
    render(
      <Pagination 
        {...defaultProps} 
        currentPage={3}
        totalItems={47}
        itemsPerPage={10}
      />
    )
    
    expect(screen.getByText('Showing 21 to 30 of 47 results')).toBeInTheDocument()
  })

  it('calculates correct item range for last page', () => {
    render(
      <Pagination 
        {...defaultProps} 
        currentPage={5}
        totalItems={47}
        itemsPerPage={10}
      />
    )
    
    expect(screen.getByText('Showing 41 to 47 of 47 results')).toBeInTheDocument()
  })

  describe('Visible pages logic', () => {
    it('shows all pages when total pages is small', () => {
      render(<Pagination {...defaultProps} totalPages={3} />)
      
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows correct pages for middle page in large range', () => {
      render(
        <Pagination 
          {...defaultProps} 
          currentPage={10}
          totalPages={20}
        />
      )
      
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('9')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('11')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<Pagination {...defaultProps} />)
    
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(nav).toBeInTheDocument()
    
    // Check for screen reader text instead of aria-label
    expect(screen.getAllByText('Previous')).toHaveLength(2) // Mobile and desktop
    expect(screen.getAllByText('Next')).toHaveLength(2) // Mobile and desktop
    
    // Check for sr-only spans
    const srOnlyPrevious = screen.getByText('Previous', { selector: '.sr-only' })
    const srOnlyNext = screen.getByText('Next', { selector: '.sr-only' })
    expect(srOnlyPrevious).toBeInTheDocument()
    expect(srOnlyNext).toBeInTheDocument()
  })

  it('renders mobile pagination controls', () => {
    render(<Pagination {...defaultProps} />)
    
    // Mobile view has Previous/Next buttons
    const mobileButtons = screen.getAllByText(/Previous|Next/)
    expect(mobileButtons.length).toBeGreaterThanOrEqual(2)
  })
})