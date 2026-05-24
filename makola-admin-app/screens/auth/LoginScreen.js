
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { colors, spacing } from "../../lib/theme";
import { adminAPI } from "../../lib/api";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const { data } = await adminAPI.login(email.trim().toLowerCase(), password);
      if (!["admin","super_admin"].includes(data.user?.role)) {
        Alert.alert("Access denied", "This app is for Makola admins only.");
        return;
      }
      await SecureStore.setItemAsync("admin_token", data.accessToken);
      await SecureStore.setItemAsync("admin_user", JSON.stringify(data.user));
      onLogin();
    } catch (err) {
      Alert.alert("Login failed", err.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex:1 }}>
        <View style={s.wrap}>
          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoIcon}><Text style={{ fontSize:28 }}>🌍</Text></View>
            <Text style={s.logoText}>Makola<Text style={{ color:colors.red }}>Admin</Text></Text>
            <Text style={s.logoBadge}>🔐 Internal dashboard</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Sign in</Text>
            <Text style={s.cardSub}>Admin access only</Text>

            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} placeholder="admin@makoladigital.com"
              placeholderTextColor={colors.dim} keyboardType="email-address"
              autoCapitalize="none" value={email} onChangeText={setEmail} />

            <Text style={s.label}>Password</Text>
            <View style={s.pwWrap}>
              <TextInput style={[s.input, { flex:1, marginBottom:0 }]}
                placeholder="••••••••" placeholderTextColor={colors.dim}
                secureTextEntry={!showPw} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPw(p => !p)} style={s.eyeBtn}>
                <Text style={{ fontSize:18 }}>{showPw ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[s.btn, loading && { opacity:0.6 }]}
              onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Sign in to dashboard →</Text>}
            </TouchableOpacity>
          </View>

          <Text style={s.footer}>
            🔒 Secure · For authorised Makola Digital staff only
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:colors.bg },
  wrap: { flex:1, padding:spacing.xl, justifyContent:"center" },
  logoWrap: { alignItems:"center", marginBottom:40 },
  logoIcon: { width:72, height:72, borderRadius:20,
    backgroundColor:colors.red, alignItems:"center", justifyContent:"center",
    marginBottom:14, shadowColor:colors.red, shadowOpacity:0.5, shadowRadius:20, elevation:10 },
  logoText: { fontSize:26, fontWeight:"900", color:colors.text, letterSpacing:-0.8 },
  logoBadge: { fontSize:12, color:colors.muted, marginTop:6, fontWeight:"600" },
  card: { backgroundColor:colors.card, borderWidth:1, borderColor:colors.border,
    borderRadius:18, padding:spacing.xl },
  cardTitle: { fontSize:20, fontWeight:"900", color:colors.text,
    letterSpacing:-0.5, marginBottom:4 },
  cardSub: { fontSize:13, color:colors.muted, marginBottom:24 },
  label: { fontSize:11, fontWeight:"700", color:colors.muted,
    textTransform:"uppercase", letterSpacing:0.6, marginBottom:7 },
  input: { backgroundColor:"rgba(255,255,255,0.05)",
    borderWidth:1, borderColor:colors.border,
    borderRadius:12, padding:13, color:colors.text, fontSize:14, marginBottom:16 },
  pwWrap: { flexDirection:"row", alignItems:"center", gap:8, marginBottom:24 },
  eyeBtn: { padding:8 },
  btn: { backgroundColor:colors.red, borderRadius:13, paddingVertical:15,
    alignItems:"center", shadowColor:colors.red, shadowOpacity:0.4,
    shadowRadius:16, elevation:8 },
  btnText: { color:"#fff", fontSize:15, fontWeight:"900" },
  footer: { textAlign:"center", fontSize:12, color:colors.dim, marginTop:28 },
});
