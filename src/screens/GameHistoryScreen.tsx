// ─── Game History Screen (Mobile) ────────────────────────────────────────────────────
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useStore } from "../store/useStore";
import { GameRecord } from "../types";
import { formatTime } from "../utils/time";

const DIFF_CFG: Record<
  string,
  { barColor: string; iconBg: string; iconColor: string }
> = {
  beginner: { barColor: "#1a7a40", iconBg: "#d4f0e0", iconColor: "#1a7a40" },
  skill: { barColor: "#3650d4", iconBg: "#e8edfb", iconColor: "#3650d4" },
  hard: { barColor: "#a04f00", iconBg: "#fde8cc", iconColor: "#a04f00" },
  advanced: { barColor: "#c0180f", iconBg: "#fde4e2", iconColor: "#c0180f" },
  expert: { barColor: "#c0180f", iconBg: "#fde4e2", iconColor: "#c0180f" },
  master: { barColor: "#6b30d4", iconBg: "#ede6fc", iconColor: "#6b30d4" },
};

const calcPoints = (game: GameRecord) => {
  if (!game.won) return 0;
  const mult =
    { beginner: 1, skill: 2, hard: 3, advanced: 4, expert: 5, master: 6 }[
      game.difficulty
    ] ?? 1;
  return (100 + (game.mistakes === 0 ? 50 : 0)) * mult;
};

export const GameHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const stats = useStore((s) => s.stats);
  const [filter, setFilter] = useState<"all" | "won" | "lost">("all");

  const filteredGames = stats.recentGames.filter((game) => {
    if (filter === "won") return game.won;
    if (filter === "lost") return !game.won;
    return true;
  });

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
          onPress={() => navigation.goBack()}
          style={S.headerBtn}
        >
          <ChevronLeft size={28} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[S.headerTitle, { color: colors.textPrimary }]}>
          Game History
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* ── Filter tabs ── */}
      <View style={S.filterTabs}>
        {(["all", "won", "lost"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              S.filterTab,
              { borderColor: colors.outlineVariant, backgroundColor: "transparent" },
              filter === f && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
            accessibilityLabel={`Show ${f} games`}
            accessibilityRole="button"
          >
            <Text
              style={[
                S.filterText,
                {
                  color: filter === f ? colors.onPrimary : colors.textSecondary,
                },
              ]}
            >
              {cap(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Game list ─── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {filteredGames.length === 0 ? (
          <View style={S.emptyContainer}>
            <Text style={[S.emptyText, { color: colors.textSecondary }]}>
              No games found
            </Text>
          </View>
        ) : (
          filteredGames.map((game, idx) => {
            const pts = calcPoints(game);
            const cfg = DIFF_CFG[game.difficulty] ?? DIFF_CFG.beginner;
            const ptsColor = game.won ? "#1a7a40" : "#c0180f";
            const date = new Date(game.date).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const time = game.won ? formatTime(game.durationSeconds) : "Failed";

            return (
              <View
                key={idx}
                style={[
                  S.gameCard,
                  {
                    backgroundColor: colors.bgSurfaceContainerLowest,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <View style={[S.gameIcon, { backgroundColor: cfg.iconBg }]}>
                  <Text
                    style={{
                      color: cfg.iconColor,
                      fontSize: 16,
                      fontWeight: "800",
                    }}
                  >
                    {game.won ? "✓" : "✗"}
                  </Text>
                </View>
                <View style={S.gameInfo}>
                  <Text style={[S.gameDiff, { color: colors.textPrimary }]}>
                    {cap(game.difficulty)}
                  </Text>
                  <Text style={[S.gameDate, { color: colors.textSecondary }]}>
                    {date} • {time}
                  </Text>
                  <Text
                    style={[S.gameMistakes, { color: colors.textSecondary }]}
                  >
                    {game.mistakes} mistake{game.mistakes !== 1 ? "s" : ""}
                  </Text>
                </View>
                <Text style={[S.gamePts, { color: ptsColor }]}>
                  {pts > 0 ? `+${pts}` : "0"}
                </Text>
              </View>
            );
          })
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

  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 14, fontWeight: "600" },

  emptyContainer: {
    padding: 48,
    alignItems: "center",
  },
  emptyText: { fontSize: 16 },

  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  gameIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  gameInfo: { flex: 1 },
  gameDiff: { fontSize: 15, fontWeight: "700" },
  gameDate: { fontSize: 12, marginTop: 2 },
  gameMistakes: { fontSize: 11, marginTop: 2 },
  gamePts: { fontSize: 15, fontWeight: "800" },
});
