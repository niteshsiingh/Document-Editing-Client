import React from 'react';
import { render, screen } from '@testing-library/react';
import CreateDocumentButton from './create-document-btn';

test('renders create document button', () => {
    render(<CreateDocumentButton />);
    const buttonElement = screen.getByRole('button', { name: /create document/i });
    expect(buttonElement).toBeInTheDocument();
});