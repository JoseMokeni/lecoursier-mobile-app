import { Stack } from "expo-router";

const MilestonesLayout = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#fff" },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Milestones" }} />
      <Stack.Screen name="new" options={{ title: "New Milestone" }} />
      <Stack.Screen name="edit" options={{ title: "Edit Milestone" }} />
      <Stack.Screen name="details" options={{ title: "Milestone Details" }} />
    </Stack>
  );
};
export default MilestonesLayout;
