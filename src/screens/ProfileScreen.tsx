// ─── Profile Screen (Mobile) ─────────────────────────────────────────────────────
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, LogOut, User, Trash2 } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useStore } from "../store/useStore";
import { deleteAccount } from "../lib/sync";

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const stats = useStore((s) => s.stats);
  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? null;

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your progress will still be saved locally.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Clear Cloud Data",
      "This will remove your synced game data from the cloud and sign you out. Full account deletion requires support.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            if (!user) return;

            try {
              await deleteAccount(user.id);
            } catch (error) {
              console.warn('Account deletion failed:', error);
            }

            await signOut();

            Alert.alert("Cloud Data Cleared", "Your synced game data was removed and you were signed out.");
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        S.root,
        { backgroundColor: colors.bgPage, paddingTop: insets.top },
      ]}
    >
      {/* ── Header ── */}
      <View style={[S.header, { borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home" as never)}
          style={S.headerBtn}
        >
          <ChevronLeft size={28} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[S.headerTitle, { color: colors.textPrimary }]}>
          Account
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Profile Card ── */}
        {user ? (
          <>
            <View
              style={[
                S.card,
                {
                  backgroundColor: colors.bgSurfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={S.profileHeader}>
                <View style={[S.avatar, { backgroundColor: colors.primary }]}>
                  <User size={32} color={colors.onPrimary} strokeWidth={2} />
                </View>
                <View style={S.profileInfo}>
                  {displayName && (
                    <Text
                      style={[S.displayName, { color: colors.textPrimary }]}
                    >
                      {displayName}
                    </Text>
                  )}
                  <Text
                    style={[
                      S.email,
                      {
                        color: displayName
                          ? colors.textSecondary
                          : colors.textPrimary,
                      },
                    ]}
                  >
                    {user.email}
                  </Text>
                  <Text style={[S.status, { color: colors.textSecondary }]}>
                    Sync enabled
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats summary */}
            <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>
              YOUR STATS
            </Text>
            <View style={S.statsRow}>
              {[
                { val: stats.totalCompleted.toString(), label: "Solved" },
                { val: stats.currentStreak.toString(), label: "Day Streak" },
                { val: stats.bestStreak.toString(), label: "Best Streak" },
              ].map(({ val, label }) => (
                <View
                  key={label}
                  style={[
                    S.statCard,
                    {
                      backgroundColor: colors.bgSurfaceContainerLowest,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[S.statVal, { color: colors.textPrimary }]}>
                    {val}
                  </Text>
                  <Text style={[S.statLbl, { color: colors.textSecondary }]}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View
            style={[
              S.card,
              {
                backgroundColor: colors.bgSurfaceContainerLowest,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={S.profileHeader}>
              <View
                style={[S.avatar, { backgroundColor: colors.textSecondary }]}
              >
                <User size={32} color={colors.bgPage} strokeWidth={2} />
              </View>
              <View style={S.profileInfo}>
                <Text style={[S.email, { color: colors.textPrimary }]}>
                  Guest Mode
                </Text>
                <Text style={[S.status, { color: colors.textSecondary }]}>
                  Playing locally
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[S.signInBtn, { backgroundColor: colors.primary }]}
              onPress={() =>
                navigation.getParent()?.navigate("SignIn" as never)
              }
              accessibilityLabel="Sign in to sync your progress"
              accessibilityRole="button"
            >
              <Text style={[S.signInBtnText, { color: colors.onPrimary }]}>
                Sign In to Sync
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── ACTIONS ── */}
        {user && (
          <>
            <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>
              ACTIONS
            </Text>
            <View
              style={[
                S.card,
                {
                  backgroundColor: colors.bgSurfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <TouchableOpacity
                style={S.row}
                onPress={handleSignOut}
                accessibilityLabel="Sign out"
                accessibilityRole="button"
              >
                <LogOut
                  size={20}
                  color={colors.textPrimary}
                  strokeWidth={1.8}
                />
                <Text style={[S.rowText, { color: colors.textPrimary }]}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[S.sectionLbl, { color: colors.textSecondary }]}>
              DANGER ZONE
            </Text>
            <View
              style={[
                S.card,
                {
                  backgroundColor: colors.bgSurfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <TouchableOpacity
                style={S.row}
                onPress={handleDeleteAccount}
                accessibilityLabel="Delete account"
                accessibilityRole="button"
              >
                <Trash2 size={20} color={colors.error} strokeWidth={1.8} />
                <Text style={[S.rowText, { color: colors.error }]}>
                  Clear Cloud Data
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },

  sectionLbl: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 8,
  },

  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  email: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
  },

  signInBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "600",
  },
  displayName: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  statVal: { fontSize: 20, fontWeight: "700" },
  statLbl: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
