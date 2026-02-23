import React from 'react';
import { render } from '@testing-library/react-native';

// Mock screens
jest.mock('../../screens/home/HomeScreen', () => 'HomeScreen');
jest.mock('../../screens/profile/ProfileSetupScreen', () => 'ProfileSetupScreen');

// Proper mock WITHOUT out-of-scope references
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

import AppStack from '../AppStack';

describe('AppStack', () => {
  it('renders Home and ProfileSetup screens', () => {
    const { getByText } = render(<AppStack />);

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('ProfileSetup')).toBeTruthy();
  });
});
