import React, { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { signIn } from '../../core/auth/auth.service';
import { supabase } from '../../integration/supabase';
import AuthCard from '../../components/AuthCard';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isFormValid = email.trim() !== '' && password.length >= 6;

  const handleLogin = async () => {
    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Allow login but show warning if unverified
    if (!data?.user?.email_confirmed_at) {
      setError('Your email is not verified.');
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Enter your email to resend verification.');
      return;
    }

    setError(null);
    setInfoMessage(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      setError(error.message);
    } else {
      setInfoMessage('Verification email resent. Check your inbox.');
    }
  };

  return (
    <AuthCard>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <FormInput placeholder="Email" value={email} onChangeText={setEmail} />

      <FormInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      {infoMessage && <Text style={styles.success}>{infoMessage}</Text>}

      {error === 'Your email is not verified.' && (
        <TouchableOpacity onPress={handleResendVerification}>
          <Text style={styles.link}>Resend verification email</Text>
        </TouchableOpacity>
      )}

      <PrimaryButton
        title="Sign In"
        onPress={handleLogin}
        loading={loading}
        disabled={!isFormValid}
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don’t have an account? Sign up</Text>
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
    marginTop: 12,
    color: '#4f46e5',
    fontSize: 14,
  },
});
