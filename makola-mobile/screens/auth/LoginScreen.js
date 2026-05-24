
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing } from "../../lib/theme";
import { authService } from "../../lib/auth";
import { useAuthStore } from "../../lib/store";

export default function LoginScreen({ navigation }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert("Error", "Please fill in all fields"); return; }
    setLoading(true);
    try {
      const user = await authService.login(email.trim().toLowerCase(), password);
      setUser(user);
    } catch (err) {
      Alert.alert("Login failed", err.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <View style={s.logoRow}>
          <View style={s.logoIcon}><Text style={{ fontSize: 18 }}>🌍</Text></View>
        </View>
        <Text style={[typography.h1, s.title]}>Welcome back 👋</Text>
        <Text style={[typography.body, { color: colors.textMuted, marginBottom: 28 }]}>
          Sign in to your Makola account
        </Text>

        {/* Google */}
        <TouchableOpacity style={s.googleBtn} activeOpacity={0.8}>
          <Text style={{ fontSize: 16 }}>🇬</Text>
          <Text style={s.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={s.divider}><View style={s.divLine} /><Text style={s.divText}>or with email</Text><View style={s.divLine} /></View>

        {/* Fields */}
        <Text style={s.label}>Email</Text>
        <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={colors.textDim}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email"
          value={email} onChangeText={setEmail} />

        <Text style={s.label}>Password</Text>
        <View style={s.pwWrap}>
          <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} placeholder="Your password"
            placeholderTextColor={colors.textDim} secureTextEntry={!showPw}
            value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setShowPw(p => !p)} style={s.eyeBtn}>
            <Text style={{ fontSize: 18 }}>{showPw ? "🙈" : "👁"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={{ alignSelf: "flex-end", marginBottom: 20 }}>
          <Text style={{ color: colors.red, fontSize: 13, fontWeight: "700" }}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Sign in →</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 20 }}>
          <Text style={s.bottomLink}>No account? <Text style={{ color: colors.red, fontWeight: "700" }}>Create one free</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl },
  back: { marginBottom: spacing.lg },
  logoRow: { marginBottom: spacing.lg },
  logoIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  title: { marginBottom: 8 },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 13, marginBottom: 20 },
  googleText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: colors.border },
  divText: { color: colors.textDim, fontSize: 12, fontWeight: "600" },
  label: { fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 7 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, color: colors.text, fontSize: 14, marginBottom: 14 },
  pwWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  eyeBtn: { padding: 8 },
  submitBtn: { backgroundColor: colors.red, borderRadius: 14, paddingVertical: 15, alignItems: "center", shadowColor: colors.red, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  bottomLink: { color: colors.textMuted, textAlign: "center", fontSize: 13 },
});
