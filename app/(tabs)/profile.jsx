import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { User, Mail, Phone, MapPin, Calendar, Award, LogOut } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { GetMember } from '../../services/Member';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#2f9f3d',
  background: '#f5f5f3',
  dark: '#161618',
  white: '#ffffff',
  gray: '#a1a1aa',
  danger: '#ef4444',
};

export default function ProfileScreen() {
  const { logout, authUser } = useAuth();
  const memberId = authUser?.data?.memberId;

  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member'],
    queryFn: async () => {
      if (!memberId) throw new Error('Member ID not found');
      const response = await GetMember(memberId);
      return response.data;
    },
    enabled: !!memberId,
  });

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <View style={styles.infoItem}>
      <View style={styles.iconContainer}>
        <Icon color={COLORS.primary} size={20} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erreur: {error?.message || 'Membre non trouvé'}</Text>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={COLORS.danger} size={20} />
          <Text style={styles.logoutText}>Retour au Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color={COLORS.white} size={40} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: member.status === 'Expiring' ? '#f59e0b' : COLORS.primary }]}>
              <Text style={styles.statusBadgeText}>{member.status || 'Actif'}</Text>
            </View>
          </View>
          <Text style={styles.nameText}>{member.FullName}</Text>
          <Text style={styles.emailHeader}>{member.Email}</Text>
        </View>

        {/* Membership Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de l'Abonnement</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Award color={COLORS.white} size={24} />
              <Text style={styles.planName}>{member.Plan?.name || 'Plan standard'}</Text>
            </View>
            <View style={styles.planDates}>
              <View>
                <Text style={styles.dateLabel}>Date de début</Text>
                <Text style={styles.dateValue}>{formatDate(member.startDate)}</Text>
              </View>
              <View style={styles.dateSeparator} />
              <View>
                <Text style={styles.dateLabel}>Date de fin</Text>
                <Text style={styles.dateValue}>{formatDate(member.endDate)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>
          <View style={styles.infoCard}>
            <InfoItem icon={Mail} label="Email" value={member.Email} />
            <View style={styles.divider} />
            <InfoItem icon={Phone} label="Téléphone" value={member.phone} />
            <View style={styles.divider} />
            <InfoItem icon={MapPin} label="Adresse" value={member.address} />
          </View>
        </View>

        {/* Logout Button */}
        <Pressable 
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressedLogout
          ]} 
          onPress={handleLogout}
        >
          <LogOut color={COLORS.danger} size={20} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.dark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.background,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 4,
  },
  emailHeader: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 12,
    marginLeft: 4,
  },
  planCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  planName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  planDates: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 16,
  },
  dateLabel: {
    color: COLORS.gray,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  dateSeparator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 8,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.background,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    marginTop: 40,
    padding: 20,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressedLogout: {
    opacity: 0.8,
    backgroundColor: '#fff1f1',
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 17,
    fontWeight: '800',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  spacer: {
    height: 40,
  },
});
