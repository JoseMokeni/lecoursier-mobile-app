import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  username: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

const authService = {
  // Login function
  login: async (companyCode: string, username: string, password: string) => {
    const API_ENDPOINT = process.env.EXPO_PUBLIC_API_URL + "/login";
    try {
      console.log("API_ENDPOINT", API_ENDPOINT);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": companyCode,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: AuthResponse = await response.json();

      // Store auth data locally
      if (data.token && data.user) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error: Error | any) {
      console.error("Error during login:", error);
      return {
        error: error.message || "Login failed. Please try again.",
      };
    }
  },

  // Get logged in user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userDataString) {
        return JSON.parse(userDataString);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving current user:", error);
      return null;
    }
  },

  // Get authentication token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error retrieving auth token:", error);
      return null;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },
};

export default authService;
