import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { signOut } from '../../core/auth/auth.service';
import { supabase } from '../../integration/supabase';
import { useNavigation } from '@react-navigation/native';

import { useProfile, isProfileComplete } from '../../features/profile/hooks';

import { useScholarships } from '../../features/scholarships/hooks';

export default function HomeScreen() {
  const navigation = useNavigation<unknown>();

  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');

  const [userId, setUserId] = useState<string | undefined>();

  // Get logged-in user once
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id);
    };
    fetchUser();
  }, []);

  const { profile, loading: profileLoading } = useProfile(userId);
  const profileComplete = isProfileComplete(profile);

  const { data: scholarships, loading: scholarshipsLoading } = useScholarships(userId, activeTab);

  // Prevent blank screen before user loads
  if (!userId || profileLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator testID="loading-indicator" size="large" />
      </View>
    );
  }

  const renderScholarship = ({ item }: unknown) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text>{item.organization}</Text>
      {item.award_amount && <Text style={styles.amount}>${item.award_amount}</Text>}
      {item.deadline && (
        <Text style={styles.deadline}>
          Deadline: {new Date(item.deadline).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Incomplete Banner */}
      {!profileComplete && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Complete your profile to unlock personalized scholarship matches.
          </Text>

          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => navigation.navigate('ProfileSetup')}
          >
            <Text style={styles.bannerButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Scholarships
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'recommended' && styles.activeTab]}
          onPress={() => setActiveTab('recommended')}
        >
          <Text style={[styles.tabText, activeTab === 'recommended' && styles.activeTabText]}>
            Recommended
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Locked State */}
      {activeTab === 'recommended' && !profileComplete ? (
        <View style={styles.center}>
          <Text
            style={{
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Complete your profile to see scholarships you qualify for.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ProfileSetup')}
          >
            <Text style={styles.primaryButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      ) : scholarshipsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={scholarships}
          keyExtractor={(item) => item.id}
          renderItem={renderScholarship}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>No scholarships found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logout: {
    color: 'red',
  },
  banner: {
    backgroundColor: '#FFF4D6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: {
    color: '#8A6D3B',
    marginBottom: 8,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bannerButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#EEE',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    color: '#333',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    marginTop: 4,
    fontWeight: '600',
  },
  deadline: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  primaryButton: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
