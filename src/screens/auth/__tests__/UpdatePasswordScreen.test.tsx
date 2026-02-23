import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UpdatePasswordScreen from '../UpdatePasswordScreen';

const mockUpdateUser = jest.fn();

jest.mock('../../../integration/supabase', () => ({
  supabase: {
    auth: {
      updateUser: (payload: any) => mockUpdateUser(payload),
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

  const testIdForPlaceholder = (placeholder: string) => {
    if (placeholder === 'New Password') return 'new-password-input';
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
    <TouchableOpacity testID="update-button" onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe('UpdatePasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<UpdatePasswordScreen />);

    expect(getByText('Set New Password')).toBeTruthy();
    expect(getByText('Update Password')).toBeTruthy();
  });

  it('returns early when form is invalid', async () => {
    const { getByTestId } = render(<UpdatePasswordScreen />);

    fireEvent.press(getByTestId('update-button'));

    await waitFor(() => {
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  it('returns early when passwords do not match', async () => {
    const { getByTestId } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByTestId('new-password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '654321');

    fireEvent.press(getByTestId('update-button'));

    await waitFor(() => {
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  it('shows error when update fails', async () => {
    mockUpdateUser.mockResolvedValue({
      error: { message: 'Update failed' },
    });

    const { getByTestId, getByText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByTestId('new-password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '123456');

    fireEvent.press(getByTestId('update-button'));

    await waitFor(() => {
      expect(getByText('Update failed')).toBeTruthy();
    });
  });

  it('shows success when password updates', async () => {
    mockUpdateUser.mockResolvedValue({
      error: null,
    });

    const { getByTestId, getByText, queryByText } = render(<UpdatePasswordScreen />);

    fireEvent.changeText(getByTestId('new-password-input'), '123456');
    fireEvent.changeText(getByTestId('confirm-password-input'), '123456');

    fireEvent.press(getByTestId('update-button'));

    await waitFor(() => {
      expect(getByText('Password updated successfully.')).toBeTruthy();
    });

    expect(queryByText('Update failed')).toBeNull();
  });
});
