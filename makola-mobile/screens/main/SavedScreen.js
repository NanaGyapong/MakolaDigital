
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../lib/theme";
export default function SavedScreen() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: colors.bg, alignItems:"center", justifyContent:"center" }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>❤️</Text>
      <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Saved listings</Text>
      <Text style={{ color: colors.textMuted, marginTop: 8 }}>Your wishlist will appear here</Text>
    </SafeAreaView>
  );
}
