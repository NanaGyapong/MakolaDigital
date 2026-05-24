
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";
import { useAuthStore } from "../../lib/store";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const MENU = [
    { icon: "📦", label: "My listings", count: "34 active" },
    { icon: "🛒", label: "My orders", count: "12 total" },
    { icon: "❤️", label: "Saved listings", count: "28" },
    { icon: "⭐", label: "Reviews", count: "4.8 avg" },
    { icon: "💰", label: "Earnings", count: "GH₵ 24,800" },
    { icon: "✅", label: "KYC Verification", badge: user?.kycStatus === "verified" ? "Verified" : "Pending" },
    { icon: "🔔", label: "Notifications" },
    { icon: "🔒", label: "Security & password" },
    { icon: "🌍", label: "Language & region" },
    { icon: "💬", label: "Help & support" },
  ];

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Profile</Text>
          <TouchableOpacity style={s.settingsBtn}><Text style={{ fontSize: 18 }}>⚙️</Text></TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user?.fullName?.[0] || "U"}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.fullName || "Your Name"}</Text>
            <Text style={s.profileEmail}>{user?.email || "email@example.com"}</Text>
            <View style={s.kycBadge}>
              <Text style={s.kycText}>{user?.kycStatus === "verified" ? "✓ Verified seller" : "⏳ Verification pending"}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn}><Text style={{ fontSize: 16 }}>✏️</Text></TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[["34","Listings"],["89","Sales"],["4.8★","Rating"]].map(([v,l]) => (
            <View key={l} style={s.statItem}>
              <Text style={s.statVal}>{v}</Text>
              <Text style={s.statLbl}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={s.menuSection}>
          {MENU.map((item, i) => (
            <TouchableOpacity key={i} style={[s.menuItem, i < MENU.length-1 && s.menuItemBorder]} activeOpacity={0.7}>
              <View style={s.menuIcon}><Text style={{ fontSize: 18 }}>{item.icon}</Text></View>
              <Text style={s.menuLabel}>{item.label}</Text>
              {item.count && <Text style={s.menuCount}>{item.count}</Text>}
              {item.badge && (
                <View style={[s.menuBadge, item.badge === "Verified" && s.menuBadgeGreen]}>
                  <Text style={[s.menuBadgeText, item.badge === "Verified" && { color: colors.green }]}>{item.badge}</Text>
                </View>
              )}
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={s.logoutText}>Log out</Text>
        </TouchableOpacity>
        <Text style={s.version}>Makola Digital v1.0.0 · Made in 🇬🇭</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { fontSize: 22, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  settingsBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, marginHorizontal: spacing.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24, fontWeight: "900", color: "#fff" },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16, fontWeight: "800", color: colors.text },
  profileEmail: { fontSize: 12, color: colors.textMuted, fontFamily: "monospace" },
  kycBadge: { backgroundColor: "rgba(45,158,107,0.12)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginTop: 2 },
  kycText: { fontSize: 11, fontWeight: "700", color: colors.green },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", marginHorizontal: spacing.xl, marginBottom: 20, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 14 },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 14 },
  statVal: { fontSize: 18, fontWeight: "900", color: colors.red },
  statLbl: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: "600" },
  menuSection: { marginHorizontal: spacing.xl, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 16, marginBottom: 16, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 16, paddingVertical: 15 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  menuIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  menuCount: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  menuBadge: { backgroundColor: "rgba(196,127,23,0.15)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  menuBadgeGreen: { backgroundColor: "rgba(45,158,107,0.15)" },
  menuBadgeText: { fontSize: 10, fontWeight: "700", color: colors.gold },
  menuArrow: { fontSize: 18, color: colors.textDim, marginLeft: 4 },
  logoutBtn: { marginHorizontal: spacing.xl, marginBottom: 12, backgroundColor: "rgba(232,83,58,0.1)", borderWidth: 1, borderColor: "rgba(232,83,58,0.25)", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  logoutText: { color: colors.red, fontSize: 15, fontWeight: "800" },
  version: { textAlign: "center", fontSize: 11, color: colors.textDim, marginBottom: 32, fontWeight: "600" },
});
