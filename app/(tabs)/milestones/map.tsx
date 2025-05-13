import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import apiService from "../../../services/apiService";

interface Milestone {
  id: number;
  name: string;
  latitudinal: string;
  longitudinal: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

const MilestonesMap = () => {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });
  const mapRef = useRef<MapView>(null);

  // Fetch all milestones
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const data = await apiService.get("/milestones");
        const milestonesData = data.data || data || [];

        setMilestones(milestonesData);

        // Set map region to fit all milestones if any exist
        if (milestonesData.length > 0) {
          fitMapToMilestones(milestonesData);
        }
      } catch (err) {
        console.error("Error fetching milestones:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  // Try to get user's current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          // If permission denied, we'll rely on fitting to milestones
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        });
      } catch (err) {
        console.error("Error getting current location:", err);
        // Don't set error here as it's not critical to the app's function
      }
    };

    getCurrentLocation();
  }, []);

  // Calculate map region to fit all milestones
  const fitMapToMilestones = (milestonesData: Milestone[]) => {
    if (!milestonesData.length) return;

    // Filter out any milestones with invalid coordinates
    const validMilestones = milestonesData.filter(
      (m) =>
        !isNaN(parseFloat(m.latitudinal)) && !isNaN(parseFloat(m.longitudinal))
    );

    if (!validMilestones.length) return;

    // Initialize min/max values
    let minLat = Number.MAX_VALUE;
    let maxLat = Number.MIN_VALUE;
    let minLng = Number.MAX_VALUE;
    let maxLng = Number.MIN_VALUE;

    // Find bounds
    validMilestones.forEach((milestone) => {
      const lat = parseFloat(milestone.latitudinal);
      const lng = parseFloat(milestone.longitudinal);

      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    // Center point
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Add padding
    const latDelta = (maxLat - minLat) * 1.5 || 0.02;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.02;

    setRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(0.02, latDelta),
      longitudeDelta: Math.max(0.02, lngDelta),
    });
  };

  // Navigate to milestone details
  const handleMilestonePress = (milestone: Milestone) => {
    router.push({
      pathname: "/milestones/details",
      params: {
        id: milestone.id,
        name: milestone.name,
        lat: milestone.latitudinal,
        lng: milestone.longitudinal,
        createdAt: milestone.createdAt,
        favorite: milestone.favorite.toString(),
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={40} color="#FF3B30" />
        <Text style={styles.errorText}>Failed to load milestones</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/milestones/map")}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          showsUserLocation={true}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          provider={PROVIDER_GOOGLE}
        >
          {milestones.map((milestone) => {
            const lat = parseFloat(milestone.latitudinal);
            const lng = parseFloat(milestone.longitudinal);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={milestone.id}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                pinColor={milestone.favorite ? "#FFD700" : "#0066CC"}
                title={milestone.name}
                description={
                  Platform.OS === "android" ? "Tap to view details" : undefined
                }
                onCalloutPress={() => handleMilestonePress(milestone)}
              >
                {Platform.OS === "ios" && (
                  <Callout onPress={() => handleMilestonePress(milestone)}>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>{milestone.name}</Text>
                      <Text style={styles.calloutSubtitle}>
                        {new Date(milestone.createdAt).toLocaleDateString()}
                      </Text>
                      <View style={styles.calloutAction}>
                        <Ionicons
                          name="eye-outline"
                          size={14}
                          color="#0066CC"
                        />
                        <Text style={styles.calloutActionText}>
                          View Details
                        </Text>
                      </View>
                    </View>
                  </Callout>
                )}
              </Marker>
            );
          })}
        </MapView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendPin, { backgroundColor: "#0066CC" }]} />
            <Text style={styles.legendText}>Regular</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendPin, { backgroundColor: "#FFD700" }]} />
            <Text style={styles.legendText}>Favorite</Text>
          </View>
        </View>
      </View>

      {milestones.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Ionicons name="location-outline" size={60} color="rgba(0,0,0,0.2)" />
          <Text style={styles.emptyText}>No milestones found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  callout: {
    padding: 8,
    minWidth: 150,
    maxWidth: 200,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
    color: "#333",
  },
  calloutSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  calloutAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  calloutActionText: {
    fontSize: 12,
    color: "#0066CC",
    marginLeft: 4,
  },
  androidCalloutActionText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  errorDetail: {
    marginTop: 8,
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0066CC",
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: "rgba(0,0,0,0.5)",
  },
  legend: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  legendPin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
});

export default MilestonesMap;
