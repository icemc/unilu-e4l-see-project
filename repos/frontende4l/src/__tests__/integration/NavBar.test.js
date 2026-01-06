import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import { NavBar } from '../../js/presentation/NavBar';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  Trans: ({ children }) => <div>{children}</div>,
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock i18n
jest.mock('../../js/i18n', () => ({
  changeLanguage: jest.fn(),
  language: 'en',
}));

// Mock user actions
jest.mock('../../js/action/userAction', () => ({
  logout: jest.fn(),
  changeWebsiteLanguage: jest.fn(),
}));

// Mock images
jest.mock('../../../public/img/uni-lu-logo.svg', () => 'uni-lu-logo.svg');
jest.mock('../../../public/img/logo-s4l-try.jpg', () => 'logo-s4l-try.jpg');
jest.mock('../../../public/img/logo_invert.png', () => 'logo_invert.png');
jest.mock('../../../public/img/logo-reg.png', () => 'logo-reg.png');

describe('NavBar Integration Tests', () => {
  // Create a mock store with initial state
  const createMockStore = (initialState = {}) => {
    const defaultState = {
      userReducer: {
        isAuthenticate: false,
        user: null,
        lang: 'en',
      },
      questionnaireReducer: {
        kid: false,
      },
      navReducer: {
        isNavButtonsDisabled: 'false',
        isLogoutButtonDisabled: 'true',
      },
      seminarReducer: {},
      ...initialState,
    };

    const rootReducer = (state = defaultState) => state;
    return createStore(rootReducer);
  };

  const renderNavBar = (store = createMockStore()) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <NavBar />
        </BrowserRouter>
      </Provider>
    );
  };

  test('should render NavBar component without crashing', () => {
    const { container } = renderNavBar();
    expect(container).toBeInTheDocument();
  });

  test('should render navbar element', () => {
    const store = createMockStore();
    const { container } = renderNavBar(store);
    
    const navbar = container.querySelector('.navbar');
    expect(navbar).toBeTruthy();
  });

  test('should handle authenticated user with roles', () => {
    const store = createMockStore({
      userReducer: {
        isAuthenticate: true,
        user: { 
          id: 1, 
          name: 'Test User',
          roles: ['USER']
        },
        lang: 'en',
      },
      navReducer: {
        isNavButtonsDisabled: 'true',
        isLogoutButtonDisabled: 'false',
      },
    });
    
    const { container } = renderNavBar(store);
    expect(container).toBeInTheDocument();
  });
});

