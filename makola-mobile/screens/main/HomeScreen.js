
import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl, Dimensions, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing } from "../../lib/theme";
import { api } from "../../lib/auth";
import { useAuthStore } from "../../lib/store";
import ListingCard from "../../components/ListingCard";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { id: "products", label: "Products", icon: "🛍️", color: colors.red },
  { id: "services", label: "Services", icon: "🔧", color: colors.green },
  { id: "jobs", label: "Jobs", icon: "💼", color: colors.gold },
  { id: "rentals", label: "Rentals", icon: "🏠", color: colors.blue },
  { id: "vehicles", label: "Vehicles", icon: "🚗", color: colors.purple },
  { id: "electronics", label: "Electronics", icon: "📱", color: colors.red },
  { id: "fashion", label: "Fashion", icon: "👗", color: "#DB2777" },
  { id: "food", label: "Food & Agric", icon: "🌿", color: colors.green },
];

const MOCK_LISTINGS = [
  { id: "1", type: "product", badge: "Verified", title: "iPhone 15 Pro Max 256GB", price: "GH₵ 8,500", currency: "GHS", location: "Accra, Ghana", seller: "TechHub GH", rating: 4.8, reviewCount: 142, emoji: "📱", verified: true },
  { id: "2", type: "service", badge: "Top Rated", title: "Professional Web & App Development", price: "From GH₵ 2,000", currency: "GHS", location: "Remote", seller: "CodeAfrica Studio", rating: 4.9, reviewCount: 87, emoji: "💻", verified: true },
  { id: "3", type: "rental", badge: "New", title: "2BR Furnished Apartment — East Legon", price: "GH₵ 4,500/mo", currency: "GHS", location: "East Legon, Accra", seller: "PrimeSpace GH", rating: 4.7, reviewCount: 33, emoji: "🏠", verified: false },
  { id: "4", type: "job", badge: "Urgent", title: "Senior Data Scientist (Remote)", price: "$3,500–$5,000/mo", currency: "USD", location: "Remote — Africa", seller: "Fintech Lagos", rating: 4.6, reviewCount: 21, emoji: "📊", verified: true },
  { id: "5", type: "product", badge: "Verified", title: "Toyota RAV4 2020 Full Option", price: "GH₵ 185,000", currency: "GHS", location: "Kumasi, Ghana", seller: "AutoLink GH", rating: 4.5, reviewCount: 58, emoji: "🚗", verified: true },
  { id: "6", type: "service", badge: "Popular", title: "African Print Fashion Design", price: "From GH₵ 350", currency: "GHS", location: "Labone, Accra", seller: "Ama Couture", rating: 5.0, reviewCount: 204, emoji: "👗", verified: true },
];

export default function HomeScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filtered = listings.filter(l =>
    (activeTab === "all" || l.type === activeTab) &&
    (search === "" || l.title.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSave = (id) => setSavedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />}
        stickyHeaderIndices={[2]}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{greeting()}, {user?.fullName?.split(" ")[0] || "there"} 👋</Text>
            <Text style={s.headerSub}>Find what you need across Africa</Text>
          </View>
          <TouchableOpacity style={s.notifBtn}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={s.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={s.searchWrap}>
          <View style={s.searchBar}>
            <Text style={{ fontSize: 16 }}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search products, services, jobs..."
              placeholderTextColor={colors.textDim}
              value={search}
              onChangeText={setSearch}
              onFocus={() => navigation.navigate("Search")}
            />
          </View>
          <TouchableOpacity style={s.filterBtn}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Sticky tabs */}
        <View style={s.tabsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll}>
            {["all","product","service","job","rental"].map(t => (
              <TouchableOpacity key={t} style={[s.tab, activeTab === t && s.tabActive]} onPress={() => setActiveTab(t)} activeOpacity={0.8}>
                <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
                  {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats banner */}
        <View style={s.statsBanner}>
          {[["180k+","Listings"],["54","Countries"],["22k+","Sellers"]].map(([v,l]) => (
            <View key={l} style={s.statItem}>
              <Text style={s.statVal}>{v}</Text>
              <Text style={s.statLbl}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Categories */}
        <View style={s.sectionHdr}>
          <Text style={s.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={s.seeAll}>See all →</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: spacing.xl, gap: 10, paddingRight: spacing.xl }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={s.catCard} activeOpacity={0.8} onPress={() => setActiveTab(cat.id.replace("electronics","product").replace("fashion","product").replace("vehicles","product").replace("food","product"))}>
              <View style={[s.catIcon, { backgroundColor: cat.color + "18" }]}>
                <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
              </View>
              <Text style={s.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Listings */}
        <View style={[s.sectionHdr, { marginTop: spacing.xl }]}>
          <Text style={s.sectionTitle}>Featured listings</Text>
          <Text style={{ color: colors.textDim, fontSize: 12 }}>{filtered.length} results</Text>
        </View>

        <View style={s.listingsGrid}>
          {filtered.map(item => (
            <ListingCard
              key={item.id}
              item={item}
              saved={savedIds.includes(item.id)}
              onSave={() => toggleSave(item.id)}
              onPress={() => navigation.navigate("ListingDetail", { listing: item })}
              width={(width - spacing.xl * 2 - 10) / 2}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  greeting: { fontSize: 20, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red, borderWidth: 1.5, borderColor: colors.bg2 },
  searchWrap: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  searchBar: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  filterBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  tabsWrap: { backgroundColor: colors.bg, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsScroll: { paddingHorizontal: spacing.xl, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.red, borderColor: colors.red },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textMuted },
  tabTextActive: { color: "#fff", fontWeight: "700" },
  statsBanner: { flexDirection: "row", marginHorizontal: spacing.xl, marginTop: spacing.lg, backgroundColor: "rgba(232,83,58,0.06)", borderWidth: 1, borderColor: "rgba(232,83,58,0.15)", borderRadius: 14, paddingVertical: 14 },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 18, fontWeight: "900", color: colors.red },
  statLbl: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: "600" },
  sectionHdr: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  seeAll: { fontSize: 13, color: colors.red, fontWeight: "700" },
  catCard: { alignItems: "center", gap: 6, minWidth: 68 },
  catIcon: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  catLabel: { fontSize: 11, fontWeight: "700", color: colors.text, textAlign: "center" },
  listingsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
});
