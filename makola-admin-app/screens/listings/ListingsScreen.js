
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

const MOCK_FLAGS = [
  { id:"1", title:"Rolex Replica Watch — Luxury Copy", seller:"QuickSell GH", reason:"Counterfeit goods", reports:4, type:"product", emoji:"⌚" },
  { id:"2", title:"Get rich quick — guaranteed returns", seller:"EasyMoney GH", reason:"Scam/misleading", reports:11, type:"service", emoji:"💰" },
  { id:"3", title:"iPhone 15 — URGENT SALE 50% off", seller:"Deals4You", reason:"Suspected fraud", reports:3, type:"product", emoji:"📱" },
  { id:"4", title:"Unlicensed pharmaceutical products", seller:"HealthShop GH", reason:"Prohibited item", reports:7, type:"product", emoji:"💊" },
  { id:"5", title:"Pirated software — Adobe All Apps", seller:"SoftwarePro", reason:"Piracy / IP violation", reports:5, type:"product", emoji:"💻" },
  { id:"6", title:"Hiring domestic workers overseas", seller:"JobsAbroad", reason:"Potential trafficking", reports:9, type:"job", emoji:"⚠️" },
  { id:"7", title:"iPhone 13 — Screen cracked (minor)", seller:"TechHub GH", reason:"Misdescription report", reports:1, type:"product", emoji:"📱" },
];

export default function ListingsScreen() {
  const [tab, setTab] = useState("flagged");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(MOCK_FLAGS);

  const filtered = items.filter(i =>
    tab === "flagged" &&
    (search === "" || i.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAction = (item, action) => {
    Alert.alert(
      action === "remove" ? "Remove listing?" : "Keep listing?",
      `${action === "remove" ? "Remove" : "Restore"} "${item.title.slice(0,40)}..."?`,
      [
        { text:"Cancel", style:"cancel" },
        { text:"Confirm", style:action==="remove"?"destructive":"default",
          onPress: () => setItems(p => p.filter(i => i.id !== item.id)) },
      ]
    );
  };

  const reportColor = r => r >= 8 ? colors.red : r >= 4 ? colors.gold : colors.muted;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Listings</Text>
        <View style={s.countBadge}>
          <Text style={{ color:colors.red, fontSize:12, fontWeight:"900" }}>
            {items.length} flagged
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {["flagged","pending","active"].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabActive]}
            onPress={() => setTab(t)} activeOpacity={0.8}>
            <Text style={[s.tabText, tab===t && s.tabTextActive]}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t==="flagged" ? ` (${items.length})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={{ fontSize:15 }}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search flagged listings..."
          placeholderTextColor={colors.dim} value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        ItemSeparatorComponent={() => <View style={{ height:1, backgroundColor:"rgba(255,255,255,0.04)" }} />}
        renderItem={({ item }) => (
          <View style={s.flagItem}>
            <View style={s.flagIcon}>
              <Text style={{ fontSize:22 }}>{item.emoji}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={s.flagTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={s.flagSeller}>by {item.seller}</Text>
              <View style={s.flagMeta}>
                <View style={s.reasonChip}>
                  <Text style={{ color:colors.red, fontSize:10, fontWeight:"700" }}>
                    ⚠ {item.reason}
                  </Text>
                </View>
                <Text style={[s.reportCount, { color:reportColor(item.reports) }]}>
                  {item.reports} report{item.reports !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={s.actionRow}>
                <TouchableOpacity style={s.removeBtn} onPress={() => handleAction(item, "remove")} activeOpacity={0.8}>
                  <Text style={s.removeBtnText}>🗑 Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.keepBtn} onPress={() => handleAction(item, "keep")} activeOpacity={0.8}>
                  <Text style={s.keepBtnText}>✓ Keep</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding:48, alignItems:"center" }}>
            <Text style={{ fontSize:32 }}>📦</Text>
            <Text style={{ color:colors.muted, marginTop:12, fontSize:14, fontWeight:"600" }}>
              No {tab} listings
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
  countBadge: { backgroundColor:"rgba(232,83,58,0.12)", borderWidth:1,
    borderColor:"rgba(232,83,58,0.3)", borderRadius:10, paddingHorizontal:10, paddingVertical:4 },
  tabsRow: { flexDirection:"row", gap:8, paddingHorizontal:spacing.xl, marginBottom:spacing.md },
  tab: { paddingHorizontal:14, paddingVertical:7, borderRadius:18,
    backgroundColor:"rgba(255,255,255,0.05)", borderWidth:1, borderColor:colors.border },
  tabActive: { backgroundColor:"rgba(232,83,58,0.1)", borderColor:"rgba(232,83,58,0.3)" },
  tabText: { fontSize:12.5, fontWeight:"600", color:colors.muted },
  tabTextActive: { color:colors.red, fontWeight:"800" },
  searchBar: { flexDirection:"row", alignItems:"center", gap:10, marginHorizontal:spacing.xl,
    marginBottom:spacing.md, backgroundColor:"rgba(255,255,255,0.05)",
    borderWidth:1, borderColor:colors.border, borderRadius:12, paddingHorizontal:14, height:42 },
  searchInput: { flex:1, color:colors.text, fontSize:14 },
  flagItem: { flexDirection:"row", gap:12, paddingHorizontal:spacing.xl, paddingVertical:14 },
  flagIcon: { width:44, height:44, borderRadius:12, backgroundColor:"rgba(255,255,255,0.06)",
    alignItems:"center", justifyContent:"center", flexShrink:0 },
  flagTitle: { fontSize:13.5, fontWeight:"700", color:colors.text, lineHeight:18, marginBottom:3 },
  flagSeller: { fontSize:11.5, color:colors.muted },
  flagMeta: { flexDirection:"row", alignItems:"center", gap:8, marginTop:6 },
  reasonChip: { backgroundColor:"rgba(232,83,58,0.1)", borderRadius:6,
    paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:"rgba(232,83,58,0.25)" },
  reportCount: { fontSize:11, fontWeight:"800" },
  actionRow: { flexDirection:"row", gap:7, marginTop:10 },
  removeBtn: { flex:1, backgroundColor:"rgba(232,83,58,0.1)", borderWidth:1,
    borderColor:"rgba(232,83,58,0.3)", borderRadius:9, paddingVertical:8, alignItems:"center" },
  removeBtnText: { color:colors.red, fontSize:12.5, fontWeight:"800" },
  keepBtn: { flex:1, backgroundColor:"rgba(45,158,107,0.1)", borderWidth:1,
    borderColor:"rgba(45,158,107,0.3)", borderRadius:9, paddingVertical:8, alignItems:"center" },
  keepBtnText: { color:colors.green, fontSize:12.5, fontWeight:"800" },
});
