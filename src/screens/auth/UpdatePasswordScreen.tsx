import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { supabase } from '../../integration/supabase';
import AuthCard from '../../components/AuthCard';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFormValid = password.length >= 6 && confirmPassword === password;

  const handleUpdate = async () => {
    if (!isFormValid) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess('Password updated successfully.');
    setLoading(false);
  };

  return (
    <AuthCard>
      <Text style={styles.title}>Set New Password</Text>

      <FormInput
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <FormInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}

      <PrimaryButton
        title="Update Password"
        onPress={handleUpdate}
        loading={loading}
        disabled={!isFormValid}
      />
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    marginBottom: 10,
  },
});
