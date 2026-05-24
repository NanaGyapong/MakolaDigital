
import { createStackNavigator } from "@react-navigation/stack";
import { useAuthStore } from "../lib/store";
import { View, ActivityIndicator } from "react-native";
import { colors } from "../lib/theme";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuthStore();

  if (loading) return (
    <View style={{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.red} size="large" />
    </View>
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
