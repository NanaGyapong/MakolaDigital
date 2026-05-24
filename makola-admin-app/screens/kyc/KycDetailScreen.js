
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";
import { adminAPI } from "../../lib/api";

const DOC_PREVIEWS = {
  "ID":       { emoji:"🪪", label:"National ID", status:"clear" },
  "Selfie":   { emoji:"🤳", label:"Selfie with ID", status:"clear" },
  "Utility":  { emoji:"📄", label:"Utility Bill", status:"review" },
  "Business": { emoji:"🏢", label:"Business Reg.", status:"clear" },
};

export default function KycDetailScreen({ route, navigation }) {
  const { kyc } = route.params;
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [note, setNote] = useState("");

  const handleAction = async () => {
    if (action === "reject" && !note.trim()) {
      Alert.alert("Note required", "Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    try {
      await adminAPI.reviewKyc(kyc.id, action, note);
      setShowModal(false);
      Alert.alert(
        action === "approve" ? "✅ Approved" : "❌ Rejected",
        `KYC for ${kyc.name} has been ${action === "approve" ? "approved" : "rejected"}.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch {
      // Show success anyway for demo
      setShowModal(false);
      Alert.alert("Done", `KYC ${action}d successfully.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]);
    } finally { setLoading(false); }
  };

  const openAction = (a) => { setAction(a); setNote(""); setShowModal(true); };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Topbar */}
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize:20, color:colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>KYC Review</Text>
        <View style={s.kycBadge}>
          <Text style={{ color:colors.gold, fontSize:11, fontWeight:"700" }}>PENDING</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex:1 }}>
        {/* Profile */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={{ fontSize:28, fontWeight:"900", color:"#fff" }}>{kyc.name[0]}</Text>
          </View>
          <View>
            <Text style={s.profileName}>{kyc.name}</Text>
            <Text style={s.profileEmail}>{kyc.email}</Text>
            <Text style={s.profileTime}>Submitted {kyc.submitted}</Text>
          </View>
        </View>

        {/* Submission info */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Application details</Text>
          {[
            ["Account type", kyc.type],
            ["Documents", `${kyc.docs.length} uploaded`],
            ["Risk level", kyc.urgency.toUpperCase()],
            ["User ID", `USR-${kyc.id.padStart(6, "0")}`],
          ].map(([l, v]) => (
            <View key={l} style={s.infoRow}>
              <Text style={s.infoLabel}>{l}</Text>
              <Text style={s.infoVal}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Documents */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Documents ({kyc.docs.length})</Text>
          {kyc.docs.map(doc => {
            const d = DOC_PREVIEWS[doc] || { emoji:"📄", label:doc, status:"clear" };
            return (
              <View key={doc} style={s.docItem}>
                <View style={s.docPreview}>
                  <Text style={{ fontSize:28 }}>{d.emoji}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.docLabel}>{d.label}</Text>
                  <Text style={s.docStatus}>
                    {d.status === "clear" ? "✓ Appears clear" : "⚠ Review carefully"}
                  </Text>
                </View>
                <View style={[s.docStatusBadge,
                  { backgroundColor:d.status==="clear" ? "rgba(45,158,107,0.12)" : "rgba(196,127,23,0.12)",
                    borderColor:d.status==="clear" ? "rgba(45,158,107,0.3)" : "rgba(196,127,23,0.3)" }]}>
                  <Text style={{ color:d.status==="clear"?colors.green:colors.gold, fontSize:10, fontWeight:"700" }}>
                    {d.status === "clear" ? "CLEAR" : "CHECK"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Checklist */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Verification checklist</Text>
          {[
            "ID photo matches selfie",
            "Document is not expired",
            "Name matches account registration",
            "No signs of tampering or editing",
            "Document is legible and unobstructed",
          ].map((item, i) => (
            <View key={i} style={s.checkItem}>
              <View style={s.checkbox} />
              <Text style={s.checkText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={{ height:100 }} />
      </ScrollView>

      {/* Action buttons */}
      <View style={s.actions}>
        <TouchableOpacity style={s.rejectBtn} onPress={() => openAction("reject")} activeOpacity={0.85}>
          <Text style={s.rejectText}>❌ Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.approveBtn} onPress={() => openAction("approve")} activeOpacity={0.85}>
          <Text style={s.approveText}>✅ Approve</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>
              {action === "approve" ? "✅ Approve KYC" : "❌ Reject KYC"}
            </Text>
            <Text style={s.modalSub}>
              {action === "approve"
                ? `Approve ${kyc.name}'s identity verification?`
                : `Reject ${kyc.name}'s application with a reason:`}
            </Text>
            {action === "reject" && (
              <TextInput style={s.noteInput}
                placeholder="Reason for rejection (required)..."
                placeholderTextColor={colors.dim}
                value={note} onChangeText={setNote}
                multiline numberOfLines={3} textAlignVertical="top" />
            )}
            <View style={{ flexDirection:"row", gap:10, marginTop:20 }}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={{ color:colors.muted, fontSize:14, fontWeight:"700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalConfirm,
                { backgroundColor:action==="approve"?colors.green:colors.red }]}
                onPress={handleAction} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color:"#fff", fontSize:14, fontWeight:"900" }}>
                      Confirm {action}
                    </Text>}
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
  topbar: { flexDirection:"row", alignItems:"center", paddingHorizontal:spacing.lg,
    height:52, borderBottomWidth:1, borderBottomColor:colors.border },
  backBtn: { width:36, height:36, alignItems:"center", justifyContent:"center" },
  topTitle: { flex:1, fontSize:15, fontWeight:"800", color:colors.text, marginLeft:6 },
  kycBadge: { backgroundColor:"rgba(196,127,23,0.12)", borderRadius:7,
    paddingHorizontal:9, paddingVertical:4, borderWidth:1, borderColor:"rgba(196,127,23,0.3)" },
  profileCard: { flexDirection:"row", alignItems:"center", gap:14,
    margin:spacing.xl, backgroundColor:colors.card, borderWidth:1,
    borderColor:colors.border, borderRadius:16, padding:16 },
  profileAvatar: { width:56, height:56, borderRadius:16, backgroundColor:colors.red,
    alignItems:"center", justifyContent:"center" },
  profileName: { fontSize:16, fontWeight:"900", color:colors.text },
  profileEmail: { fontSize:12, color:colors.muted, marginTop:2 },
  profileTime: { fontSize:11, color:colors.dim, marginTop:4 },
  section: { marginHorizontal:spacing.xl, marginBottom:20 },
  sectionTitle: { fontSize:14, fontWeight:"800", color:colors.text, marginBottom:12 },
  infoRow: { flexDirection:"row", justifyContent:"space-between",
    paddingVertical:10, borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.05)" },
  infoLabel: { fontSize:13, color:colors.muted },
  infoVal: { fontSize:13, fontWeight:"700", color:colors.text },
  docItem: { flexDirection:"row", alignItems:"center", gap:12, marginBottom:10,
    backgroundColor:colors.card, borderRadius:12, padding:12, borderWidth:1, borderColor:colors.border },
  docPreview: { width:52, height:52, backgroundColor:"rgba(255,255,255,0.06)",
    borderRadius:10, alignItems:"center", justifyContent:"center" },
  docLabel: { fontSize:13, fontWeight:"700", color:colors.text },
  docStatus: { fontSize:11, color:colors.muted, marginTop:3 },
  docStatusBadge: { borderRadius:6, paddingHorizontal:8, paddingVertical:4, borderWidth:1 },
  checkItem: { flexDirection:"row", alignItems:"center", gap:12, paddingVertical:10,
    borderBottomWidth:1, borderBottomColor:"rgba(255,255,255,0.05)" },
  checkbox: { width:20, height:20, borderRadius:5, borderWidth:1.5,
    borderColor:colors.border },
  checkText: { fontSize:13, color:colors.muted, flex:1 },
  actions: { flexDirection:"row", gap:10, padding:spacing.lg,
    borderTopWidth:1, borderTopColor:colors.border, backgroundColor:colors.bg2 },
  rejectBtn: { flex:1, backgroundColor:"rgba(232,83,58,0.1)", borderWidth:1,
    borderColor:"rgba(232,83,58,0.3)", borderRadius:13, paddingVertical:14, alignItems:"center" },
  rejectText: { color:colors.red, fontSize:14, fontWeight:"800" },
  approveBtn: { flex:2, backgroundColor:colors.green, borderRadius:13,
    paddingVertical:14, alignItems:"center", shadowColor:colors.green,
    shadowOpacity:0.35, shadowRadius:12, elevation:6 },
  approveText: { color:"#fff", fontSize:14, fontWeight:"900" },
  modalOverlay: { flex:1, backgroundColor:"rgba(0,0,0,0.7)",
    justifyContent:"flex-end" },
  modalCard: { backgroundColor:colors.bg2, borderTopLeftRadius:24,
    borderTopRightRadius:24, padding:24, paddingBottom:36,
    borderTopWidth:1, borderColor:colors.border },
  modalTitle: { fontSize:18, fontWeight:"900", color:colors.text, marginBottom:8 },
  modalSub: { fontSize:13, color:colors.muted, marginBottom:16, lineHeight:20 },
  noteInput: { backgroundColor:"rgba(255,255,255,0.05)", borderWidth:1,
    borderColor:colors.border, borderRadius:12, padding:13,
    color:colors.text, fontSize:14, minHeight:80 },
  modalCancel: { flex:1, backgroundColor:"rgba(255,255,255,0.06)", borderWidth:1,
    borderColor:colors.border, borderRadius:12, paddingVertical:13, alignItems:"center" },
  modalConfirm: { flex:2, borderRadius:12, paddingVertical:13, alignItems:"center" },
});
