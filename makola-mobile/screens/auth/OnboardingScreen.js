
import { useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing } from "../../lib/theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  { id: "1", emoji: "🌍", title: "Africa's Marketplace", subtitle: "Buy & sell products, services, jobs and rentals — across Africa and the diaspora.", bg: "rgba(232,83,58,0.08)" },
  { id: "2", emoji: "🏪", title: "List for Free", subtitle: "Create your shop in minutes. Reach millions of buyers in Ghana, Nigeria, Kenya and beyond.", bg: "rgba(45,158,107,0.08)" },
  { id: "3", emoji: "🔒", title: "Safe & Trusted", subtitle: "Verified sellers, secure payments via Mobile Money, and Makola Buyer Guarantee on every order.", bg: "rgba(59,125,216,0.08)" },
];

export default function OnboardingScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);

  const next = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      navigation.replace("Login");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logoIcon}><Text style={{ fontSize: 18 }}>🌍</Text></View>
        <Text style={styles.logoText}>Makola<Text style={{ color: colors.red }}>Digital</Text></Text>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.emojiWrap, { backgroundColor: item.bg }]}>
              <Text style={{ fontSize: 72 }}>{item.emoji}</Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSub}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(i) => i.id}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={next} activeOpacity={0.85}>
          <Text style={styles.btnPrimaryText}>
            {current === SLIDES.length - 1 ? "Get started →" : "Next →"}
          </Text>
        </TouchableOpacity>
        {current < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => navigation.replace("Login")} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate("Login")} activeOpacity={0.7} style={{ marginTop: 12 }}>
          <Text style={styles.loginLink}>Already have an account? <Text style={{ color: colors.red, fontWeight: "700" }}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: spacing.xl, paddingBottom: 0 },
  logoIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 18, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xxl, paddingTop: spacing.xl },
  emojiWrap: { width: 140, height: 140, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: spacing.xxl },
  slideTitle: { ...typography.h1, textAlign: "center", marginBottom: spacing.md },
  slideSub: { ...typography.body, color: colors.textMuted, textAlign: "center", lineHeight: 22 },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center", marginBottom: spacing.xl },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.2)" },
  dotActive: { width: 20, backgroundColor: colors.red },
  actions: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  btnPrimary: { backgroundColor: colors.red, borderRadius: 14, paddingVertical: 15, alignItems: "center", shadowColor: colors.red, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: -0.3 },
  skipText: { color: colors.textMuted, textAlign: "center", fontSize: 14, fontWeight: "600" },
  loginLink: { color: colors.textMuted, textAlign: "center", fontSize: 13 },
});
