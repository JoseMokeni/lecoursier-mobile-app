import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";
import apiService from "../../../services/apiService";

const EditMilestone = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the params
  const id = params.id as string;
  const initialName = params.name as string;
  const initialLat = params.lat as string;
  const initialLng = params.lng as string;
  const initialFavorite = (params.favorite as string) === "true";

  const [name, setName] = useState(initialName);
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [markerPosition, setMarkerPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [initialRegion, setInitialRegion] = useState({
    latitude: parseFloat(initialLat) || 0,
    longitude: parseFloat(initialLng) || 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize marker position from params
  useEffect(() => {
    if (
      initialLat &&
      initialLng &&
      !isNaN(parseFloat(initialLat)) &&
      !isNaN(parseFloat(initialLng))
    ) {
      setMarkerPosition({
        latitude: parseFloat(initialLat),
        longitude: parseFloat(initialLng),
      });
    }
  }, [initialLat, initialLng]);

  // Request location permission on mount
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionGranted(status === "granted");
      } catch (error) {
        console.error("Error getting location permission:", error);
      }
    };

    getLocationPermission();
  }, []);

  // Handle map press to set marker position
  const handleMapPress = (e: MapPressEvent) => {
    const { coordinate } = e.nativeEvent;
    setMarkerPosition(coordinate);
    setLatitude(coordinate.latitude.toString());
    setLongitude(coordinate.longitude.toString());
  };

  // Center map on current location
  const goToCurrentLocation = async () => {
    if (!locationPermissionGranted) {
      Alert.alert(
        "Permission denied",
        "Location permission is required to get your current position"
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setInitialRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Failed to get your current location");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter a name for the milestone"
      );
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Missing coordinates", "Please select a location on the map");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response = await apiService.put(`/milestones/${id}`, {
        name,
        latitudinal: latitude,
        longitudinal: longitude,
        favorite: isFavorite,
      });

      console.log("Milestone updated successfully:", response);

      Alert.alert("Success", "Milestone updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error updating milestone:", error);
      setSubmitError(error.message || "Failed to update milestone");
      Alert.alert("Error", error.message || "Failed to update milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter milestone name"
        />

        <Text style={styles.mapLabel}>
          Select Location (tap on map to place marker)
        </Text>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            onPress={handleMapPress}
          >
            {markerPosition && (
              <Marker
                coordinate={markerPosition}
                title="Selected Location"
                draggable
                onDragEnd={(e) => {
                  setMarkerPosition(e.nativeEvent.coordinate);
                  setLatitude(e.nativeEvent.coordinate.latitude.toString());
                  setLongitude(e.nativeEvent.coordinate.longitude.toString());
                }}
              />
            )}
          </MapView>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={goToCurrentLocation}
          >
            <Ionicons name="locate" size={24} color="#0066CC" />
          </TouchableOpacity>
        </View>

        <View style={styles.coordinatesContainer}>
          <View style={styles.coordinateField}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={latitude}
              onChangeText={(text) => {
                setLatitude(text);
                if (
                  text &&
                  longitude &&
                  !isNaN(parseFloat(text)) &&
                  !isNaN(parseFloat(longitude))
                ) {
                  setMarkerPosition({
                    latitude: parseFloat(text),
                    longitude: parseFloat(longitude),
                  });
                }
              }}
              placeholder="Enter latitude"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.coordinateField}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={longitude}
              onChangeText={(text) => {
                setLongitude(text);
                if (
                  latitude &&
                  text &&
                  !isNaN(parseFloat(latitude)) &&
                  !isNaN(parseFloat(text))
                ) {
                  setMarkerPosition({
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(text),
                  });
                }
              }}
              placeholder="Enter longitude"
              keyboardType="numeric"
            />
          </View>
        </View>

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

        {submitError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Update Milestone</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  mapLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginVertical: 12,
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
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  map: {
    height: "100%",
    width: "100%",
  },
  currentLocationButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "white",
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coordinatesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordinateField: {
    width: "48%",
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
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: "#88AEDD",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEEEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: "#FF3B30",
    flex: 1,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditMilestone;
