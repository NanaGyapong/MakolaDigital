
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

const CONVS = [
  { id: "1", name: "TechHub GH", preview: "Sure, we can do delivery to Tema", time: "2m", unread: 2, emoji: "T", bg: ["#E8533A","#C47F17"], listing: "iPhone 15 Pro Max" },
  { id: "2", name: "CodeAfrica Studio", preview: "The project timeline is 3 weeks", time: "1h", unread: 0, emoji: "C", bg: ["#3B7DD8","#8B5CF6"], listing: "Web Dev Services" },
  { id: "3", name: "PrimeSpace GH", preview: "Apartment is still available!", time: "3h", unread: 1, emoji: "P", bg: ["#2D9E6B","#3B7DD8"], listing: "2BR Apartment Legon" },
  { id: "4", name: "AutoLink GH", preview: "Yes, comes with full service history", time: "1d", unread: 0, emoji: "A", bg: ["#C47F17","#E8533A"], listing: "Toyota RAV4 2020" },
  { id: "5", name: "Ama Couture", preview: "I can start your order next week", time: "2d", unread: 0, emoji: "A", bg: ["#DB2777","#8B5CF6"], listing: "Fashion Design" },
];

export default function MessagesScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const filtered = CONVS.filter(c => search === "" || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Messages</Text>
        <View style={s.newBtn}><Text style={{ fontSize: 18 }}>✏️</Text></View>
      </View>
      <View style={s.searchWrap}>
        <Text style={{ fontSize: 14 }}>🔍</Text>
        <TextInput style={s.searchInput} placeholder="Search conversations..." placeholderTextColor={colors.textDim} value={search} onChangeText={setSearch} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.04)", marginLeft: 76 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.convItem} onPress={() => navigation.navigate("Chat", { conv: item })} activeOpacity={0.8}>
            <View style={[s.avatar, { backgroundColor: item.bg[0] }]}>
              <Text style={s.avatarText}>{item.emoji}</Text>
              {item.unread > 0 && <View style={s.unreadDot} />}
            </View>
            <View style={s.convBody}>
              <View style={s.convTop}>
                <Text style={s.convName}>{item.name}</Text>
                <Text style={s.convTime}>{item.time}</Text>
              </View>
              <Text style={s.convListing} numberOfLines={1}>Re: {item.listing}</Text>
              <Text style={[s.convPreview, item.unread > 0 && { color: colors.text, fontWeight: "600" }]} numberOfLines={1}>{item.preview}</Text>
            </View>
            {item.unread > 0 && <View style={s.unreadBadge}><Text style={s.unreadCount}>{item.unread}</Text></View>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={{ padding: 48, alignItems: "center" }}><Text style={{ fontSize: 32 }}>📭</Text><Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 14 }}>No conversations yet</Text></View>}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  title: { fontSize: 22, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  newBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: spacing.xl, marginBottom: spacing.md, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, height: 42 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14 },
  convItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: spacing.xl, paddingVertical: 14 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", position: "relative" },
  avatarText: { fontSize: 18, fontWeight: "900", color: "#fff" },
  unreadDot: { position: "absolute", top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red, borderWidth: 2, borderColor: colors.bg },
  convBody: { flex: 1, gap: 2 },
  convTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  convName: { fontSize: 14, fontWeight: "800", color: colors.text },
  convTime: { fontSize: 11, color: colors.textDim, fontWeight: "600" },
  convListing: { fontSize: 11, color: colors.red, fontWeight: "600" },
  convPreview: { fontSize: 13, color: colors.textMuted },
  unreadBadge: { backgroundColor: colors.red, borderRadius: 10, minWidth: 20, height: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  unreadCount: { color: "#fff", fontSize: 10, fontWeight: "900" },
});
