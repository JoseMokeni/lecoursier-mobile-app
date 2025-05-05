import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../../services/apiService";
import Pusher from "pusher-js/react-native";
import authService from "@/services/authService";

interface Task {
  id: number;
  name: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    phone: string | null;
  };
  milestoneId: number;
  milestone: {
    id: number;
    name: string;
    longitudinal: string;
    latitudinal: string;
    favorite: boolean;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Tasks = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const pusherRef = useRef<Pusher | null>(null);

  // Extract fetchTasks function so it can be reused
  const fetchTasks = async () => {
    try {
      console.log("Fetching tasks...");

      setLoading(true);
      const response = await apiService.get("/tasks");
      const tasksData = response.data || [];
      const sorted = tasksData.sort(
        (a: Task, b: Task) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTasks(sorted);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    let channel: any = null;
    let isMounted = true;

    const setupPusher = async () => {
      const COMPANY_CODE = await authService.getCompanyCode();
      // log all the env vars used bellow with types
      console.log("Pusher App Key:", process.env.EXPO_PUBLIC_PUSHER_APP_KEY);
      console.log("Pusher Host:", process.env.EXPO_PUBLIC_PUSHER_HOST);
      console.log("Pusher Port:", process.env.EXPO_PUBLIC_PUSHER_PORT);
      console.log("Pusher Cluster:", process.env.EXPO_PUBLIC_PUSHER_CLUSTER);
      console.log("Company Code:", COMPANY_CODE);
      const pusher = new Pusher(
        process.env.EXPO_PUBLIC_PUSHER_APP_KEY || "lecoursier",
        {
          wsHost: process.env.EXPO_PUBLIC_PUSHER_HOST || "10.0.2.2",
          wsPort: parseInt(process.env.EXPO_PUBLIC_PUSHER_PORT || "6001", 10),
          wssPort: parseInt(process.env.EXPO_PUBLIC_PUSHER_PORT || "6001", 10),
          forceTLS: false,
          disableStats: true,
          enabledTransports: ["ws"],
          cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER || "mt1",
        }
      );
      pusherRef.current = pusher;

      const channel = pusher.subscribe(`tasks.${COMPANY_CODE}`);
      channel.bind("App\\Events\\TaskUpdated", (data: any) => {
        console.log("Task updated:", data);
        const updatedTask = data.task;
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          )
        );
      });
      channel.bind("App\\Events\\TaskCreated", (data: any) => {
        console.log("Task created:", data);
        const newTask = data.task;
        if (isMounted) {
          setTasks((prevTasks) => [newTask, ...prevTasks]);
        }
      });
      channel.bind("App\\Events\\TaskDeleted", (data: any) => {
        console.log("Task deleted:", data);
        const deletedTaskId = data.taskId;
        if (isMounted) {
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== deletedTaskId)
          );
        }
      });
    };

    setupPusher();

    return () => {
      isMounted = false;
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Set up interval to fetch tasks every 15 seconds
      // const interval = setInterval(() => {
      //   fetchTasks();
      // }, 15000);
      // // Clean up interval when component is unfocused
      // return () => clearInterval(interval);
    }, [])
  );

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

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return styles.statusCompleted;
      case "in_progress":
        return styles.statusInProgress;
      case "pending":
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "pending":
      default:
        return "Pending";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: "/tasks/details",
      params: {
        id: task.id.toString(),
        name: task.name,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || "",
        completedAt: task.completedAt || "",
        userId: task.userId.toString(),
        userName: task.user.username,
        milestoneId: task.milestoneId.toString(),
        milestoneName: task.milestone.name,
        milestoneLongitudinal: task.milestone.longitudinal,
        milestoneLatitudinal: task.milestone.latitudinal,
        milestoneFavorite: task.milestone.favorite.toString(),
        milestoneCreatedAt: task.milestone.createdAt,
      },
    });
  };

  const filteredTasks = tasks
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.user.username.toLowerCase().includes(q)
      );
    })
    .filter((t) => !statusFilter || t.status.toLowerCase() === statusFilter);

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskName}>{item.name}</Text>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) },
          ]}
        >
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>

      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.milestone.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Due: {formatDate(item.dueDate)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.user.username}</Text>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={getStatusBadgeStyle(item.status)}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/tasks/new")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterChipsContainer}>
        {[
          { label: "All", value: "" },
          { label: "Pending", value: "pending" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
        ].map(({ label, value }) => (
          <TouchableOpacity
            key={value || "all"}
            style={[styles.chip, statusFilter === value && styles.chipActive]}
            onPress={() => setStatusFilter(value)}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === value && styles.chipTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="clipboard-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No tasks found</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push("/tasks/new")}
          >
            <Text style={styles.createButtonText}>Create Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={fetchTasks}
          refreshing={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#0066CC",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
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
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    color: "#999",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0066CC",
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  createButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#0066CC",
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskItem: {
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
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  taskDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  statusPending: {
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInProgress: {
    backgroundColor: "#5AC8FA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: "#34C759",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    paddingHorizontal: 12,
  },
  filterChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#E5E5EA",
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: "#0066CC",
  },
  chipText: {
    color: "#333",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#FFF",
  },
});

export default Tasks;
