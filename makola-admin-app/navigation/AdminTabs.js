
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Platform } from "react-native";
import { colors } from "../lib/theme";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import KycQueueScreen from "../screens/kyc/KycQueueScreen";
import KycDetailScreen from "../screens/kyc/KycDetailScreen";
import ListingsScreen from "../screens/listings/ListingsScreen";
import SellersScreen from "../screens/sellers/SellersScreen";
import DisputesScreen from "../screens/disputes/DisputesScreen";

const Tab = createBottomTabNavigator();
const KycStack = createStackNavigator();

function KycStackNav() {
  return (
    <KycStack.Navigator screenOptions={{ headerShown: false }}>
      <KycStack.Screen name="KycQueue" component={KycQueueScreen} />
      <KycStack.Screen name="KycDetail" component={KycDetailScreen} />
    </KycStack.Navigator>
  );
}

const TabIcon = ({ emoji, label, focused, badge }) => (
  <View style={{ alignItems:"center", gap:2, position:"relative" }}>
    <Text style={{ fontSize:20, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
    <Text style={{ fontSize:9, fontWeight:"700",
      color: focused ? colors.red : colors.dim }}>{label}</Text>
    {badge > 0 && (
      <View style={{ position:"absolute", top:-2, right:-8,
        backgroundColor:colors.red, borderRadius:8,
        minWidth:16, height:16, alignItems:"center", justifyContent:"center",
        paddingHorizontal:3 }}>
        <Text style={{ color:"#fff", fontSize:9, fontWeight:"900" }}>
          {badge > 99 ? "99+" : badge}
        </Text>
      </View>
    )}
  </View>
);

export default function AdminTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="Dashboard" focused={focused} /> }} />
      <Tab.Screen name="KYC" component={KycStackNav}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="✅" label="KYC" focused={focused} badge={7} /> }} />
      <Tab.Screen name="Listings" component={ListingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Listings" focused={focused} badge={12} /> }} />
      <Tab.Screen name="Sellers" component={SellersScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Sellers" focused={focused} /> }} />
      <Tab.Screen name="Disputes" component={DisputesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="⚖️" label="Disputes" focused={focused} badge={3} /> }} />
    </Tab.Navigator>
  );
}
