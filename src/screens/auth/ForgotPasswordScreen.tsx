import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { resetPassword } from '../../core/auth/auth.service';
import AuthCard from '../../components/AuthCard';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordNavigationProp;
}

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = email.trim() !== '';

  const handleReset = async () => {
    if (!isFormValid) return;

    setError(null);
    setMessage(null);
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage('Password reset email sent.');
    setLoading(false);
  };

  return (
    <AuthCard>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to reset</Text>

      <FormInput placeholder="Email" value={email} onChangeText={setEmail} />

      {error && <Text style={styles.error}>{error}</Text>}
      {message && <Text style={styles.success}>{message}</Text>}

      <PrimaryButton
        title="Send Reset Link"
        onPress={handleReset}
        loading={loading}
        disabled={!isFormValid}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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
  link: {
    marginTop: 16,
    color: '#4f46e5',
    fontSize: 14,
  },
});
