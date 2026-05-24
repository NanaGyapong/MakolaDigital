
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing } from "../../lib/theme";

const { width } = Dimensions.get("window");

export default function ListingDetailScreen({ navigation, route }) {
  const listing = route.params?.listing || {
    id: "1", emoji: "📱", title: "iPhone 15 Pro Max 256GB", price: "GH₵ 8,500",
    location: "Accra Mall, Accra", seller: "TechHub GH", rating: 4.8, reviewCount: 142,
    verified: true, type: "product",
  };

  const [saved, setSaved] = useState(false);
  const [payMethod, setPayMethod] = useState("momo");

  const REVIEWS = [
    { name: "Ama K.", rating: 5, text: "Fast delivery, exactly as described. Legit seller!", time: "2 days ago" },
    { name: "Kwame B.", rating: 5, text: "Got my phone sealed in original box. Works perfectly.", time: "5 days ago" },
    { name: "Fatima M.", rating: 4, text: "Good product, delivery was slightly late but great quality.", time: "1 week ago" },
  ];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Topbar */}
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={s.topbarTitle} numberOfLines={1}>{listing.title}</Text>
        <TouchableOpacity onPress={() => setSaved(p => !p)} style={s.saveBtn}>
          <Text style={{ fontSize: 20 }}>{saved ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image area */}
        <View style={s.imageArea}>
          <Text style={{ fontSize: 80 }}>{listing.emoji || "📦"}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{listing.verified ? "✓ Verified" : "New"}</Text>
          </View>
        </View>

        {/* Thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.thumbsRow}>
          {["📱","🖼️","📦","🔍"].map((e, i) => (
            <TouchableOpacity key={i} style={[s.thumb, i === 0 && s.thumbActive]}>
              <Text style={{ fontSize: 18 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.body}>
          {/* Title & price */}
          <Text style={s.type}>{listing.type?.toUpperCase()}</Text>
          <Text style={s.title}>{listing.title}</Text>
          <Text style={s.price}>{listing.price}</Text>
          <Text style={s.location}>📍 {listing.location} · Posted 2 days ago</Text>

          {/* Rating */}
          <View style={s.ratingRow}>
            <Text style={s.stars}>★★★★★</Text>
            <Text style={s.ratingNum}>{listing.rating}</Text>
            <Text style={s.ratingCount}>({listing.reviewCount} reviews)</Text>
          </View>

          {/* Seller card */}
          <View style={s.sellerCard}>
            <View style={s.sellerAvatar}><Text style={s.sellerAvatarText}>{listing.seller?.[0] || "S"}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.sellerName}>{listing.seller}</Text>
              {listing.verified && <Text style={s.sellerVerified}>✓ Verified · Pro Seller</Text>}
            </View>
            <TouchableOpacity style={s.viewProfileBtn}>
              <Text style={s.viewProfileText}>View profile</Text>
            </TouchableOpacity>
          </View>

          {/* Seller stats */}
          <View style={s.sellerStats}>
            {[["4.8★","Rating"],["142","Reviews"],["98%","Response"],["3 yrs","Member"]].map(([v,l]) => (
              <View key={l} style={s.sellerStat}>
                <Text style={s.sellerStatVal}>{v}</Text>
                <Text style={s.sellerStatLbl}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={s.descTitle}>Description</Text>
          <Text style={s.descText}>Brand new iPhone 15 Pro Max in factory seal. 256GB storage, titanium frame, A17 Pro chip. Available in all colours. Comes with original accessories and 1-year Apple warranty. Authorized reseller with 3+ years experience.</Text>

          <View style={s.tags}>
            {["Brand new","Apple","256GB","Warranty","Accra"].map(t => (
              <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>
            ))}
          </View>

          {/* Payment */}
          <Text style={s.descTitle}>Purchase</Text>
          <View style={s.orderBox}>
            {[["Price","GH₵ 8,500"],["Platform fee (3%)","GH₵ 255"],["Total","GH₵ 8,755"]].map(([l,v],i) => (
              <View key={l} style={[s.orderRow, i === 2 && s.orderTotal]}>
                <Text style={i === 2 ? s.orderTotalText : s.orderLabel}>{l}</Text>
                <Text style={i === 2 ? [s.orderTotalText, { color: colors.red }] : s.orderValue}>{v}</Text>
              </View>
            ))}
            <Text style={s.payLabel}>Pay with:</Text>
            <View style={s.payMethods}>
              {[["momo","📱 MoMo"],["card","💳 Card"],["bank","🏦 Bank"]].map(([k,v]) => (
                <TouchableOpacity key={k} style={[s.payMethod, payMethod === k && s.payMethodActive]} onPress={() => setPayMethod(k)}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: payMethod === k ? colors.red : colors.textMuted }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reviews */}
          <Text style={s.descTitle}>Reviews ({listing.reviewCount})</Text>
          <View style={s.reviewScore}>
            <Text style={{ fontSize: 40, fontWeight: "900", color: colors.red }}>4.8</Text>
            <View>
              <Text style={{ color: colors.gold, fontSize: 18 }}>★★★★★</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{listing.reviewCount} verified reviews</Text>
            </View>
          </View>
          {REVIEWS.map((r, i) => (
            <View key={i} style={s.reviewItem}>
              <View style={s.reviewTop}>
                <View style={s.reviewAvatar}><Text style={{ fontSize: 12, fontWeight: "800" }}>{r.name[0]}</Text></View>
                <Text style={s.reviewName}>{r.name}</Text>
                <Text style={{ color: colors.gold }}>{"★".repeat(r.rating)}</Text>
                <Text style={s.reviewTime}>{r.time}</Text>
              </View>
              <Text style={s.reviewText}>{r.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomCta}>
        <TouchableOpacity style={s.msgBtn} onPress={() => navigation.navigate("Messages")} activeOpacity={0.8}>
          <Text style={s.msgBtnText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.buyBtn} onPress={() => Alert.alert("Buy securely", "Redirecting to payment...")} activeOpacity={0.85}>
          <Text style={s.buyBtnText}>🔒 Buy Securely</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, height: 52, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  topbarTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.text, marginHorizontal: 8 },
  saveBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  imageArea: { height: 220, backgroundColor: "rgba(255,255,255,0.04)", alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(45,158,107,0.15)", borderWidth: 1, borderColor: "rgba(45,158,107,0.35)", borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { color: colors.green, fontSize: 11, fontWeight: "700" },
  thumbsRow: { paddingHorizontal: spacing.lg, gap: 8, paddingVertical: spacing.sm },
  thumb: { width: 56, height: 48, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  thumbActive: { borderColor: colors.red },
  body: { padding: spacing.xl },
  type: { fontSize: 10, fontWeight: "700", color: colors.textDim, letterSpacing: 0.7, marginBottom: 5 },
  title: { fontSize: 20, fontWeight: "900", color: colors.text, letterSpacing: -0.5, marginBottom: 8 },
  price: { fontSize: 26, fontWeight: "900", color: colors.red, letterSpacing: -0.5, marginBottom: 6 },
  location: { fontSize: 12, color: colors.textMuted, marginBottom: 14 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 18 },
  stars: { color: colors.gold, fontSize: 15 },
  ratingNum: { fontSize: 14, fontWeight: "800", color: colors.text },
  ratingCount: { fontSize: 12, color: colors.textMuted },
  sellerCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, marginBottom: 12 },
  sellerAvatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  sellerAvatarText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  sellerName: { fontSize: 14, fontWeight: "800", color: colors.text },
  sellerVerified: { fontSize: 11, color: colors.green, fontWeight: "700", marginTop: 2 },
  viewProfileBtn: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  viewProfileText: { fontSize: 12, fontWeight: "700", color: colors.text },
  sellerStats: { flexDirection: "row", gap: 8, marginBottom: 18 },
  sellerStat: { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 10, alignItems: "center" },
  sellerStatVal: { fontSize: 14, fontWeight: "900", color: colors.red },
  sellerStatLbl: { fontSize: 10, color: colors.textMuted, marginTop: 2, fontWeight: "600" },
  descTitle: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 10, marginTop: 4 },
  descText: { fontSize: 13, color: "rgba(240,237,232,0.62)", lineHeight: 21, marginBottom: 14 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 20 },
  tag: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  orderBox: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, marginBottom: 20 },
  orderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  orderTotal: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 4 },
  orderLabel: { fontSize: 13, color: colors.textMuted },
  orderValue: { fontSize: 13, color: colors.text, fontWeight: "600" },
  orderTotalText: { fontSize: 15, fontWeight: "900", color: colors.text },
  payLabel: { fontSize: 11, fontWeight: "700", color: colors.textMuted, marginTop: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  payMethods: { flexDirection: "row", gap: 8 },
  payMethod: { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 9, paddingVertical: 8, alignItems: "center" },
  payMethodActive: { borderColor: colors.red, backgroundColor: "rgba(232,83,58,0.08)" },
  reviewScore: { flexDirection: "row", gap: 16, alignItems: "center", marginBottom: 16 },
  reviewItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  reviewAvatar: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  reviewName: { fontSize: 12, fontWeight: "700", color: colors.text },
  reviewTime: { marginLeft: "auto", fontSize: 10, color: colors.textDim },
  reviewText: { fontSize: 12, color: "rgba(240,237,232,0.6)", lineHeight: 19, paddingLeft: 36 },
  bottomCta: { flexDirection: "row", gap: 10, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg2 },
  msgBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  msgBtnText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  buyBtn: { flex: 2, backgroundColor: colors.red, borderRadius: 14, paddingVertical: 14, alignItems: "center", shadowColor: colors.red, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  buyBtnText: { color: "#fff", fontSize: 14, fontWeight: "900" },
});
