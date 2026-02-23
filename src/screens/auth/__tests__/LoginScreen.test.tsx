import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';

const mockSignIn = jest.fn();
const mockResend = jest.fn();

jest.mock('../../../core/auth/auth.service', () => ({
  signIn: (email: string, password: string) => mockSignIn(email, password),
}));

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    auth: {
      resend: (payload: any) => mockResend(payload),
    },
  },
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
      testID={placeholder === 'Email' ? 'email-input' : 'password-input'}
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
    <TouchableOpacity testID="login-button" onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe('LoginScreen', () => {
  const mockNavigate = jest.fn();

  const navigation = {
    navigate: mockNavigate,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<LoginScreen navigation={navigation} />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('returns early if form is invalid', async () => {
    const { getByTestId } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  it('shows error when login fails', async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    });

    const { getByTestId, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => expect(getByText('Invalid credentials')).toBeTruthy());
  });

  it('shows unverified email warning', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { email_confirmed_at: null } },
      error: null,
    });

    const { getByTestId, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => expect(getByText('Your email is not verified.')).toBeTruthy());

    expect(getByText('Resend verification email')).toBeTruthy();
  });

  it('shows error when resending verification without email', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { email_confirmed_at: null } },
      error: null,
    });

    const { getByTestId, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => expect(getByText('Resend verification email')).toBeTruthy());

    fireEvent.changeText(getByTestId('email-input'), '');

    fireEvent.press(getByText('Resend verification email'));

    await waitFor(() => expect(getByText('Enter your email to resend verification.')).toBeTruthy());
  });

  it('resends verification successfully', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { email_confirmed_at: null } },
      error: null,
    });

    mockResend.mockResolvedValue({ error: null });

    const { getByTestId, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => expect(getByText('Resend verification email')).toBeTruthy());

    fireEvent.press(getByText('Resend verification email'));

    await waitFor(() =>
      expect(getByText('Verification email resent. Check your inbox.')).toBeTruthy(),
    );
  });

  it('shows error when resend fails', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { email_confirmed_at: null } },
      error: null,
    });

    mockResend.mockResolvedValue({
      error: { message: 'Resend failed' },
    });

    const { getByTestId, getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => expect(getByText('Resend verification email')).toBeTruthy());

    fireEvent.press(getByText('Resend verification email'));

    await waitFor(() => expect(getByText('Resend failed')).toBeTruthy());
  });

  it('navigates to ForgotPassword', () => {
    const { getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByText('Forgot password?'));

    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
  });
  it('logs in successfully when email is verified', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { email_confirmed_at: '2024-01-01T00:00:00Z' } },
      error: null,
    });

    const { getByTestId, queryByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(getByTestId('email-input'), 'test@email.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });

    expect(queryByText('Your email is not verified.')).toBeNull();
  });
  it('navigates to Signup', () => {
    const { getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByText('Don’t have an account? Sign up'));

    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });
});
