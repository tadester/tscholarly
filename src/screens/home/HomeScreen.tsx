import React from 'react';
import { View, Text, Button } from 'react-native';
import { signOut } from '../../core/auth/auth.service';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Dashboard</Text>
      <Button title="Logout" onPress={() => signOut()} />
    </View>
  );
}
