import React from 'react';
import { render } from '@testing-library/react-native';

// mock stacks
jest.mock('../AuthStack', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockAuthStack() {
    return React.createElement(Text, null, 'AuthStack');
  };
});

jest.mock('../AppStack', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function MockAppStack() {
    return React.createElement(Text, null, 'AppStack');
  };
});

// mock AuthContext
const mockUseContext = jest.fn();

jest.mock('../../core/auth/AuthContext', () => {
  return {
    AuthContext: {
      Consumer: ({ children }: any) => children(mockUseContext()),
    },
  };
});

import * as ReactModule from 'react';
import RootNavigator from '../RootNavigator';

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator when loading is true', () => {
    jest.spyOn(ReactModule, 'useContext').mockReturnValue({
      user: null,
      loading: true,
    } as any);

    const { getByTestId } = render(<RootNavigator />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders AppStack when user exists', () => {
    jest.spyOn(ReactModule, 'useContext').mockReturnValue({
      user: { id: '1' },
      loading: false,
    } as any);

    const { getByText } = render(<RootNavigator />);

    expect(getByText('AppStack')).toBeTruthy();
  });

  it('renders AuthStack when user is null', () => {
    jest.spyOn(ReactModule, 'useContext').mockReturnValue({
      user: null,
      loading: false,
    } as any);

    const { getByText } = render(<RootNavigator />);

    expect(getByText('AuthStack')).toBeTruthy();
  });
});
