import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const NewMilestone = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const handleSubmit = async () => {
    // Here you would implement the API call to create a new milestone
    console.log("Creating new milestone:", {
      name,
      latitude,
      longitude,
      isFavorite,
    });

    // Navigate back to milestones list
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Milestone</Text>
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter milestone name"
        />

        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          value={latitude}
          onChangeText={setLatitude}
          placeholder="Enter latitude"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          value={longitude}
          onChangeText={setLongitude}
          placeholder="Enter longitude"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.favoriteToggle}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={24}
            color={isFavorite ? "#FFD700" : "#666"}
          />
          <Text style={styles.favoriteText}>Mark as favorite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Milestone</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    marginBottom: 16,
  },
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  favoriteText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NewMilestone;
