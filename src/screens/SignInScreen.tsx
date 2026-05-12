// ─── Sign In Screen (Mobile) ────────────────────────────────────────────────────
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
  Linking,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { Spacing, BorderRadius } from "../theme/spacing";

export default function SignInScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      navigation.navigate("MainTabs" as never);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert("Coming Soon", "Google sign-in will be available in a future update.");
  };

  const handleGuest = () => {
    navigation.navigate("MainTabs" as never);
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
          <Text style={[S.title, { color: colors.textPrimary }]}>Sudoku</Text>
          <Text style={[S.subtitle, { color: colors.textSecondary }]}>
            Sign in to sync across devices
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
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCorrect={false}
              editable={!loading}
            />

            {/* ── Primary: Sign In ── */}
            <TouchableOpacity
              style={[
                S.primaryBtn,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.55 },
              ]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {loading ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={[S.primaryLabel, { color: colors.onPrimary }]}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* ── Google ── */}
            <TouchableOpacity
              style={[
                S.googleBtn,
                {
                  borderColor: colors.outlineVariant,
                  backgroundColor: colors.bgSurface,
                },
                googleLoading && { opacity: 0.55 },
              ]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading || loading}
              activeOpacity={0.86}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <View style={[S.googleMark, { borderColor: colors.outlineVariant }]}>
                <Text style={S.googleMarkText}>G</Text>
              </View>
              <Text style={[S.googleLabel, { color: colors.textPrimary }]}>
                Continue with Google
              </Text>
              {googleLoading && (
                <ActivityIndicator color={colors.textPrimary} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

            {/* ── Guest ── */}
            <TouchableOpacity
              style={S.guestBtn}
              onPress={handleGuest}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Play as guest"
            >
              <Text style={[S.guestLabel, { color: colors.textSecondary }]}>
                Play as Guest
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer link ── */}
          <View style={S.footer}>
            <Text style={[S.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("SignUp" as never)}
              accessibilityRole="link"
              accessibilityLabel="Go to sign up"
            >
              <Text style={[S.footerLink, { color: colors.primary }]}>
                Sign Up
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

  // ── Google button ──
  googleBtn: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  googleMarkText: { fontSize: 14, fontWeight: "700", color: "#000000" },
  googleLabel: { fontSize: 15, fontWeight: "700" },

  // ── Guest button ──
  guestBtn: {
    minHeight: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  guestLabel: { fontSize: 15, fontWeight: "700" },

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
