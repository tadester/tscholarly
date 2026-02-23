import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import AuthCard from '../AuthCard';

// Helper to mock screen width
const mockWidth = (width: number) => {
  jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
    width,
    height: 800,
    scale: 1,
    fontScale: 1,
  });
};

describe('AuthCard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders navbar and logo', () => {
    mockWidth(1200);

    const { getByText } = render(
      <AuthCard>
        <Text>Child Content</Text>
      </AuthCard>,
    );

    expect(getByText('Tscholarly')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Features')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('renders children inside card', () => {
    mockWidth(1200);

    const { getByText } = render(
      <AuthCard>
        <Text>Test Child</Text>
      </AuthCard>,
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

  it('shows left panel on desktop width', () => {
    mockWidth(1200);

    const { getByText } = render(
      <AuthCard>
        <Text>Child</Text>
      </AuthCard>,
    );

    expect(getByText('Discover Scholarships Tailored For You')).toBeTruthy();
  });

  it('hides left panel on mobile width', () => {
    mockWidth(500);

    const { queryByText } = render(
      <AuthCard>
        <Text>Child</Text>
      </AuthCard>,
    );

    expect(queryByText('Discover Scholarships Tailored For You')).toBeNull();
  });
});
