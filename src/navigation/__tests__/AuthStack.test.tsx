import React from 'react';
import { render } from '@testing-library/react-native';

// ensure window and location exist
beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {},
    writable: true,
  });

  Object.defineProperty(window, 'location', {
    value: { hash: '' },
    writable: true,
  });
});

// mock screens
jest.mock('../../screens/auth/LoginScreen', () => 'LoginScreen');
jest.mock('../../screens/auth/SignupScreen', () => 'SignupScreen');
jest.mock('../../screens/auth/ForgotPasswordScreen', () => 'ForgotPasswordScreen');
jest.mock('../../screens/auth/UpdatePasswordScreen', () => 'UpdatePasswordScreen');

// mock navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// mock stack navigator
jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    createNativeStackNavigator: jest.fn(() => {
      return {
        Navigator: ({ children }: any) => React.createElement(React.Fragment, null, children),
        Screen: ({ name }: any) => React.createElement(Text, null, name),
      };
    }),
  };
});

import AuthStack from '../AuthStack';

describe('AuthStack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.hash = '';
  });

  it('renders all auth screens', () => {
    const { getByText } = render(<AuthStack />);

    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Signup')).toBeTruthy();
    expect(getByText('ForgotPassword')).toBeTruthy();
    expect(getByText('UpdatePassword')).toBeTruthy();
  });

  it('navigates to UpdatePassword when hash contains recovery', () => {
    window.location.hash = '#type=recovery';

    render(<AuthStack />);

    expect(mockNavigate).toHaveBeenCalledWith('UpdatePassword');
  });

  it('does not navigate when hash does not contain recovery', () => {
    window.location.hash = '';

    render(<AuthStack />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does nothing when window is undefined', () => {
    const originalWindow = global.window;

    // @ts-ignore
    delete global.window;

    render(<AuthStack />);

    expect(mockNavigate).not.toHaveBeenCalled();

    global.window = originalWindow;
  });
});
