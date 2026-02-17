import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export default function FormInput(props: TextInputProps) {
  return (
    <TextInput {...props} style={[styles.input, props.style]} placeholderTextColor="#9ca3af" />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 14,
  },
});
