import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#fff" },
        headerTitleStyle: {
          color: "rgb(37 99 235)",
          fontSize: 20,
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ title: "Le Coursier" }} />
    </Stack>
  );
}
