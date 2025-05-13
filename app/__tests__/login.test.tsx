import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "../login";
import { Alert } from "react-native";

jest.mock("expo-router", () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock("@/context/AuthContext", () => ({ useAuth: jest.fn() }));

const mockLogin = jest.fn();
const mockUseAuth = require("@/context/AuthContext").useAuth;
mockUseAuth.mockReturnValue({ login: mockLogin });

jest.spyOn(Alert, "alert");

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all input fields and login button", () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    expect(getByPlaceholderText("Enter company code")).toBeTruthy();
    expect(getByPlaceholderText("Enter username")).toBeTruthy();
    expect(getByPlaceholderText("Enter password")).toBeTruthy();
    expect(getByText("Log In")).toBeTruthy();
  });

  it("shows alert if required fields are missing", async () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Log In"));
    expect(Alert.alert).toHaveBeenCalledWith(
      "Input Required",
      expect.any(String)
    );
  });

  it("toggles password visibility", () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText("Enter password");
    const eyeButton = getByTestId("toggle-password-visibility");
    expect(passwordInput.props.secureTextEntry).toBe(true);
    fireEvent.press(eyeButton);
    // After toggle, secureTextEntry should be false
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it("calls login with correct arguments", async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("Enter company code"), "acme");
    fireEvent.changeText(getByPlaceholderText("Enter username"), "john");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "secret");
    fireEvent.press(getByText("Log In"));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("acme", "john", "secret");
    });
  });
});
