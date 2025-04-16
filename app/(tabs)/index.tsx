import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import authService from "@/services/authService";

const Tasks = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tasks</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
});

export default Tasks;
