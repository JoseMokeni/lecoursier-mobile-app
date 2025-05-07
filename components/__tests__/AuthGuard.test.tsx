import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { AuthGuard } from "../AuthGuard";

// Mock dependencies
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSegments: () => ["(tabs)"],
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require("@/context/AuthContext").useAuth;

describe("AuthGuard", () => {
  it("renders children when authenticated and not loading", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    const { getByText } = render(
      <AuthGuard>
        <Text>Protected Content</Text>
      </AuthGuard>
    );
    expect(getByText("Protected Content")).toBeTruthy();
  });

  it("shows loading spinner when loading", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    const { getByTestId } = render(
      <AuthGuard>
        <Text>Protected Content</Text>
      </AuthGuard>
    );
    expect(getByTestId("ActivityIndicator")).toBeTruthy();
  });
});
