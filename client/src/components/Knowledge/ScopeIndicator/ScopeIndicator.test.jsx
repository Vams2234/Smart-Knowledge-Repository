import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ScopeIndicator from './ScopeIndicator';
import React from 'react';

describe('ScopeIndicator Component', () => {
    it('renders correct domain label', () => {
        const scope = { confidence: 90, domain: 'Profile Search' };
        render(<ScopeIndicator scope={scope} />);
        expect(screen.getByText('Profile Search')).toBeInTheDocument();
    });

    it('shows waiting state when confidence is 0', () => {
        const scope = { confidence: 0, domain: 'unknown' };
        render(<ScopeIndicator scope={scope} />);
        expect(screen.getByText('Waiting for input')).toBeInTheDocument();
    });
});