
import { useState, useRef } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

const INITIAL_MSGS = [
  { id: "1", me: false, text: "Hi! Is the iPhone 15 Pro Max still available?", time: "10:24 AM" },
  { id: "2", me: true, text: "Yes it is! We have all colours in stock — Natural, Blue and Black Titanium.", time: "10:25 AM" },
  { id: "3", me: false, text: "Great! Can you do delivery to East Legon?", time: "10:27 AM" },
  { id: "4", me: true, text: "Absolutely, we offer same-day delivery within Accra for GH₵ 30. Payment via MoMo or card.", time: "10:28 AM" },
  { id: "5", me: false, text: "Is the price at all negotiable?", time: "10:31 AM" },
  { id: "6", me: true, text: "We can do GH₵ 8,300 if you pay today. Factory sealed with full warranty.", time: "10:32 AM" },
];

const AUTO_REPLIES = ["Let me check that for you!","Sure, that is possible.","I will get back to you shortly.","Thanks for reaching out!"];

export default function ChatScreen({ navigation, route }) {
  const conv = route.params?.conv || { name: "TechHub GH", listing: "iPhone 15 Pro Max", emoji: "T", bg: ["#E8533A","#C47F17"] };
  const [msgs, setMsgs] = useState(INITIAL_MSGS);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = now.getHours() + ":" + (now.getMinutes() + "").padStart(2, "0");
    const newMsg = { id: Date.now().toString(), me: true, text: input.trim(), time };
    setMsgs(p => [...p, newMsg]);
    setInput("");
    setTimeout(() => {
      setMsgs(p => [...p, { id: (Date.now()+1).toString(), me: false, text: AUTO_REPLIES[Math.floor(Math.random()*AUTO_REPLIES.length)], time }]);
    }, 1200);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 20, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <View style={[s.av, { backgroundColor: conv.bg[0] }]}>
          <Text style={{ fontSize: 16, fontWeight: "900", color: "#fff" }}>{conv.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.hdrName}>{conv.name}</Text>
          <Text style={s.hdrSub} numberOfLines={1}>Re: {conv.listing}</Text>
        </View>
        <View style={s.onlineDot} />
        <Text style={{ fontSize: 11, color: colors.green, fontWeight: "700" }}>Online</Text>
      </View>

      {/* Listing reference */}
      <TouchableOpacity style={s.listingRef} activeOpacity={0.8}>
        <Text style={{ fontSize: 18 }}>📱</Text>
        <View>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>{conv.listing}</Text>
          <Text style={{ fontSize: 11, color: colors.red, fontWeight: "600" }}>Tap to view listing</Text>
        </View>
        <Text style={{ marginLeft: "auto", fontSize: 13, color: colors.textDim }}>→</Text>
      </TouchableOpacity>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.lg, gap: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={{ alignItems: item.me ? "flex-end" : "flex-start" }}>
            <View style={[s.bubble, item.me ? s.bubbleMe : s.bubbleThem]}>
              <Text style={[s.bubbleText, item.me && { color: "#fff" }]}>{item.text}</Text>
            </View>
            <Text style={[s.bubbleTime, item.me && { textAlign: "right" }]}>{item.time}</Text>
          </View>
        )}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={s.inputRow}>
          <TouchableOpacity style={s.attachBtn}><Text style={{ fontSize: 20 }}>📎</Text></TouchableOpacity>
          <TextInput style={s.input} placeholder="Type a message..." placeholderTextColor={colors.textDim}
            value={input} onChangeText={setInput} multiline returnKeyType="send" onSubmitEditing={send} />
          <TouchableOpacity style={[s.sendBtn, !input.trim() && { opacity: 0.4 }]} onPress={send} disabled={!input.trim()}>
            <Text style={{ fontSize: 18, color: "#fff" }}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: spacing.lg, height: 56, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  av: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  hdrName: { fontSize: 14, fontWeight: "800", color: colors.text },
  hdrSub: { fontSize: 11, color: colors.textMuted },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  listingRef: { flexDirection: "row", alignItems: "center", gap: 10, margin: spacing.md, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
  bubble: { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  bubbleThem: { backgroundColor: "rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.red, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTime: { fontSize: 10, color: colors.textDim, marginTop: 4, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg2 },
  attachBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.text, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
});
