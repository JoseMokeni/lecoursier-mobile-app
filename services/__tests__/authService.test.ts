import authService from "../authService";

// Mocks
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
const AsyncStorage = require("@react-native-async-storage/async-storage");

global.fetch = jest.fn();

const mockUser = {
  username: "adminuser",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
};
const mockToken = "mock-token";
const mockCompanyCode = "company123";

describe("authService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("logs in successfully as admin", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });
      const result = await authService.login(
        mockCompanyCode,
        "adminuser",
        "pass"
      );
      expect(result).toEqual({ token: mockToken, user: mockUser });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "auth_token",
        mockToken
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "user_data",
        JSON.stringify(mockUser)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "company_code",
        mockCompanyCode
      );
    });

    it("returns error for invalid credentials", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid credentials" }),
      });
      const result = await authService.login(
        mockCompanyCode,
        "baduser",
        "badpass"
      );
      expect(result).toEqual({ error: "Invalid credentials" });
    });

    it("returns error for non-admin user", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: mockToken,
          user: { ...mockUser, role: "user" },
        }),
      });
      const result = await authService.login(mockCompanyCode, "user", "pass");
      expect(result).toEqual({
        error: "Unauthorized access. Only admins can log in.",
      });
    });

    it("returns error on fetch failure", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));
      const result = await authService.login(
        mockCompanyCode,
        "adminuser",
        "pass"
      );
      expect(result.error).toMatch(/Network error/);
    });
  });

  describe("getCurrentUser", () => {
    it("returns user if present in storage", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));
      const user = await authService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });
    it("returns null if not present", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe("getCompanyCode", () => {
    it("returns company code if present", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(mockCompanyCode);
      const code = await authService.getCompanyCode();
      expect(code).toBe(mockCompanyCode);
    });
    it("returns null if not present", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      const code = await authService.getCompanyCode();
      expect(code).toBeNull();
    });
  });

  describe("getToken", () => {
    it("returns token if present", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      const token = await authService.getToken();
      expect(token).toBe(mockToken);
    });
    it("returns null if not present", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      const token = await authService.getToken();
      expect(token).toBeNull();
    });
  });

  describe("logout", () => {
    it("removes auth and user data from storage", async () => {
      await authService.logout();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("auth_token");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user_data");
    });
  });

  describe("isAuthenticated", () => {
    it("returns true if token exists", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(mockToken);
      const result = await authService.isAuthenticated();
      expect(result).toBe(true);
    });
    it("returns false if token does not exist", async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      const result = await authService.isAuthenticated();
      expect(result).toBe(false);
    });
  });
});
