import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Footer } from '../../js/presentation/footer';

// Mock the i18next Trans component
jest.mock('react-i18next', () => ({
  Trans: ({ children, i18nKey }) => <span data-testid={i18nKey}>{children}</span>,
}));

describe('Footer Integration Tests', () => {
  const renderFooter = () => {
    return render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );
  };

  test('should render footer component without crashing', () => {
    renderFooter();
    const footer = document.querySelector('.footer');
    expect(footer).toBeInTheDocument();
  });

  test('should display current year in footer', () => {
    renderFooter();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(currentYear + '.', { exact: false })).toBeInTheDocument();
  });

  test('should have privacy notice link', () => {
    renderFooter();
    const links = screen.getAllByRole('link');
    const privacyLink = links.find(link => link.getAttribute('href') === '/privacyNotice');
    expect(privacyLink).toBeTruthy();
  });

  test('should render copyright translation component', () => {
    renderFooter();
    const copyrightElement = screen.getByTestId('footer.copyright');
    expect(copyrightElement).toBeInTheDocument();
  });

  test('should have external link to uni.lu', () => {
    renderFooter();
    const links = screen.getAllByRole('link');
    const uniLink = links.find(link => link.getAttribute('href') === 'https://www.uni.lu');
    expect(uniLink).toBeTruthy();
    expect(uniLink).toHaveAttribute('target', '_blank');
  });
});
