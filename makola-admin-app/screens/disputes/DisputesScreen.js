
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";

const MOCK_DISPUTES = [
  { id:"1", orderRef:"MKL-948271", buyer:"Kofi Mensah", seller:"TechHub GH",
    item:"iPhone 15 Pro Max", amount:"GH₵ 8,755", reason:"Item not as described — scratched screen",
    opened:"2 hrs ago", priority:"high" },
  { id:"2", orderRef:"MKL-948103", buyer:"Fatima Dankwa", seller:"CodeAfrica Studio",
    item:"Web Dev Service", amount:"GH₵ 2,000", reason:"Work delivered late by 3 weeks",
    opened:"1 day ago", priority:"medium" },
  { id:"3", orderRef:"MKL-947022", buyer:"Ama Asante", seller:"PrimeSpace GH",
    item:"2BR Apartment Deposit", amount:"GH₵ 4,500", reason:"Apartment not available on agreed date",
    opened:"3 days ago", priority:"high" },
];

const prioColor = p => ({ high:colors.red, medium:colors.gold, low:colors.green }[p] || colors.muted);

export default function DisputesScreen() {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState("refund_buyer");
  const [note, setNote] = useState("");

  const resolve = () => {
    if (!note.trim()) { Alert.alert("Note required", "Add a resolution note."); return; }
    setDisputes(p => p.filter(d => d.id !== selected.id));
    setSelected(null);
    setNote("");
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Disputes</Text>
        <View style={s.countBadge}>
          <Text style={{ color:colors.red, fontSize:12, fontWeight:"900" }}>
            {disputes.length} open
          </Text>
        </View>
      </View>

      <FlatList
        data={disputes}
        keyExtractor={i => i.id}
        ItemSeparatorComponent={() => <View style={{ height:10 }} />}
        contentContainerStyle={{ paddingHorizontal:spacing.xl, paddingTop:8 }}
        renderItem={({ item }) => (
          <View style={[s.disputeCard, { borderLeftColor:prioColor(item.priority) }]}>
            <View style={s.disputeTop}>
              <Text style={[s.orderRef, { color:colors.blue }]}>{item.orderRef}</Text>
              <View style={[s.prioBadge,
                { backgroundColor:prioColor(item.priority)+"18",
                  borderColor:prioColor(item.priority)+"44" }]}>
                <Text style={{ color:prioColor(item.priority), fontSize:9, fontWeight:"800" }}>
                  {item.priority.toUpperCase()}
                </Text>
              </View>
              <Text style={s.openedTime}>{item.opened}</Text>
            </View>

            <Text style={s.disputeItem}>{item.item}</Text>
            <Text style={s.disputeAmount}>{item.amount}</Text>

            <View style={s.partiesRow}>
              <View style={s.partyItem}>
                <Text style={s.partyRole}>Buyer</Text>
                <Text style={s.partyName}>{item.buyer}</Text>
              </View>
              <Text style={{ color:colors.dim, fontSize:18 }}>⇌</Text>
              <View style={s.partyItem}>
                <Text style={s.partyRole}>Seller</Text>
                <Text style={s.partyName}>{item.seller}</Text>
              </View>
            </View>

            <View style={s.reasonBox}>
              <Text style={s.reasonText}>"{item.reason}"</Text>
            </View>

            <TouchableOpacity style={s.resolveBtn} onPress={() => setSelected(item)} activeOpacity={0.85}>
              <Text style={s.resolveBtnText}>⚖️ Resolve dispute</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding:48, alignItems:"center" }}>
            <Text style={{ fontSize:32 }}>⚖️</Text>
            <Text style={{ color:colors.muted, marginTop:12, fontSize:14, fontWeight:"600" }}>
              No open disputes
            </Text>
          </View>
        }
      />

      {/* Resolution modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Resolve dispute</Text>
            <Text style={s.modalSub}>{selected?.orderRef} — {selected?.item}</Text>

            <Text style={s.modalLabel}>Resolution</Text>
            {[
              { val:"refund_buyer", label:"Refund buyer in full" },
              { val:"release_seller", label:"Release funds to seller" },
              { val:"split", label:"Split funds 50/50" },
              { val:"escalate", label:"Escalate to legal team" },
            ].map(r => (
              <TouchableOpacity key={r.val} style={[s.radioItem, resolution===r.val && s.radioActive]}
                onPress={() => setResolution(r.val)}>
                <View style={[s.radio, resolution===r.val && s.radioChecked]} />
                <Text style={[s.radioLabel, resolution===r.val && { color:colors.text, fontWeight:"700" }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[s.modalLabel, { marginTop:16 }]}>Resolution note</Text>
            <TextInput style={s.noteInput}
              placeholder="Explain your decision..."
              placeholderTextColor={colors.dim}
              value={note} onChangeText={setNote}
              multiline numberOfLines={3} textAlignVertical="top" />

            <View style={{ flexDirection:"row", gap:10, marginTop:18 }}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setSelected(null)}>
                <Text style={{ color:colors.muted, fontSize:14, fontWeight:"700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={resolve}>
                <Text style={{ color:"#fff", fontSize:14, fontWeight:"900" }}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  disputeCard: { backgroundColor:colors.card, borderWidth:1, borderColor:colors.border,
    borderRadius:14, padding:16, borderLeftWidth:3 },
  disputeTop: { flexDirection:"row", alignItems:"center", gap:8, marginBottom:8 },
  orderRef: { fontSize:12.5, fontWeight:"800", fontFamily:"monospace" },
  prioBadge: { borderRadius:5, paddingHorizontal:7, paddingVertical:2, borderWidth:1 },
  openedTime: { marginLeft:"auto", fontSize:11, color:colors.dim, fontWeight:"600" },
  disputeItem: { fontSize:15, fontWeight:"800", color:colors.text, marginBottom:3 },
  disputeAmount: { fontSize:18, fontWeight:"900", color:colors.red, marginBottom:12 },
  partiesRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between",
    backgroundColor:"rgba(255,255,255,0.04)", borderRadius:10, padding:12, marginBottom:10 },
  partyItem: { alignItems:"center" },
  partyRole: { fontSize:10, fontWeight:"700", color:colors.dim,
    textTransform:"uppercase", letterSpacing:0.5 },
  partyName: { fontSize:13, fontWeight:"700", color:colors.text, marginTop:3 },
  reasonBox: { backgroundColor:"rgba(232,83,58,0.06)", borderRadius:9, padding:11, marginBottom:13,
    borderWidth:1, borderColor:"rgba(232,83,58,0.15)" },
  reasonText: { fontSize:13, color:colors.muted, fontStyle:"italic", lineHeight:19 },
  resolveBtn: { backgroundColor:"rgba(59,125,216,0.1)", borderWidth:1,
    borderColor:"rgba(59,125,216,0.3)", borderRadius:11, paddingVertical:12, alignItems:"center" },
  resolveBtnText: { color:colors.blue, fontSize:14, fontWeight:"800" },
  modalOverlay: { flex:1, backgroundColor:"rgba(0,0,0,0.75)", justifyContent:"flex-end" },
  modalCard: { backgroundColor:colors.bg2, borderTopLeftRadius:24, borderTopRightRadius:24,
    padding:24, paddingBottom:36, borderTopWidth:1, borderColor:colors.border },
  modalTitle: { fontSize:18, fontWeight:"900", color:colors.text, marginBottom:4 },
  modalSub: { fontSize:12.5, color:colors.muted, marginBottom:18 },
  modalLabel: { fontSize:11, fontWeight:"700", color:colors.muted,
    textTransform:"uppercase", letterSpacing:0.6, marginBottom:10 },
  radioItem: { flexDirection:"row", alignItems:"center", gap:12,
    paddingVertical:10, borderRadius:10, paddingHorizontal:8 },
  radioActive: { backgroundColor:"rgba(232,83,58,0.07)" },
  radio: { width:18, height:18, borderRadius:9, borderWidth:2, borderColor:colors.border },
  radioChecked: { borderColor:colors.red, backgroundColor:colors.red },
  radioLabel: { fontSize:14, color:colors.muted },
  noteInput: { backgroundColor:"rgba(255,255,255,0.05)", borderWidth:1,
    borderColor:colors.border, borderRadius:12, padding:13,
    color:colors.text, fontSize:14, minHeight:80 },
  cancelBtn: { flex:1, backgroundColor:"rgba(255,255,255,0.06)", borderRadius:12,
    paddingVertical:13, alignItems:"center" },
  confirmBtn: { flex:2, backgroundColor:colors.blue, borderRadius:12,
    paddingVertical:13, alignItems:"center" },
});
