import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  return (
    <View style={styles.page}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>Tscholarly</Text>

        <View style={styles.navLinks}>
          <Text style={styles.navItem}>Home</Text>
          <Text style={styles.navItem}>Features</Text>
          <Text style={styles.navItem}>About</Text>
          <Text style={styles.navItem}>Sign In</Text>
          <Text style={[styles.navItem, styles.navHighlight]}>Sign Up</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={[styles.container, isMobile && styles.mobileContainer]}>
        {!isMobile && (
          <View style={styles.leftPanel}>
            <Text style={styles.heroTitle}>Discover Scholarships Tailored For You</Text>
            <Text style={styles.heroSubtitle}>Apply smarter. Find opportunities faster.</Text>
          </View>
        )}

        <View style={styles.rightPanel}>
          <View style={styles.card}>{children}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },

  navbar: {
    height: 70,
    paddingHorizontal: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4f46e5',
  },

  navLinks: {
    flexDirection: 'row',
    gap: 30,
  },

  navItem: {
    fontSize: 14,
    color: '#444',
  },

  navHighlight: {
    color: '#4f46e5',
    fontWeight: '600',
  },

  container: {
    flex: 1,
    flexDirection: 'row',
  },

  mobileContainer: {
    flexDirection: 'column',
  },

  leftPanel: {
    flex: 1,
    backgroundColor: '#eef0ff',
    justifyContent: 'center',
    paddingHorizontal: 80,
  },

  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 16,
  },

  heroSubtitle: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },

  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  card: {
    width: 420,
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 5,
  },
});
