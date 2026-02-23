import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignupScreen from '../SignupScreen';

const mockSignUp = jest.fn();

jest.mock('../../../core/auth/auth.service', () => ({
  signUp: (email: string, password: string) => mockSignUp(email, password),
}));

jest.mock('../../../components/AuthCard', () => {
  const React = require('react');
  return ({ children }: any) => <>{children}</>;
});

jest.mock('../../../components/FormInput', () => {
  const React = require('react');
  const { TextInput } = require('react-native');

  const testIdForPlaceholder = (placeholder: string) => {
    if (placeholder === 'Email') return 'email-input';
    if (placeholder === 'Password') return 'password-input';
    if (placeholder === 'Confirm Password') return 'confirm-password-input';
    return 'input';
  };

  return ({ value, onChangeText, placeholder }: any) => (
    <TextInput
      testID={testIdForPlaceholder(placeholder)}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
});

jest.mock('../../../components/PrimaryButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ title, onPress }: any) => (
    <TouchableOpacity testID="signup-button" onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe('SignupScreen', () => {
  const mockNavigate = jest.fn();

  const navigation = {
    navigate: mockNavigate,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    const { getByText } = render(<SignupScreen navigation={navigation} />);

    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
    expect(getByText('Already have an account? Sign in')).toBeTruthy();
  });

  it('returns early when form is invalid', async () => {
    const { getByTestId } = render(<SignupScreen navigation={navigation} />);

    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('returns early when confirm password does not match', async () => {
    const { getByTestId } = render(<SignupScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '654321');

    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('shows error when signup fails', async () => {
    mockSignUp.mockResolvedValue({
      error: { message: 'Signup failed' },
    });

    const { getByTestId, getByText } = render(<SignupScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '123456');

    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(getByText('Signup failed')).toBeTruthy();
    });
  });

  it('shows success and navigates to Login after 2000ms', async () => {
    jest.useFakeTimers();

    mockSignUp.mockResolvedValue({
      error: null,
    });

    const { getByTestId, getByText, queryByText } = render(
      <SignupScreen navigation={navigation} />,
    );

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '123456');

    fireEvent.press(getByTestId('signup-button'));

    await waitFor(() => {
      expect(getByText('Account created successfully. You can now sign in.')).toBeTruthy();
    });

    expect(queryByText('Signup failed')).toBeNull();

    jest.advanceTimersByTime(1999);
    expect(mockNavigate).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockNavigate).toHaveBeenCalledWith('Login');

    jest.useRealTimers();
  });

  it('navigates to Login when link is pressed', () => {
    const { getByText } = render(<SignupScreen navigation={navigation} />);

    fireEvent.press(getByText('Already have an account? Sign in'));

    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
