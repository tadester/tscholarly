import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { signUp } from '../../core/auth/auth.service';
import AuthCard from '../../components/AuthCard';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

interface Props {
  navigation: SignupScreenNavigationProp;
}

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isFormValid = email.trim() !== '' && password.length >= 6 && confirmPassword === password;

  const handleSignup = async () => {
    if (!isFormValid) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess('Account created successfully. You can now sign in.');
    setLoading(false);

    setTimeout(() => {
      navigation.navigate('Login');
    }, 2000);
  };

  return (
    <AuthCard>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <FormInput placeholder="Email" value={email} onChangeText={setEmail} />

      <FormInput
        placeholder="Password"
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
        title="Sign Up"
        onPress={handleSignup}
        loading={loading}
        disabled={!isFormValid}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
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
