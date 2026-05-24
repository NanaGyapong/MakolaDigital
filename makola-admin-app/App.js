
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";
import AuthStack from "./navigation/AuthStack";
import AdminTabs from "./navigation/AdminTabs";
import { colors } from "./lib/theme";

const NAV_THEME = {
  dark: true,
  colors: {
    primary: colors.red, background: colors.bg,
    card: colors.bg2, text: colors.text,
    border: colors.border, notification: colors.red,
  },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync("admin_token")
      .then(t => setIsLoggedIn(!!t))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn === null) return (
    <View style={{ flex:1, background:colors.bg, alignItems:"center", justifyContent:"center" }}>
      <ActivityIndicator color={colors.red} size="large" />
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={NAV_THEME}>
          <StatusBar style="light" backgroundColor={colors.bg} />
          {isLoggedIn
            ? <AdminTabs onLogout={() => setIsLoggedIn(false)} />
            : <AuthStack onLogin={() => setIsLoggedIn(true)} />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
