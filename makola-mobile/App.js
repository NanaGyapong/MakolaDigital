
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./navigation/RootNavigator";
import { useAuthStore } from "./lib/store";
import { colors } from "./lib/theme";

const NAV_THEME = {
  dark: true,
  colors: {
    primary: colors.red,
    background: colors.bg,
    card: colors.bg2,
    text: colors.text,
    border: colors.border,
    notification: colors.red,
  },
};

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={NAV_THEME}>
          <StatusBar style="light" backgroundColor={colors.bg} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
