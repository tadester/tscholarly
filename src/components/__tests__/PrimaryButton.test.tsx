import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from '../PrimaryButton';

describe('PrimaryButton', () => {
  it('renders the title correctly', () => {
    const { getByText } = render(<PrimaryButton title="Submit" onPress={jest.fn()} />);

    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();

    const { getByText } = render(<PrimaryButton title="Click Me" onPress={mockPress} />);

    fireEvent.press(getByText('Click Me'));

    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('shows "Loading..." when loading is true', () => {
    const { getByText } = render(<PrimaryButton title="Save" onPress={jest.fn()} loading />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('does not call onPress when loading', () => {
    const mockPress = jest.fn();

    const { getByText } = render(<PrimaryButton title="Save" onPress={mockPress} loading />);

    fireEvent.press(getByText('Loading...'));

    expect(mockPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when disabled', () => {
    const mockPress = jest.fn();

    const { getByText } = render(<PrimaryButton title="Save" onPress={mockPress} disabled />);

    fireEvent.press(getByText('Save'));

    expect(mockPress).not.toHaveBeenCalled();
  });
});
