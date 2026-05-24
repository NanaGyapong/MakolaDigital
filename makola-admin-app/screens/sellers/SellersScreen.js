
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

const MOCK_SELLERS = [
  { id:"1", name:"TechHub GH", email:"tech@hub.com", plan:"pro", verified:true, listings:34, revenue:"GH₵ 248k", status:"active", joined:"Jan 2024" },
  { id:"2", name:"Ama Couture", email:"ama@couture.com", plan:"starter", verified:true, listings:18, revenue:"GH₵ 42k", status:"active", joined:"Mar 2024" },
  { id:"3", name:"QuickSell GH", email:"quick@sell.com", plan:"free", verified:false, listings:5, revenue:"GH₵ 8k", status:"suspended", joined:"Apr 2024" },
  { id:"4", name:"AutoLink GH", email:"auto@link.com", plan:"pro", verified:true, listings:22, revenue:"GH₵ 185k", status:"active", joined:"Dec 2023" },
  { id:"5", name:"CodeAfrica Studio", email:"code@africa.com", plan:"starter", verified:true, listings:12, revenue:"GH₵ 28k", status:"active", joined:"Feb 2024" },
  { id:"6", name:"PrimeSpace GH", email:"prime@space.com", plan:"pro", verified:true, listings:8, revenue:"GH₵ 64k", status:"active", joined:"Nov 2023" },
];

const planColor = p => ({ free:colors.muted, starter:colors.blue, pro:colors.red, enterprise:colors.purple }[p] || colors.muted);

export default function SellersScreen() {
  const [search, setSearch] = useState("");
  const [sellers, setSellers] = useState(MOCK_SELLERS);

  const handleSuspend = (seller) => {
    Alert.alert(
      seller.status === "active" ? "Suspend seller?" : "Restore seller?",
      `${seller.status === "active" ? "Suspend" : "Restore"} ${seller.name}?`,
      [
        { text:"Cancel", style:"cancel" },
        { text:"Confirm", style:"destructive",
          onPress: () => setSellers(p => p.map(s =>
            s.id === seller.id
              ? { ...s, status:s.status==="active"?"suspended":"active" }
              : s
          ))
        },
      ]
    );
  };

  const filtered = sellers.filter(s =>
    search === "" ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Sellers</Text>
        <Text style={{ color:colors.muted, fontSize:12, fontWeight:"600" }}>
          {sellers.filter(s => s.status==="active").length} active
        </Text>
      </View>

      <View style={s.searchBar}>
        <Text style={{ fontSize:15 }}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search sellers..."
          placeholderTextColor={colors.dim} value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        ItemSeparatorComponent={() => <View style={{ height:1, backgroundColor:"rgba(255,255,255,0.04)" }} />}
        renderItem={({ item }) => (
          <View style={s.sellerItem}>
            <View style={[s.avatar, { backgroundColor:planColor(item.plan)+"18" }]}>
              <Text style={{ fontSize:16, fontWeight:"900", color:planColor(item.plan) }}>
                {item.name[0]}
              </Text>
            </View>
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:"row", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                <Text style={s.sellerName}>{item.name}</Text>
                {item.verified && <Text style={{ fontSize:12 }}>✅</Text>}
                {item.status === "suspended" && (
                  <View style={s.suspBadge}><Text style={{ color:colors.red, fontSize:9, fontWeight:"800" }}>SUSPENDED</Text></View>
                )}
              </View>
              <Text style={s.sellerEmail}>{item.email}</Text>
              <View style={s.sellerStats}>
                <Text style={s.statItem}>📦 {item.listings}</Text>
                <Text style={s.statItem}>💰 {item.revenue}</Text>
                <View style={[s.planBadge, { backgroundColor:planColor(item.plan)+"18",
                  borderColor:planColor(item.plan)+"44" }]}>
                  <Text style={{ color:planColor(item.plan), fontSize:9, fontWeight:"800" }}>
                    {item.plan.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[s.actionBtn, {
                backgroundColor: item.status==="active" ? "rgba(232,83,58,0.1)" : "rgba(45,158,107,0.1)",
                borderColor: item.status==="active" ? "rgba(232,83,58,0.3)" : "rgba(45,158,107,0.3)"
              }]}
              onPress={() => handleSuspend(item)} activeOpacity={0.8}>
              <Text style={{ color:item.status==="active"?colors.red:colors.green, fontSize:12, fontWeight:"800" }}>
                {item.status === "active" ? "Suspend" : "Restore"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex:1, backgroundColor:colors.bg },
  header: { flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    paddingHorizontal:spacing.xl, paddingVertical:spacing.lg },
  title: { fontSize:20, fontWeight:"900", color:colors.text, letterSpacing:-0.5 },
  searchBar: { flexDirection:"row", alignItems:"center", gap:10, marginHorizontal:spacing.xl,
    marginBottom:spacing.md, backgroundColor:"rgba(255,255,255,0.05)",
    borderWidth:1, borderColor:colors.border, borderRadius:12, paddingHorizontal:14, height:42 },
  searchInput: { flex:1, color:colors.text, fontSize:14 },
  sellerItem: { flexDirection:"row", alignItems:"center", gap:12,
    paddingHorizontal:spacing.xl, paddingVertical:13 },
  avatar: { width:44, height:44, borderRadius:13, alignItems:"center",
    justifyContent:"center", flexShrink:0 },
  sellerName: { fontSize:13.5, fontWeight:"800", color:colors.text },
  sellerEmail: { fontSize:11.5, color:colors.muted, marginTop:1 },
  sellerStats: { flexDirection:"row", alignItems:"center", gap:10, marginTop:6 },
  statItem: { fontSize:11.5, color:colors.muted, fontWeight:"600" },
  planBadge: { borderRadius:5, paddingHorizontal:6, paddingVertical:2, borderWidth:1 },
  suspBadge: { backgroundColor:"rgba(232,83,58,0.12)", borderRadius:5,
    paddingHorizontal:6, paddingVertical:2, borderWidth:1, borderColor:"rgba(232,83,58,0.3)" },
  actionBtn: { borderWidth:1, borderRadius:9, paddingHorizontal:12, paddingVertical:7 },
});
