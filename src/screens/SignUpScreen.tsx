// ─── Sign Up Screen (Mobile) ────────────────────────────────────────────────────
// Mirrors desktop auth design — premium minimal, Nothing-inspired
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { Spacing, BorderRadius } from "../theme/spacing";

export default function SignUpScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      // Account created — navigate to main app
      navigation.navigate("MainTabs" as never);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[S.shell, { backgroundColor: colors.bgPage }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          S.shellInner,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            S.card,
            {
              backgroundColor: colors.bgSurface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {/* ── Title ── */}
          <Text style={[S.title, { color: colors.textPrimary }]}>
            Create Account
          </Text>
          <Text style={[S.subtitle, { color: colors.textSecondary }]}>
            Sync your progress across devices
          </Text>

          {/* ── Error ── */}
          {error ? (
            <View style={[S.errorBanner, { backgroundColor: colors.errorContainer, borderColor: colors.error }]}>
              <Text style={[S.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {/* ── Form ── */}
          <View style={S.form}>
            <TextInput
              style={[
                S.input,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.outlineVariant,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Display Name"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={[
                S.input,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.outlineVariant,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              editable={!loading}
            />

            <TextInput
              style={[
                S.input,
                {
                  backgroundColor: colors.bgSurface,
                  borderColor: colors.outlineVariant,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCorrect={false}
              editable={!loading}
            />

            {/* ── Primary: Create Account ── */}
            <TouchableOpacity
              style={[
                S.primaryBtn,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.55 },
              ]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={[S.primaryLabel, { color: colors.onPrimary }]}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Footer link ── */}
          <View style={S.footer}>
            <Text style={[S.footerText, { color: colors.textSecondary }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignIn" as never)}
              accessibilityRole="link"
              accessibilityLabel="Go to sign in"
            >
              <Text style={[S.footerLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  shell: { flex: 1 },
  shellInner: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.pageX,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 36,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },

  // ── Title ──
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    fontWeight: "500",
  },

  // ── Error ──
  errorBanner: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: "600" },

  // ── Form ──
  form: { gap: 12 },

  // ── Input ──
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  // ── Primary button ──
  primaryBtn: {
    minHeight: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: { fontSize: 15, fontWeight: "700" },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "700" },
});
