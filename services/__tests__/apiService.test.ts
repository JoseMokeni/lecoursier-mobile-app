import apiService from "../apiService";

jest.mock("../authService", () => ({
  getToken: jest.fn(),
  getCompanyCode: jest.fn(),
  logout: jest.fn(),
}));
const authService = require("../authService");

global.fetch = jest.fn();

describe("apiService", () => {
  const mockLogout = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.setup(mockLogout);
  });

  it("makes a successful GET request and returns data", async () => {
    authService.getToken.mockResolvedValue("token");
    authService.getCompanyCode.mockResolvedValue("company");
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify({ foo: "bar" }),
    });
    const data = await apiService.get("/test");
    expect(data).toEqual({ foo: "bar" });
  });

  it("calls logout and throws if token or company code is missing", async () => {
    authService.getToken.mockResolvedValue(null);
    authService.getCompanyCode.mockResolvedValue("company");
    await expect(apiService.get("/test")).rejects.toThrow(
      /Authentication required/
    );
    expect(mockLogout).toHaveBeenCalled();
  });

  it("calls logout and throws on 401", async () => {
    authService.getToken.mockResolvedValue("token");
    authService.getCompanyCode.mockResolvedValue("company");
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify({ message: "Unauthorized" }),
      json: async () => ({ message: "Unauthorized" }),
    });
    await expect(apiService.get("/test")).rejects.toThrow(
      /session has expired/
    );
    expect(mockLogout).toHaveBeenCalled();
  });

  it("calls logout and throws on 403", async () => {
    authService.getToken.mockResolvedValue("token");
    authService.getCompanyCode.mockResolvedValue("company");
    fetch.mockResolvedValue({
      ok: false,
      status: 403,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify({ message: "Forbidden" }),
      json: async () => ({ message: "Forbidden" }),
    });
    await expect(apiService.get("/test")).rejects.toThrow(/Access denied/);
    expect(mockLogout).toHaveBeenCalled();
  });

  it("handles non-JSON 204 response", async () => {
    authService.getToken.mockResolvedValue("token");
    authService.getCompanyCode.mockResolvedValue("company");
    fetch.mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => null },
      text: async () => "",
    });
    const data = await apiService.delete("/test");
    expect(data).toBeNull();
  });

  it("throws error for non-OK, non-JSON response", async () => {
    authService.getToken.mockResolvedValue("token");
    authService.getCompanyCode.mockResolvedValue("company");
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => null },
      text: async () => "Server error",
    });
    await expect(apiService.get("/test")).rejects.toThrow(/Server error/);
  });

  it("makes a successful POST request", async () => {
    authService.getToken.mockResolvedValue("token");
    authService.getCompanyCode.mockResolvedValue("company");
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify({ created: true }),
    });
    const data = await apiService.post("/test", { foo: "bar" });
    expect(data).toEqual({ created: true });
  });
});
