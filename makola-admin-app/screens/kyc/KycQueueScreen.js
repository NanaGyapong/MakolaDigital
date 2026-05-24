
import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

const MOCK_KYC = [
  { id:"1", name:"Ama Asante", email:"ama@gmail.com", type:"seller", submitted:"10 min ago", docs:["ID","Selfie","Utility"], urgency:"high" },
  { id:"2", name:"Kwame Boateng", email:"kwame@outlook.com", type:"seller", submitted:"1 hr ago", docs:["ID","Selfie"], urgency:"medium" },
  { id:"3", name:"Fatima Dankwa", email:"fatima@yahoo.com", type:"seller", submitted:"2 hrs ago", docs:["ID","Selfie","Business"], urgency:"medium" },
  { id:"4", name:"David Koomson", email:"david@gmail.com", type:"seller", submitted:"3 hrs ago", docs:["ID","Selfie"], urgency:"low" },
  { id:"5", name:"Nadia Hayford", email:"nadia@gmail.com", type:"seller", submitted:"5 hrs ago", docs:["ID","Selfie","Utility"], urgency:"low" },
  { id:"6", name:"Samuel Osei", email:"sam@hotmail.com", type:"seller", submitted:"8 hrs ago", docs:["ID"], urgency:"low" },
  { id:"7", name:"Abena Mensah", email:"abena@gmail.com", type:"seller", submitted:"12 hrs ago", docs:["ID","Selfie"], urgency:"low" },
];

export default function KycQueueScreen({ navigation }) {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filtered = MOCK_KYC.filter(k =>
    search === "" ||
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.email.toLowerCase().includes(search.toLowerCase())
  );

  const urgColor = u => ({ high:colors.red, medium:colors.gold, low:colors.green }[u] || colors.muted);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>KYC Queue</Text>
        <View style={s.countBadge}>
          <Text style={{ color:colors.gold, fontSize:12, fontWeight:"900" }}>
            {MOCK_KYC.length} pending
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {["pending","approved","rejected"].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabActive]}
            onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabText, tab===t && s.tabTextActive]}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t === "pending" ? ` (${MOCK_KYC.length})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={{ fontSize:15 }}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search by name or email..."
          placeholderTextColor={colors.dim} value={search} onChangeText={setSearch} />
      </View>

      {/* List */}
      <FlatList
        data={tab === "pending" ? filtered : []}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />}
        ItemSeparatorComponent={() => <View style={{ height:1, backgroundColor:"rgba(255,255,255,0.04)" }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.kycItem}
            onPress={() => navigation.navigate("KycDetail", { kyc: item })}
            activeOpacity={0.85}>
            {/* Avatar */}
            <View style={[s.avatar, { backgroundColor:urgColor(item.urgency)+"22", borderColor:urgColor(item.urgency)+"44" }]}>
              <Text style={{ fontSize:18, fontWeight:"900", color:urgColor(item.urgency) }}>
                {item.name[0]}
              </Text>
            </View>
            {/* Info */}
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
                <Text style={s.kycName}>{item.name}</Text>
                <View style={[s.urgBadge, { backgroundColor:urgColor(item.urgency)+"18",
                  borderColor:urgColor(item.urgency)+"44" }]}>
                  <Text style={{ color:urgColor(item.urgency), fontSize:9, fontWeight:"800" }}>
                    {item.urgency.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={s.kycEmail}>{item.email}</Text>
              <View style={s.docsRow}>
                {item.docs.map(d => (
                  <View key={d} style={s.docChip}>
                    <Text style={{ color:colors.blue, fontSize:10, fontWeight:"700" }}>{d}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.kycTime}>Submitted {item.submitted}</Text>
            </View>
            <Text style={{ color:colors.dim, fontSize:20 }}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding:48, alignItems:"center" }}>
            <Text style={{ fontSize:32 }}>✅</Text>
            <Text style={{ color:colors.muted, marginTop:12, fontSize:14, fontWeight:"600" }}>
              {tab === "pending" ? "Queue is empty" : `No ${tab} applications`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:colors.bg },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing.xl, paddingVertical:spacing.lg },
  title: { fontSize:20, fontWeight:"900", color:colors.text, letterSpacing:-0.5 },
  countBadge: { backgroundColor:"rgba(196,127,23,0.12)", borderWidth:1,
    borderColor:"rgba(196,127,23,0.3)", borderRadius:10, paddingHorizontal:10, paddingVertical:4 },
  tabsRow: { flexDirection:"row", gap:8, paddingHorizontal:spacing.xl, marginBottom:spacing.md },
  tab: { paddingHorizontal:16, paddingVertical:8, borderRadius:20,
    backgroundColor:"rgba(255,255,255,0.05)", borderWidth:1, borderColor:colors.border },
  tabActive: { backgroundColor:"rgba(232,83,58,0.1)", borderColor:"rgba(232,83,58,0.3)" },
  tabText: { fontSize:13, fontWeight:"600", color:colors.muted },
  tabTextActive: { color:colors.red, fontWeight:"800" },
  searchBar: { flexDirection:"row", alignItems:"center", gap:10, marginHorizontal:spacing.xl,
    marginBottom:spacing.md, backgroundColor:"rgba(255,255,255,0.05)",
    borderWidth:1, borderColor:colors.border, borderRadius:12, paddingHorizontal:14, height:42 },
  searchInput: { flex:1, color:colors.text, fontSize:14 },
  kycItem: { flexDirection:"row", alignItems:"center", gap:13,
    paddingHorizontal:spacing.xl, paddingVertical:14 },
  avatar: { width:48, height:48, borderRadius:14, borderWidth:1.5,
    alignItems:"center", justifyContent:"center", flexShrink:0 },
  kycName: { fontSize:14, fontWeight:"800", color:colors.text },
  kycEmail: { fontSize:12, color:colors.muted, marginTop:2 },
  docsRow: { flexDirection:"row", gap:5, marginTop:5 },
  docChip: { backgroundColor:"rgba(59,125,216,0.1)", borderRadius:5,
    paddingHorizontal:7, paddingVertical:2, borderWidth:1, borderColor:"rgba(59,125,216,0.25)" },
  kycTime: { fontSize:11, color:colors.dim, marginTop:4, fontWeight:"600" },
  urgBadge: { borderRadius:5, paddingHorizontal:6, paddingVertical:2, borderWidth:1 },
});
