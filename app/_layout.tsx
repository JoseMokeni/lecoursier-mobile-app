import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { FcmProvider } from "@/context/FcmContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <FcmProvider>
        <AuthGuard>
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
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                // headerShown: false,
                title: "Le Coursier",
              }}
            />
            <Stack.Screen
              name="tasks/details"
              options={{
                title: "Task details",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="tasks/new"
              options={{
                title: "New Task",
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="milestones/new"
              options={{ title: "New Milestone", headerShown: true }}
            />
            <Stack.Screen
              name="milestones/edit"
              options={{ title: "Edit Milestone" }}
            />
            <Stack.Screen
              name="milestones/details"
              options={{ title: "Milestone Details", headerShown: true }}
            />
            <Stack.Screen name="milestones/map" options={{ title: "Map" }} />
          </Stack>
        </AuthGuard>
      </FcmProvider>
    </AuthProvider>
  );
}
