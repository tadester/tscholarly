import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import FormInput from '../FormInput';

describe('FormInput', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(<FormInput placeholder="Email" />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const { getByPlaceholderText } = render(
      <FormInput placeholder="Name" style={{ backgroundColor: 'red' }} />,
    );

    const input = getByPlaceholderText('Name');

    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: 'red' })]),
    );
  });

  it('forwards value and onChangeText', () => {
    const mockChange = jest.fn();

    const { getByPlaceholderText } = render(
      <FormInput placeholder="Username" value="initial" onChangeText={mockChange} />,
    );

    const input = getByPlaceholderText('Username');

    fireEvent.changeText(input, 'new value');

    expect(mockChange).toHaveBeenCalledWith('new value');
  });

  it('sets placeholder text color correctly', () => {
    const { UNSAFE_getByType } = render(<FormInput placeholder="Test" />);

    const input = UNSAFE_getByType(TextInput);

    expect(input.props.placeholderTextColor).toBe('#9ca3af');
  });
});
