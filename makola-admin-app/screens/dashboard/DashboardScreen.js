
import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { colors, spacing } from "../../lib/theme";
import { adminAPI } from "../../lib/api";

const { width } = Dimensions.get("window");

const MOCK_STATS = {
  revenue: { today: 42800, month: 824000, change: 18.2 },
  orders: { today: 142, month: 3240, change: 22.1 },
  newUsers: { today: 89, month: 1840, change: 31.4 },
  kycPending: 7, flaggedListings: 12, openDisputes: 3, activeListings: 180420,
};

const MOCK_RECENT = [
  { id:"1", type:"kyc",     msg:"Ama Asante submitted KYC",         time:"2m ago",  urgent:true  },
  { id:"2", type:"flag",    msg:"Listing #48921 flagged for review", time:"14m ago", urgent:true  },
  { id:"3", type:"dispute", msg:"Dispute opened — order #MKL-9482",  time:"38m ago", urgent:true  },
  { id:"4", type:"seller",  msg:"New Pro seller: TechWave KSI",      time:"1hr ago", urgent:false },
  { id:"5", type:"payment", msg:"Large transaction: GH₵ 42,000",     time:"2hr ago", urgent:false },
  { id:"6", type:"kyc",     msg:"Kofi Mensah KYC approved",          time:"3hr ago", urgent:false },
  { id:"7", type:"flag",    msg:"Listing #48800 — counterfeit report","time":"4hr ago",urgent:false},
];

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(MOCK_STATS);
  const [admin, setAdmin] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("admin_user")
      .then(u => u && setAdmin(JSON.parse(u)));
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const typeIcon = (t) => ({ kyc:"✅", flag:"⚠️", dispute:"⚖️", seller:"👤", payment:"💰" }[t] || "🔔");
  const typeColor = (t) => ({ kyc:colors.green, flag:colors.gold, dispute:colors.red, seller:colors.blue, payment:colors.purple }[t] || colors.muted);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Admin Dashboard 🛡️</Text>
            <Text style={s.sub}>{admin?.fullName || "Makola Admin"} · {admin?.role || "admin"}</Text>
          </View>
          <View style={s.alertBadge}>
            <Text style={{ color:colors.red, fontSize:11, fontWeight:"900" }}>
              {stats.kycPending + stats.flaggedListings + stats.openDisputes} alerts
            </Text>
          </View>
        </View>

        {/* Revenue banner */}
        <View style={s.revBanner}>
          <View>
            <Text style={s.revLabel}>Platform revenue · Today</Text>
            <Text style={s.revVal}>GH₵ {stats.revenue.today.toLocaleString()}</Text>
            <Text style={s.revMonth}>GH₵ {stats.revenue.month.toLocaleString()} this month</Text>
          </View>
          <View style={s.revChg}>
            <Text style={{ color:colors.green, fontSize:18, fontWeight:"900" }}>
              ↑ {stats.revenue.change}%
            </Text>
            <Text style={{ color:colors.muted, fontSize:11, marginTop:2 }}>vs last month</Text>
          </View>
        </View>

        {/* Quick action alerts */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Action required</Text>
        </View>
        <View style={s.alertRow}>
          {[
            { label:"KYC pending", val:stats.kycPending, color:colors.gold, screen:"KYC", emoji:"✅" },
            { label:"Flagged", val:stats.flaggedListings, color:colors.red, screen:"Listings", emoji:"⚠️" },
            { label:"Disputes", val:stats.openDisputes, color:colors.red, screen:"Disputes", emoji:"⚖️" },
          ].map(a => (
            <TouchableOpacity key={a.label} style={[s.alertCard, { borderColor:a.color+"44" }]}
              onPress={() => navigation.navigate(a.screen)} activeOpacity={0.8}>
              <Text style={{ fontSize:24, marginBottom:6 }}>{a.emoji}</Text>
              <Text style={[s.alertVal, { color:a.color }]}>{a.val}</Text>
              <Text style={s.alertLbl}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI grid */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Platform overview</Text>
        </View>
        <View style={s.kpiGrid}>
          {[
            { label:"Today's orders", val:stats.orders.today, chg:stats.orders.change, color:colors.green },
            { label:"New users", val:stats.newUsers.today, chg:stats.newUsers.change, color:colors.blue },
            { label:"Active listings", val:"180k+", color:colors.purple, chg:null },
            { label:"Pro sellers", val:"2,840", color:colors.gold, chg:null },
          ].map(k => (
            <View key={k.label} style={s.kpiCard}>
              <Text style={s.kpiLabel}>{k.label}</Text>
              <Text style={[s.kpiVal, { color:k.color }]}>{typeof k.val === "number" ? k.val.toLocaleString() : k.val}</Text>
              {k.chg && <Text style={{ color:colors.green, fontSize:11, fontWeight:"700", marginTop:3 }}>↑ {k.chg}%</Text>}
            </View>
          ))}
        </View>

        {/* Recent activity */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Recent activity</Text>
        </View>
        <View style={s.activityList}>
          {MOCK_RECENT.map(item => (
            <TouchableOpacity key={item.id} style={[s.activityItem, item.urgent && s.activityUrgent]}
              activeOpacity={0.8}>
              <View style={[s.actIcon, { backgroundColor:typeColor(item.type)+"18" }]}>
                <Text style={{ fontSize:16 }}>{typeIcon(item.type)}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={s.actMsg}>{item.msg}</Text>
                <Text style={s.actTime}>{item.time}</Text>
              </View>
              {item.urgent && (
                <View style={s.urgentDot} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height:24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:colors.bg },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing.xl, paddingVertical:spacing.lg },
  greeting: { fontSize:20, fontWeight:"900", color:colors.text, letterSpacing:-0.5 },
  sub: { fontSize:12, color:colors.muted, marginTop:2 },
  alertBadge: { backgroundColor:"rgba(232,83,58,0.12)", borderWidth:1,
    borderColor:"rgba(232,83,58,0.3)", borderRadius:10, paddingHorizontal:10, paddingVertical:5 },
  revBanner: { marginHorizontal:spacing.xl, marginBottom:spacing.lg,
    backgroundColor:"rgba(232,83,58,0.07)", borderWidth:1,
    borderColor:"rgba(232,83,58,0.2)", borderRadius:16, padding:18,
    flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  revLabel: { fontSize:11, fontWeight:"700", color:colors.muted, textTransform:"uppercase",
    letterSpacing:0.5, marginBottom:6 },
  revVal: { fontSize:28, fontWeight:"900", color:colors.red, letterSpacing:-0.5 },
  revMonth: { fontSize:12, color:colors.muted, marginTop:3 },
  revChg: { alignItems:"center" },
  sectionHdr: { paddingHorizontal:spacing.xl, marginBottom:10, marginTop:4 },
  sectionTitle: { fontSize:14, fontWeight:"800", color:colors.text, letterSpacing:-0.2 },
  alertRow: { flexDirection:"row", gap:10, paddingHorizontal:spacing.xl, marginBottom:spacing.lg },
  alertCard: { flex:1, backgroundColor:colors.card, borderWidth:1.5, borderRadius:14,
    padding:14, alignItems:"center" },
  alertVal: { fontSize:26, fontWeight:"900", letterSpacing:-0.5 },
  alertLbl: { fontSize:10, color:colors.muted, fontWeight:"700", marginTop:3,
    textAlign:"center", textTransform:"uppercase", letterSpacing:0.4 },
  kpiGrid: { flexDirection:"row", flexWrap:"wrap", gap:10, paddingHorizontal:spacing.xl,
    marginBottom:spacing.lg },
  kpiCard: { width:(width - spacing.xl*2 - 10)/2, backgroundColor:colors.card,
    borderWidth:1, borderColor:colors.border, borderRadius:13, padding:14 },
  kpiLabel: { fontSize:11, fontWeight:"700", color:colors.muted,
    textTransform:"uppercase", letterSpacing:0.5, marginBottom:7 },
  kpiVal: { fontSize:22, fontWeight:"900", letterSpacing:-0.5 },
  activityList: { paddingHorizontal:spacing.xl },
  activityItem: { flexDirection:"row", alignItems:"center", gap:12,
    paddingVertical:12, borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.05)" },
  activityUrgent: { backgroundColor:"rgba(232,83,58,0.03)" },
  actIcon: { width:38, height:38, borderRadius:11, alignItems:"center", justifyContent:"center", flexShrink:0 },
  actMsg: { fontSize:13, fontWeight:"600", color:colors.text, lineHeight:18 },
  actTime: { fontSize:11, color:colors.dim, marginTop:2 },
  urgentDot: { width:8, height:8, borderRadius:4, backgroundColor:colors.red, flexShrink:0 },
});
