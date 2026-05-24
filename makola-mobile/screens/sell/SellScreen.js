
import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../lib/theme";
import * as ImagePicker from "expo-image-picker";

const TYPES = [{ id:"product",icon:"🛍️",label:"Product"},{id:"service",icon:"🔧",label:"Service"},{id:"job",icon:"💼",label:"Job"},{id:"rental",icon:"🏠",label:"Rental"}];
const STEPS = ["Type","Details","Pricing","Photos","Review"];

export default function SellScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("product");
  const [form, setForm] = useState({ title: "", description: "", price: "", currency: "GHS", location: "", negotiable: false });
  const [images, setImages] = useState([]);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));
  const nextStep = () => setStep(s => Math.min(s+1, STEPS.length-1));
  const prevStep = () => setStep(s => Math.max(s-1, 0));

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!r.canceled) setImages(p => [...p, ...r.assets.slice(0, 8 - p.length)]);
  };

  const inp = { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, color: colors.text, fontSize: 14, marginBottom: 14 };
  const lbl = { fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 7 };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        {step > 0 && <TouchableOpacity onPress={prevStep} style={s.backBtn}><Text style={{ fontSize: 20 }}>←</Text></TouchableOpacity>}
        <Text style={s.title}>Create listing</Text>
        <Text style={s.stepCount}>{step+1}/{STEPS.length}</Text>
      </View>

      {/* Progress */}
      <View style={s.progressRow}>
        {STEPS.map((_, i) => <View key={i} style={[s.progressBar, i <= step && s.progressActive]} />)}
      </View>
      <Text style={s.stepLabel}>{STEPS[step]}</Text>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* STEP 0: Type */}
        {step === 0 && (
          <View>
            <Text style={s.stepTitle}>What are you listing?</Text>
            <Text style={s.stepSub}>Choose the type that best describes your listing.</Text>
            <View style={s.typeGrid}>
              {TYPES.map(t => (
                <TouchableOpacity key={t.id} style={[s.typeCard, type===t.id && s.typeCardActive]} onPress={() => setType(t.id)} activeOpacity={0.8}>
                  <Text style={{ fontSize: 36, marginBottom: 10 }}>{t.icon}</Text>
                  <Text style={[s.typeLabel, type===t.id && { color: colors.red }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <View>
            <Text style={s.stepTitle}>Tell us the details</Text>
            <Text style={lbl}>Title</Text>
            <TextInput style={inp} placeholder="e.g. iPhone 15 Pro Max 256GB" placeholderTextColor={colors.textDim} value={form.title} onChangeText={set("title")} />
            <Text style={lbl}>Description</Text>
            <TextInput style={[inp, { minHeight: 110, textAlignVertical: "top" }]} placeholder="Describe your listing in detail..." placeholderTextColor={colors.textDim} value={form.description} onChangeText={set("description")} multiline />
            <Text style={lbl}>Category</Text>
            <TouchableOpacity style={[inp, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>Select category</Text>
              <Text style={{ color: colors.textDim }}>▼</Text>
            </TouchableOpacity>
            <Text style={lbl}>Location</Text>
            <TextInput style={inp} placeholder="e.g. Accra, Ghana" placeholderTextColor={colors.textDim} value={form.location} onChangeText={set("location")} />
          </View>
        )}

        {/* STEP 2: Pricing */}
        {step === 2 && (
          <View>
            <Text style={s.stepTitle}>Set your price</Text>
            <Text style={lbl}>Currency</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
              {[["GHS","GH₵"],["NGN","₦"],["USD","$"],["GBP","£"]].map(([k,v]) => (
                <TouchableOpacity key={k} style={[s.currBtn, form.currency===k && s.currBtnActive]} onPress={() => set("currency")(k)}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: form.currency===k ? colors.red : colors.textMuted }}>{v} {k}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={lbl}>Price</Text>
            <TextInput style={inp} placeholder="0.00" placeholderTextColor={colors.textDim} keyboardType="numeric" value={form.price} onChangeText={set("price")} />
            <TouchableOpacity style={s.negotiableRow} onPress={() => set("negotiable")(!form.negotiable)}>
              <View style={[s.checkbox, form.negotiable && s.checkboxActive]}>
                {form.negotiable && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "900" }}>✓</Text>}
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: "600" }}>Price is negotiable</Text>
            </TouchableOpacity>
            {form.price && (
              <View style={s.pricePreview}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Buyer pays</Text>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{form.currency === "GHS" ? "GH₵" : form.currency} {(parseFloat(form.price || 0) * 1.03).toFixed(0)} <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "400" }}>(incl. 3% fee)</Text></Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: Photos */}
        {step === 3 && (
          <View>
            <Text style={s.stepTitle}>Add photos</Text>
            <Text style={s.stepSub}>Listings with photos get 5x more views. Add up to 8 images.</Text>
            <View style={s.photoGrid}>
              {images.map((img, i) => (
                <View key={i} style={s.photoThumb}>
                  <Text style={{ fontSize: 28 }}>🖼️</Text>
                  {i === 0 && <View style={s.primaryBadge}><Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>MAIN</Text></View>}
                </View>
              ))}
              {images.length < 8 && (
                <TouchableOpacity style={s.addPhotoBtn} onPress={pickImage} activeOpacity={0.8}>
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>📷</Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted }}>Add photo</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={{ fontSize: 11, color: colors.textDim, textAlign: "center", marginTop: 8 }}>{images.length}/8 photos added</Text>
          </View>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <View>
            <Text style={s.stepTitle}>Review & publish</Text>
            <View style={s.reviewCard}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>{TYPES.find(t=>t.id===type)?.icon}</Text>
              <Text style={{ fontSize: 16, fontWeight: "900", color: colors.text, marginBottom: 6 }}>{form.title || "Untitled listing"}</Text>
              <Text style={{ fontSize: 20, fontWeight: "900", color: colors.red, marginBottom: 8 }}>{form.currency === "GHS" ? "GH₵" : form.currency} {form.price || "0"}</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>📍 {form.location || "No location set"}</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>{images.length} photo{images.length !== 1 ? "s" : ""} added</Text>
            </View>
            <View style={s.checkList}>
              {[[!!form.title,"Title","Add a descriptive title"],[!!form.price,"Price","Set your asking price"],[!!form.location,"Location","Add your location"],[images.length>0,"Photos","Add at least one photo"]].map(([ok,label,hint]) => (
                <View key={label} style={s.checkItem}>
                  <Text style={{ fontSize: 16 }}>{ok ? "✅" : "⚠️"}</Text>
                  <Text style={{ fontSize: 13, color: ok ? colors.text : colors.gold, fontWeight: "600", flex: 1 }}>{ok ? label + " ✓" : hint}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={s.bottomRow}>
        {step < STEPS.length - 1 ? (
          <TouchableOpacity style={s.nextBtn} onPress={nextStep} activeOpacity={0.85}>
            <Text style={s.nextBtnText}>{step === 0 ? `List as ${TYPES.find(t=>t.id===type)?.label}` : "Continue"} →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.nextBtn, { backgroundColor: colors.green }]} onPress={() => Alert.alert("🎉 Published!", "Your listing is now live on Makola Digital.")} activeOpacity={0.85}>
            <Text style={s.nextBtnText}>🚀 Publish listing</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, height: 52 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginRight: 4 },
  title: { flex: 1, fontSize: 17, fontWeight: "800", color: colors.text },
  stepCount: { fontSize: 12, color: colors.textMuted, fontWeight: "700" },
  progressRow: { flexDirection: "row", gap: 4, paddingHorizontal: spacing.lg, marginBottom: 6 },
  progressBar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)" },
  progressActive: { backgroundColor: colors.red },
  stepLabel: { fontSize: 11, fontWeight: "700", color: colors.red, paddingHorizontal: spacing.lg, marginBottom: spacing.md, textTransform: "uppercase", letterSpacing: 0.6 },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  stepTitle: { fontSize: 22, fontWeight: "900", color: colors.text, letterSpacing: -0.5, marginBottom: 8 },
  stepSub: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 24 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  typeCard: { width: "47%", backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: colors.border, borderRadius: 16, padding: 20, alignItems: "center" },
  typeCardActive: { borderColor: colors.red, backgroundColor: "rgba(232,83,58,0.06)" },
  typeLabel: { fontSize: 14, fontWeight: "800", color: colors.text },
  currBtn: { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 10, alignItems: "center" },
  currBtnActive: { borderColor: colors.red, backgroundColor: "rgba(232,83,58,0.08)" },
  negotiableRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: colors.red, borderColor: colors.red },
  pricePreview: { backgroundColor: "rgba(232,83,58,0.06)", borderWidth: 1, borderColor: "rgba(232,83,58,0.2)", borderRadius: 12, padding: 16, gap: 4 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  photoThumb: { width: 90, height: 90, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12, alignItems: "center", justifyContent: "center", position: "relative" },
  primaryBadge: { position: "absolute", bottom: 5, left: 5, backgroundColor: colors.red, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  addPhotoBtn: { width: 90, height: 90, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1.5, borderColor: colors.border, borderStyle: "dashed", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reviewCard: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20 },
  checkList: { gap: 12 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 14 },
  bottomRow: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg2 },
  nextBtn: { backgroundColor: colors.red, borderRadius: 14, paddingVertical: 15, alignItems: "center", shadowColor: colors.red, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
