
import { useState } from "react";
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";
import ListingCard from "../../components/ListingCard";

const { width } = Dimensions.get("window");

const TRENDING = ["iPhone 15","Apartments Accra","Remote Jobs","Toyota Camry","Web Design","Ankara Fashion"];
const MOCK = [
  { id:"1",type:"product",badge:"Verified",title:"iPhone 15 Pro 128GB",price:"GH₵ 7,200",location:"Accra",seller:"TechHub GH",rating:4.8,reviewCount:89,emoji:"📱",verified:true},
  { id:"2",type:"rental",badge:"New",title:"Studio Apartment — Osu",price:"GH₵ 2,800/mo",location:"Osu, Accra",seller:"HomeFinder GH",rating:4.5,reviewCount:12,emoji:"🏠",verified:false},
  { id:"3",type:"service",badge:"Popular",title:"Logo & Brand Design",price:"From GH₵ 500",location:"Remote",seller:"DesignAfrica",rating:4.9,reviewCount:156,emoji:"🎨",verified:true},
  { id:"4",type:"product",badge:"Verified",title:"Samsung Galaxy S24",price:"GH₵ 6,800",location:"Kumasi",seller:"MobileKing GH",rating:4.6,reviewCount:44,emoji:"📱",verified:true},
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const doSearch = (q) => {
    setQuery(q);
    if (q.trim().length > 1) {
      setResults(MOCK.filter(l => l.title.toLowerCase().includes(q.toLowerCase()) || l.type === q.toLowerCase()));
      setHasSearched(true);
    } else { setHasSearched(false); setResults([]); }
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Search bar */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Text style={{ fontSize: 15 }}>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Search anything on Makola..." placeholderTextColor={colors.textDim}
            value={query} onChangeText={doSearch} autoFocus returnKeyType="search" />
          {query.length > 0 && <TouchableOpacity onPress={() => { setQuery(""); setHasSearched(false); }}><Text style={{ color: colors.textDim, fontSize: 16 }}>✕</Text></TouchableOpacity>}
        </View>
        {navigation.canGoBack?.() && <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: "700" }}>Cancel</Text></TouchableOpacity>}
      </View>

      {!hasSearched ? (
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <Text style={s.sectionTitle}>Trending searches</Text>
          <View style={s.trendingWrap}>
            {TRENDING.map(t => (
              <TouchableOpacity key={t} style={s.trendingChip} onPress={() => doSearch(t)} activeOpacity={0.8}>
                <Text style={{ fontSize: 14, marginRight: 4 }}>🔥</Text>
                <Text style={s.trendingText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.sectionTitle, { marginTop: 28 }]}>Browse by type</Text>
          <View style={s.typeGrid}>
            {[["product","🛍️","Products"],["service","🔧","Services"],["job","💼","Jobs"],["rental","🏠","Rentals"]].map(([id,icon,label]) => (
              <TouchableOpacity key={id} style={s.typeCard} onPress={() => doSearch(id)} activeOpacity={0.8}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{icon}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Filter pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersRow}>
            {[["all","All"],["product","Products"],["service","Services"],["job","Jobs"],["rental","Rentals"]].map(([k,v]) => (
              <TouchableOpacity key={k} style={[s.filterPill, activeFilter===k && s.filterPillActive]} onPress={() => setActiveFilter(k)}>
                <Text style={[s.filterText, activeFilter===k && { color: "#fff" }]}>{v}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.filterPill}><Text style={s.filterText}>📍 Location</Text></TouchableOpacity>
            <TouchableOpacity style={s.filterPill}><Text style={s.filterText}>💰 Price</Text></TouchableOpacity>
          </ScrollView>

          <Text style={s.resultsCount}>{results.length} results for "{query}"</Text>

          <FlatList
            data={results.filter(r => activeFilter === "all" || r.type === activeFilter)}
            numColumns={2}
            columnWrapperStyle={{ gap: 10, paddingHorizontal: spacing.xl }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <ListingCard item={item} saved={savedIds.includes(item.id)}
                onSave={() => setSavedIds(p => p.includes(item.id) ? p.filter(x=>x!==item.id) : [...p,item.id])}
                onPress={() => navigation.navigate("ListingDetail", { listing: item })}
                width={(width - spacing.xl * 2 - 10) / 2}
              />
            )}
            ListEmptyComponent={<View style={{ padding: 48, alignItems: "center" }}><Text style={{ fontSize: 32 }}>🔍</Text><Text style={{ color: colors.textMuted, marginTop: 12 }}>No results for "{query}"</Text></View>}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text, letterSpacing: -0.3, marginBottom: 14 },
  trendingWrap: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  trendingChip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  trendingText: { fontSize: 13, fontWeight: "600", color: colors.text },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeCard: { width: "47%", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18, alignItems: "center" },
  filtersRow: { paddingHorizontal: spacing.lg, gap: 8, paddingVertical: spacing.sm },
  filterPill: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  filterPillActive: { backgroundColor: colors.red, borderColor: colors.red },
  filterText: { fontSize: 12.5, fontWeight: "600", color: colors.textMuted },
  resultsCount: { fontSize: 12, color: colors.textMuted, fontWeight: "600", paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
});
