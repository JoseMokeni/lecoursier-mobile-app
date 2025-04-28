import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import apiService from "../../services/apiService";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Milestone {
  id: number;
  name: string;
  latitudinal: string;
  longitudinal: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

const priorityOptions = ["low", "medium", "high"];

const NewTask = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Pre-selected milestone from params (if coming from milestone details)
  const preSelectedMilestoneId = params.milestoneId as string;
  const preSelectedMilestoneName = params.milestoneName as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedMilestone, setSelectedMilestone] = useState<string>(
    preSelectedMilestoneId || ""
  );

  const [users, setUsers] = useState<User[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showMilestonePicker, setShowMilestonePicker] = useState(false);

  // Add search states
  const [userSearch, setUserSearch] = useState("");
  const [milestoneSearch, setMilestoneSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredMilestones, setFilteredMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);

        // Fetch users
        const usersResponse = await apiService.get("/users");
        setUsers(usersResponse.data || []);

        // Only fetch milestones if not pre-selected
        if (!preSelectedMilestoneId) {
          const milestonesResponse = await apiService.get("/milestones");
          setMilestones(milestonesResponse.data || []);
        } else {
          // If milestone is pre-selected, we still need to have it in the state
          const milestone = {
            id: parseInt(preSelectedMilestoneId),
            name: preSelectedMilestoneName,
            latitudinal: "",
            longitudinal: "",
            favorite: false,
            createdAt: "",
            updatedAt: "",
          };
          setMilestones([milestone]);
        }
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load required data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [preSelectedMilestoneId, preSelectedMilestoneName]);

  // Filter users based on search term
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          (user.name &&
            user.name.toLowerCase().includes(userSearch.toLowerCase())) ||
          (user.username &&
            user.username.toLowerCase().includes(userSearch.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(userSearch.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [userSearch, users]);

  // Filter milestones based on search term
  useEffect(() => {
    if (milestones.length > 0) {
      const filtered = milestones.filter((milestone) =>
        milestone.name.toLowerCase().includes(milestoneSearch.toLowerCase())
      );
      setFilteredMilestones(filtered);
    }
  }, [milestoneSearch, milestones]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios"); // Only keep open for iOS
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Task name is required");
      return false;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Task description is required");
      return false;
    }

    if (!selectedUser) {
      Alert.alert("Error", "Please assign the task to a user");
      return false;
    }

    if (!selectedMilestone) {
      Alert.alert("Error", "Please select a milestone for this task");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const taskData = {
        name,
        description,
        priority,
        status: "pending", // Default status for new tasks
        dueDate: dueDate.toISOString().split("T")[0],
        userId: parseInt(selectedUser),
        milestoneId: parseInt(selectedMilestone),
      };

      await apiService.post("/tasks", taskData);

      Alert.alert("Success", "Task created successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error("Error creating task:", err);
      Alert.alert("Error", err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function to handle closing the date picker on iOS
  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter task name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.selectionContainer}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectionOption,
                  priority === option && getPriorityStyle(option),
                ]}
                onPress={() => setPriority(option)}
              >
                <View style={styles.selectionContent}>
                  <Ionicons
                    name={getPriorityIcon(option)}
                    size={18}
                    color={
                      priority === option ? "#FFFFFF" : getPriorityColor(option)
                    }
                  />
                  <Text
                    style={[
                      styles.selectionText,
                      priority === option && styles.selectionTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Due Date section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <Ionicons
              name="calendar"
              size={18}
              color="#333"
              style={styles.labelIcon}
            />
            Due Date
          </Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerSelectedText}>{formatDate(dueDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          {/* iOS date picker with Done button */}
          {showDatePicker && Platform.OS === "ios" && (
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <TouchableOpacity
                  style={styles.datePickerDoneButton}
                  onPress={closeDatePicker}
                >
                  <Text style={styles.datePickerDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
            </View>
          )}

          {/* Android date picker (unchanged) */}
          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <Ionicons
              name="person"
              size={18}
              color="#333"
              style={styles.labelIcon}
            />
            Assign To
          </Text>
          <TouchableOpacity
            style={styles.enhancedPickerButton}
            onPress={() => setShowUserPicker(true)}
          >
            <Text
              style={
                selectedUser
                  ? styles.pickerSelectedText
                  : styles.pickerPlaceholderText
              }
            >
              {selectedUser
                ? users.find((u) => u.id.toString() === selectedUser)?.name ||
                  users.find((u) => u.id.toString() === selectedUser)
                    ?.username ||
                  "Select a user"
                : "Select a user"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Replace the overlay with a Modal */}
          <Modal
            visible={showUserPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowUserPicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select User</Text>
                  <TouchableOpacity onPress={() => setShowUserPicker(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Search input */}
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#666"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={userSearch}
                    onChangeText={setUserSearch}
                  />
                  {userSearch ? (
                    <TouchableOpacity onPress={() => setUserSearch("")}>
                      <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {filteredUsers.length === 0 ? (
                  <View style={styles.noResultsContainer}>
                    <Ionicons
                      name="information-circle-outline"
                      size={50}
                      color="#999"
                    />
                    <Text style={styles.noResultsText}>No users found</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.pickerItem,
                          selectedUser === item.id.toString() &&
                            styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedUser(item.id.toString());
                          setShowUserPicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          <Ionicons
                            name="person-circle-outline"
                            size={24}
                            color={
                              selectedUser === item.id.toString()
                                ? "#0066CC"
                                : "#666"
                            }
                          />
                          <View style={styles.pickerItemTextContainer}>
                            <Text style={styles.pickerItemText}>
                              {item.name || item.username}
                            </Text>
                            {item.email && (
                              <Text style={styles.pickerItemSubtext}>
                                {item.email}
                              </Text>
                            )}
                          </View>
                        </View>
                        {selectedUser === item.id.toString() && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#0066CC"
                          />
                        )}
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={styles.pickerSeparator} />
                    )}
                  />
                )}
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            <Ionicons
              name="location"
              size={18}
              color="#333"
              style={styles.labelIcon}
            />
            Milestone
          </Text>
          <TouchableOpacity
            style={styles.enhancedPickerButton}
            onPress={() =>
              !preSelectedMilestoneId && setShowMilestonePicker(true)
            }
            disabled={!!preSelectedMilestoneId}
          >
            <Text
              style={
                selectedMilestone
                  ? styles.pickerSelectedText
                  : styles.pickerPlaceholderText
              }
            >
              {selectedMilestone
                ? milestones.find((m) => m.id.toString() === selectedMilestone)
                    ?.name || "Select a milestone"
                : "Select a milestone"}
            </Text>
            {!preSelectedMilestoneId && (
              <Ionicons name="chevron-down" size={20} color="#666" />
            )}
          </TouchableOpacity>

          {/* Replace the overlay with a Modal */}
          <Modal
            visible={showMilestonePicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowMilestonePicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Milestone</Text>
                  <TouchableOpacity
                    onPress={() => setShowMilestonePicker(false)}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Search input */}
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
                    value={milestoneSearch}
                    onChangeText={setMilestoneSearch}
                  />
                  {milestoneSearch ? (
                    <TouchableOpacity onPress={() => setMilestoneSearch("")}>
                      <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {filteredMilestones.length === 0 ? (
                  <View style={styles.noResultsContainer}>
                    <Ionicons
                      name="information-circle-outline"
                      size={50}
                      color="#999"
                    />
                    <Text style={styles.noResultsText}>
                      No milestones found
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredMilestones}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.pickerItem,
                          selectedMilestone === item.id.toString() &&
                            styles.pickerItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedMilestone(item.id.toString());
                          setShowMilestonePicker(false);
                        }}
                      >
                        <View style={styles.pickerItemContent}>
                          <Ionicons
                            name={item.favorite ? "star" : "location-outline"}
                            size={24}
                            color={
                              item.favorite
                                ? "#FFD700"
                                : selectedMilestone === item.id.toString()
                                ? "#0066CC"
                                : "#666"
                            }
                          />
                          <View style={styles.pickerItemTextContainer}>
                            <Text style={styles.pickerItemText}>
                              {item.name}
                            </Text>
                            <Text style={styles.pickerItemSubtext}>
                              Created on{" "}
                              {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        {selectedMilestone === item.id.toString() && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#0066CC"
                          />
                        )}
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={styles.pickerSeparator} />
                    )}
                  />
                )}
              </View>
            </View>
          </Modal>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getPriorityIcon = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "flag";
    case "medium":
      return "git-branch-outline";
    case "low":
      return "leaf-outline";
    default:
      return "help-circle-outline";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "#FF3B30";
    case "medium":
      return "#FF9500";
    case "low":
      return "#34C759";
    default:
      return "#777777";
  }
};

const getPriorityStyle = (priority: string) => {
  return {
    backgroundColor: getPriorityColor(priority),
    borderColor: getPriorityColor(priority),
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    height: 48,
  },
  submitButton: {
    backgroundColor: "#0066CC",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 24,
  },
  submitButtonDisabled: {
    backgroundColor: "#99C2E8",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  selectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  selectionOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  selectionTextActive: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  labelIcon: {
    marginRight: 6,
  },
  enhancedPickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    height: 48,
  },
  pickerSelectedText: {
    fontSize: 16,
    color: "#333",
  },
  pickerPlaceholderText: {
    fontSize: 16,
    color: "#999",
  },
  pickerOverlay: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    maxHeight: 300,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  pickerItemSelected: {
    backgroundColor: "rgba(0, 102, 204, 0.05)",
  },
  pickerItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pickerItemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  pickerItemText: {
    fontSize: 15,
    color: "#333",
  },
  pickerItemSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  pickerSeparator: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Search styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },

  // No results styles
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noResultsText: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  datePicker: {
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    borderRadius: 8,
    width: "100%",
  },
  // Enhanced Date Picker styles
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#F9F9F9",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  datePickerDoneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  datePickerDoneButtonText: {
    color: "#0066CC",
    fontSize: 16,
    fontWeight: "600",
  },
  datePicker: {
    height: 200,
    width: "100%",
  },
});

export default NewTask;
