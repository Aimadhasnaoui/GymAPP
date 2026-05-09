import { useQuery } from "@tanstack/react-query";
import { Award, Bell, Calendar, Clock, User } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { GetMember, getCheckInByMemberId } from "../services/Member";

const COLORS = {
  primary: "#2f9f3d",
  background: "#f5f5f3",
  dark: "#161618",
  white: "#ffffff",
  gray: "#a1a1aa",
};

export default function HomePage() {
  const { authUser } = useAuth();
  const memberId = authUser?.data?.memberId;

  const { data: member, isLoading } = useQuery({
    queryKey: ["member"],
    queryFn: async () => {
      if (!memberId) throw new Error("Member ID not found");
      const response = await GetMember(memberId);
      return response.data;
    },
    enabled: !!memberId,
  });

  const { data: checkInHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["checkins"],
    queryFn: async () => {
      if (!memberId) return [];
      const response = await getCheckInByMemberId(memberId);
      return response.data.sort(
        (a, b) => new Date(b.CheckIn) - new Date(a.CheckIn),
      );
    },
    enabled: !!memberId && !!member,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bonjour,</Text>
            <Text style={styles.nameText}>
              {member?.FullName || "Utilisateur"}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconButton}>
              <Bell color={COLORS.dark} size={22} />
            </Pressable>
            <View style={styles.avatar}>
              <User color={COLORS.white} size={24} />
            </View>
          </View>
        </View>

        {/* Plan Status Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planIconContainer}>
              <Award color={COLORS.white} size={20} />
            </View>
            <View>
              <Text style={styles.planTitle}>
                {member?.Plan?.name || "Abonnement"}
              </Text>
              <Text style={styles.planSubtitle}>
                {member?.status === "Expiring"
                  ? "Bientôt expiré"
                  : "Plan Actif"}
              </Text>
            </View>
          </View>

          <View style={styles.planDetails}>
            <View style={styles.detailItem}>
              <Calendar color={COLORS.primary} size={18} />
              <View>
                <Text style={styles.detailLabel}>Date de fin</Text>
                <Text style={styles.detailValue}>
                  {formatDate(member?.endDate)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: "65%" }]} />
          </View>
          <Text style={styles.progressText}>
            {member?.endDate
              ? `${Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24))} jours restants`
              : "N/A"}
          </Text>
        </View>

        {/* Check-in Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historique de présence</Text>
          <Pressable>
            <Text style={styles.seeAllText}>Tout voir</Text>
          </Pressable>
        </View>

        {isHistoryLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          checkInHistory?.slice(0, 6).map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Clock color={COLORS.primary} size={20} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyDate}>
                  {formatDate(item.CheckIn)}
                </Text>
                <Text style={styles.historyTime}>
                  {formatTime(item.CheckIn)}
                </Text>
              </View>
              <View style={styles.checkinBadge}>
                <Text style={styles.checkinBadgeText}>Présent</Text>
              </View>
            </View>
          ))
        )}

        {!isHistoryLoading &&
          (!checkInHistory || checkInHistory.length === 0) && (
            <Text
              style={{ textAlign: "center", color: COLORS.gray, marginTop: 20 }}
            >
              Aucune présence enregistrée
            </Text>
          )}

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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: "500",
  },
  nameText: {
    fontSize: 28,
    color: COLORS.dark,
    fontWeight: "900",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  planCard: {
    backgroundColor: COLORS.dark,
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  planIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  planTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  planSubtitle: {
    color: COLORS.gray,
    fontSize: 14,
  },
  planDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    color: COLORS.gray,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: "right",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.dark,
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.dark,
  },
  historyTime: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  checkinBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checkinBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  spacer: {
    height: 20,
  },
});
