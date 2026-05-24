
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Platform } from "react-native";
import { colors } from "../lib/theme";
import HomeScreen from "../screens/main/HomeScreen";
import SearchScreen from "../screens/main/SearchScreen";
import ListingDetailScreen from "../screens/main/ListingDetailScreen";
import SellScreen from "../screens/sell/SellScreen";
import MessagesScreen from "../screens/main/MessagesScreen";
import ChatScreen from "../screens/main/ChatScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import SavedScreen from "../screens/main/SavedScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const MsgStack = createStackNavigator();

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <HomeStack.Screen name="Search" component={SearchScreen} />
    </HomeStack.Navigator>
  );
}

function MsgStackNav() {
  return (
    <MsgStack.Navigator screenOptions={{ headerShown: false }}>
      <MsgStack.Screen name="Inbox" component={MessagesScreen} />
      <MsgStack.Screen name="Chat" component={ChatScreen} />
    </MsgStack.Navigator>
  );
}

const TabIcon = ({ emoji, label, focused }) => (
  <View style={{ alignItems: "center", gap: 2 }}>
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
    <Text style={{ fontSize: 9, fontWeight: "700", color: focused ? colors.red : colors.textDim }}>{label}</Text>
  </View>
);

export default function MainTabs() {
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
      <Tab.Screen name="Home" component={HomeStackNav} options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tab.Screen name="Explore" component={SearchScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} /> }} />
      <Tab.Screen name="Sell" component={SellScreen} options={{ tabBarIcon: ({ focused }) => (
        <View style={{ width:52, height:52, borderRadius:16, background:colors.red, backgroundColor:colors.red, alignItems:"center", justifyContent:"center", marginBottom:8, shadowColor:colors.red, shadowOpacity:0.5, shadowRadius:12, elevation:8 }}>
          <Text style={{ fontSize:22 }}>➕</Text>
        </View>
      )}} />
      <Tab.Screen name="Messages" component={MsgStackNav} options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label="Inbox" focused={focused} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
