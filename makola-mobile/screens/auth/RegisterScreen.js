
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";
import { authService } from "../../lib/auth";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", phone:"", password:"", country:"Ghana", accountType:"buyer" });
  const [loading, setLoading] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const inp = { backgroundColor:"rgba(255,255,255,0.05)", borderWidth:1, borderColor:colors.border, borderRadius:12, padding:13, color:colors.text, fontSize:14, marginBottom:14 };
  const lbl = { fontSize:11, fontWeight:"700", color:colors.textMuted, textTransform:"uppercase", letterSpacing:0.6, marginBottom:7 };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await authService.register({ fullName: form.firstName+" "+form.lastName, email: form.email, phone: form.phone, password: form.password, country: form.country, accountType: form.accountType });
      navigation.navigate("VerifyEmail", { email: form.email });
    } catch(err) { Alert.alert("Error", err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:colors.bg }}>
      <ScrollView contentContainerStyle={{ padding:spacing.xl }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom:spacing.lg }}><Text style={{ color:colors.textMuted }}>← Back</Text></TouchableOpacity>
        <Text style={{ fontSize:26, fontWeight:"900", color:colors.text, marginBottom:8, letterSpacing:-0.6 }}>Create account</Text>
        <Text style={{ color:colors.textMuted, fontSize:14, marginBottom:28 }}>Join 22,000+ sellers on Makola</Text>
        <View style={{ flexDirection:"row", gap:10, marginBottom:20 }}>
          {[{t:"buyer",icon:"🛍️",label:"Buy"},{t:"seller",icon:"🏪",label:"Sell"}].map(({t,icon,label}) => (
            <TouchableOpacity key={t} onPress={()=>set("accountType")(t)} style={{ flex:1, backgroundColor:form.accountType===t?"rgba(232,83,58,0.08)":"rgba(255,255,255,0.04)", borderWidth:1.5, borderColor:form.accountType===t?colors.red:colors.border, borderRadius:12, padding:14, alignItems:"center" }}>
              <Text style={{ fontSize:26, marginBottom:6 }}>{icon}</Text>
              <Text style={{ fontSize:13, fontWeight:"800", color:form.accountType===t?colors.red:colors.text }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={lbl}>First name</Text><TextInput style={inp} placeholder="Kofi" placeholderTextColor={colors.textDim} value={form.firstName} onChangeText={set("firstName")} />
        <Text style={lbl}>Last name</Text><TextInput style={inp} placeholder="Mensah" placeholderTextColor={colors.textDim} value={form.lastName} onChangeText={set("lastName")} />
        <Text style={lbl}>Email</Text><TextInput style={inp} placeholder="you@example.com" placeholderTextColor={colors.textDim} keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set("email")} />
        <Text style={lbl}>Phone</Text><TextInput style={inp} placeholder="+233 24 000 0000" placeholderTextColor={colors.textDim} keyboardType="phone-pad" value={form.phone} onChangeText={set("phone")} />
        <Text style={lbl}>Password</Text><TextInput style={inp} placeholder="Min. 8 characters" placeholderTextColor={colors.textDim} secureTextEntry value={form.password} onChangeText={set("password")} />
        <TouchableOpacity onPress={handleRegister} disabled={loading} style={{ backgroundColor:colors.red, borderRadius:14, paddingVertical:15, alignItems:"center", marginTop:8, opacity:loading?0.6:1 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color:"#fff", fontSize:16, fontWeight:"900" }}>Create account →</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate("Login")} style={{ marginTop:18 }}><Text style={{ color:colors.textMuted, textAlign:"center", fontSize:13 }}>Already have an account? <Text style={{ color:colors.red, fontWeight:"700" }}>Sign in</Text></Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
