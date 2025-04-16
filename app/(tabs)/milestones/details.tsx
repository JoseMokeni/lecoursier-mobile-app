import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../../../services/apiService";

const Details = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse the params
  const id = params.id as string;
  const name = params.name as string;
  const lat = parseFloat(params.lat as string);
  const lng = parseFloat(params.lng as string);
  const createdAt = params.createdAt as string;
  const favorite = (params.favorite as string) === "true";

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString();

  // Check if coordinates are valid
  const hasValidCoordinates = !isNaN(lat) && !isNaN(lng);

  const handleDelete = () => {
    Alert.alert(
      "Delete Milestone",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      await apiService.delete(`/milestones/${id}`);

      Alert.alert("Success", "Milestone deleted successfully");
      router.back();
    } catch (error: any) {
      console.error("Error deleting milestone:", error);
      Alert.alert("Error", error.message || "Failed to delete milestone");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: "/milestones/edit",
      params: {
        id,
        name,
        lat: lat.toString(),
        lng: lng.toString(),
        favorite: favorite.toString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Milestone Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={20} color="#0066CC" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{name}</Text>
          {favorite ? (
            <Ionicons name="star" size={20} color="#FFD700" />
          ) : (
            <Ionicons name="star-outline" size={20} color="#666" />
          )}
        </View>

        <View style={styles.detailsRow}>
          <Ionicons name="location-outline" size={18} color="#666" />
          <Text style={styles.detailText}>
            {hasValidCoordinates ? `${lat}, ${lng}` : "Coordinates unavailable"}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
      </View>

      {hasValidCoordinates ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: lat, longitude: lng }}
              title={name}
              description={`Created on ${formattedDate}`}
              pinColor="#0066CC"
            />
          </MapView>
        </View>
      ) : (
        <View style={styles.noMapContainer}>
          <Ionicons name="map-outline" size={60} color="#ccc" />
          <Text style={styles.noMapText}>Map unavailable</Text>
          <Text style={styles.noMapSubText}>Invalid coordinates</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginLeft: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#555",
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  noMapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
  },
  noMapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#888",
    marginTop: 16,
  },
  noMapSubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});

export default Details;
