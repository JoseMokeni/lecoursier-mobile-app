import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Milestone {
  id: number;
  name: string;
  latitudinal: string;
  longitudinal: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortOption = "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc";

const Milestones = () => {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [filteredMilestones, setFilteredMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Filter and sort states
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("dateDesc");

  const processMilestoneData = (responseData: any) => {
    if (responseData && responseData.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    return responseData || [];
  };

  useFocusEffect(
    useCallback(() => {
      const fetchMilestones = async () => {
        try {
          console.log("Fetching milestones...");

          const API_ENDPOINT = `${process.env.EXPO_PUBLIC_API_URL}/milestones`;
          const tenantId: string = "belect";
          const token = "1|cPlnvctoT3tqpHwpwW3tXvaR72rBYc2hKgNqwMd603ab42b4";

          const response = await fetch(API_ENDPOINT, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-tenant-id": tenantId,
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok && response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.message) {
              console.log("Error message:", errorData.message);
            }
            throw new Error(
              "Access forbidden: You don't have permission to access this resource."
            );
          }

          if (response.status === 401) {
            console.log("Unauthorized access: Invalid token.");
            throw new Error("Unauthorized access: Invalid token.");
          }

          const data = await response.json();
          console.log("Fetched milestones:", data);
          setMilestones(processMilestoneData(data));
        } catch (error: any) {
          console.error("Error fetching milestones:", error);
          setError(error);
        } finally {
          setLoading(false);
        }
      };

      fetchMilestones();

      return () => {
        setMilestones([]);
        setLoading(true);
        setError(null);
      };
    }, [])
  );

  // Apply filters, search, and sorting whenever the source data or filter/sort/search options change
  useEffect(() => {
    let result = [...milestones];

    // Apply search filter if there's search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter((milestone) =>
        milestone.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply favorite filter if enabled
    if (showFavoritesOnly) {
      result = result.filter((milestone) => milestone.favorite);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "dateAsc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "dateDesc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredMilestones(result);
  }, [milestones, showFavoritesOnly, sortOption, searchText]);

  const toggleFavoriteFilter = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const renderSortButton = (title: string, option: SortOption) => {
    const isActive = sortOption === option;
    return (
      <TouchableOpacity
        style={[styles.sortButton, isActive && styles.sortButtonActive]}
        onPress={() => setSortOption(option)}
      >
        <Text
          style={[
            styles.sortButtonText,
            isActive && styles.sortButtonTextActive,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMilestone = ({ item }: { item: Milestone }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString();

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {item.favorite ? (
            <Ionicons name="star" size={20} color="#FFD700" />
          ) : (
            <Ionicons name="star-outline" size={20} color="#666" />
          )}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.coordContainer}>
            <Ionicons
              name="location"
              size={16}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.coordinates}>
              {item.latitudinal}, {item.longitudinal}
            </Text>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading milestones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={40} color="#FF3B30" />
        <Text style={styles.errorText}>Failed to load milestones</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Milestones</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search milestones..."
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.favoriteFilterButton,
            showFavoritesOnly && styles.favoriteFilterActive,
          ]}
          onPress={toggleFavoriteFilter}
        >
          <Ionicons
            name={showFavoritesOnly ? "star" : "star-outline"}
            size={18}
            color={showFavoritesOnly ? "#FFD700" : "#666"}
          />
          <Text
            style={[
              styles.favoriteFilterText,
              showFavoritesOnly && styles.favoriteFilterTextActive,
            ]}
          >
            Favorites
          </Text>
        </TouchableOpacity>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortOptions}
          >
            {renderSortButton("Name ↑", "nameAsc")}
            {renderSortButton("Name ↓", "nameDesc")}
            {renderSortButton("Date ↑", "dateAsc")}
            {renderSortButton("Date ↓", "dateDesc")}
          </ScrollView>
        </View>
      </View>

      {filteredMilestones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>
            {searchText.trim()
              ? "No matching milestones found"
              : showFavoritesOnly
              ? "No favorite milestones found"
              : "No milestones found"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMilestones}
          renderItem={renderMilestone}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button for new milestone */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/milestones/new")}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  filterContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  favoriteFilterActive: {
    backgroundColor: "#FFF9E6",
  },
  favoriteFilterText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  favoriteFilterTextActive: {
    color: "#666",
    fontWeight: "500",
  },
  sortContainer: {
    marginTop: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: "row",
    paddingBottom: 4,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: "#0066CC",
  },
  sortButtonText: {
    fontSize: 13,
    color: "#555",
  },
  sortButtonTextActive: {
    color: "#FFF",
    fontWeight: "500",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardContent: {
    marginTop: 4,
  },
  coordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coordinates: {
    fontSize: 14,
    color: "#666",
  },
  date: {
    fontSize: 14,
    color: "#888",
  },
  icon: {
    marginRight: 6,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
});

export default Milestones;
