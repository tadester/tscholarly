import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../ForgotPasswordScreen';

const mockResetPassword = jest.fn();

jest.mock('../../../core/auth/auth.service', () => ({
  resetPassword: (email: string) => mockResetPassword(email),
}));

jest.mock('../../../components/AuthCard', () => {
  const React = require('react');
  return ({ children }: any) => <>{children}</>;
});

jest.mock('../../../components/FormInput', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return ({ value, onChangeText, placeholder }: any) => (
    <TextInput
      testID="email-input"
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
    <TouchableOpacity testID="reset-button" onPress={() => onPress()}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe('ForgotPasswordScreen', () => {
  const mockNavigate = jest.fn();

  const navigation = {
    navigate: mockNavigate,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<ForgotPasswordScreen navigation={navigation} />);

    expect(getByText('Reset Password')).toBeTruthy();
    expect(getByText('Send Reset Link')).toBeTruthy();
  });

  it('executes early return when form is invalid', async () => {
    const { getByTestId } = render(<ForgotPasswordScreen navigation={navigation} />);

    fireEvent.press(getByTestId('reset-button'));

    await waitFor(() => {
      expect(mockResetPassword).not.toHaveBeenCalled();
    });
  });

  it('shows success message on successful reset', async () => {
    mockResetPassword.mockResolvedValue({ error: null });

    const { getByTestId, getByText } = render(<ForgotPasswordScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.press(getByTestId('reset-button'));

    await waitFor(() => {
      expect(getByText('Password reset email sent.')).toBeTruthy();
    });
  });

  it('shows error message when reset fails', async () => {
    mockResetPassword.mockResolvedValue({
      error: { message: 'User not found' },
    });

    const { getByTestId, getByText } = render(<ForgotPasswordScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'bad@email.com');
    fireEvent.press(getByTestId('reset-button'));

    await waitFor(() => {
      expect(getByText('User not found')).toBeTruthy();
    });
  });

  it('navigates back to Login when link is pressed', () => {
    const { getByText } = render(<ForgotPasswordScreen navigation={navigation} />);

    fireEvent.press(getByText('Back to Login'));

    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
