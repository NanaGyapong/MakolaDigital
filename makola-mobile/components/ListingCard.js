
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing } from "../lib/theme";

const BADGE_COLORS = {
  "Verified": colors.green,
  "Top Rated": colors.blue,
  "New": colors.purple,
  "Urgent": colors.red,
  "Popular": colors.gold,
};

export default function ListingCard({ item, saved, onSave, onPress, width: cardWidth }) {
  const badgeColor = BADGE_COLORS[item.badge] || colors.textMuted;

  return (
    <TouchableOpacity style={[s.card, cardWidth && { width: cardWidth }]} onPress={onPress} activeOpacity={0.88}>
      {/* Image area */}
      <View style={s.imgArea}>
        <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
        <View style={[s.badge, { backgroundColor: badgeColor + "22", borderColor: badgeColor + "55" }]}>
          <Text style={[s.badgeText, { color: badgeColor }]}>{item.badge}</Text>
        </View>
        <TouchableOpacity style={s.heartBtn} onPress={onSave}>
          <Text style={{ fontSize: 14 }}>{saved ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>
      {/* Body */}
      <View style={s.body}>
        <Text style={s.type}>{item.type?.toUpperCase()}</Text>
        <Text style={s.title} numberOfLines={2}>{item.title}</Text>
        <Text style={s.price}>{item.price}</Text>
        <View style={s.footer}>
          <Text style={s.location} numberOfLines={1}>📍 {item.location?.split(",")[0]}</Text>
          <Text style={s.rating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", borderRadius: 14, overflow: "hidden" },
  imgArea: { height: 100, backgroundColor: "rgba(255,255,255,0.03)", alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: 7, left: 7, borderWidth: 1, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: "700" },
  heartBtn: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 7, width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  body: { padding: 11 },
  type: { fontSize: 9, fontWeight: "700", color: "rgba(240,237,232,0.35)", letterSpacing: 0.5, marginBottom: 3 },
  title: { fontSize: 12.5, fontWeight: "700", color: colors.text, lineHeight: 17, marginBottom: 5 },
  price: { fontSize: 14, fontWeight: "900", color: colors.red, marginBottom: 6 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  location: { fontSize: 10, color: "rgba(240,237,232,0.4)", flex: 1 },
  rating: { fontSize: 10, color: colors.gold, fontWeight: "700" },
});
