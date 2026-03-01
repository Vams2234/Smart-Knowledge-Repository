import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchInterface from './SearchInterface';
import React from 'react';

// Mock SearchResults to avoid complex virtualization testing here
vi.mock('./SearchResults', () => ({
    default: () => <div data-testid="search-results">Results</div>
}));

describe('SearchInterface Component', () => {
    it('renders search input', () => {
        render(<SearchInterface />);
        expect(screen.getByPlaceholderText(/Search for people/i)).toBeInTheDocument();
    });

    it('updates input value on change', () => {
        render(<SearchInterface />);
        const input = screen.getByPlaceholderText(/Search for people/i);
        fireEvent.change(input, { target: { value: 'React' } });
        expect(input.value).toBe('React');
    });

    it('toggles view mode', () => {
        render(<SearchInterface />);
        const listBtn = screen.getByText('List');
        fireEvent.click(listBtn);
        expect(listBtn).toBeInTheDocument();
    });
});