import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import Colors from "@/constants/Colors";

/**
 * Tab navigation layout for the app
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          display: "flex",
        },
        headerShown: false, // Hide the header to avoid double headers
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="tasks" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="milestones"
        options={{
          title: "Milestones",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="flag" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
