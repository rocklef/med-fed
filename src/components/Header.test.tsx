import { render, screen } from '@testing-library/react';
import Header from './Header';
import { BrowserRouter } from 'react-router-dom';

describe('Header', () => {
  it('renders the header with the correct title', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    const heading = screen.getByText(/F-MedLLM/i);
    expect(heading).toBeInTheDocument();
  });
});
