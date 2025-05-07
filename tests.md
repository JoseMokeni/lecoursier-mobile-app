# Test Cases Documentation

This document describes the test cases and assertions for the main features and components of the project.

## app/**tests**/login.test.tsx

**Tested Component:** `app/login.tsx`

### Test Cases

- **Renders all input fields and login button**
  - Asserts that the company code, username, and password fields, and the login button are rendered.
- **Shows alert if required fields are missing**
  - Asserts that an alert is shown if any required field is empty when attempting to log in.
- **Toggles password visibility**
  - Asserts that pressing the eye icon toggles the password field's `secureTextEntry` prop.
- **Calls login with correct arguments**
  - Asserts that the login function is called with the correct company code, username, and password.

## components/**tests**/AuthGuard.test.tsx

**Tested Component:** `components/AuthGuard.tsx`

### Test Cases

- **Renders children when authenticated and not loading**
  - Asserts that the children are rendered if the user is authenticated and not loading.
- **Shows loading spinner when loading**
  - Asserts that an ActivityIndicator is rendered when the loading state is true.

## services/**tests**/authService.test.ts

**Tested Service:** `services/authService.ts`

### Test Cases

- **login**
  - Logs in successfully as admin: Asserts that the correct data is returned and stored.
  - Returns error for invalid credentials: Asserts that an error is returned for 401 responses.
  - Returns error for non-admin user: Asserts that only admins can log in.
  - Returns error on fetch failure: Asserts that network errors are handled.
- **getCurrentUser**
  - Returns user if present in storage.
  - Returns null if not present.
- **getCompanyCode**
  - Returns company code if present.
  - Returns null if not present.
- **getToken**
  - Returns token if present.
  - Returns null if not present.
- **logout**
  - Removes auth and user data from storage.
- **isAuthenticated**
  - Returns true if token exists.
  - Returns false if token does not exist.

## services/**tests**/apiService.test.ts

**Tested Service:** `services/apiService.ts`

### Test Cases

- **Makes a successful GET request and returns data**
  - Asserts that data is returned for a successful GET request.
- **Calls logout and throws if token or company code is missing**
  - Asserts that the logout handler is called and an authentication error is thrown if token or company code is missing.
- **Calls logout and throws on 401**
  - Asserts that the logout handler is called and a session expired error is thrown on 401 response.
- **Calls logout and throws on 403**
  - Asserts that the logout handler is called and an access denied error is thrown on 403 response.
- **Handles non-JSON 204 response**
  - Asserts that null is returned for a 204 No Content response.
- **Throws error for non-OK, non-JSON response**
  - Asserts that an error is thrown with the response text for non-OK, non-JSON responses.
- **Makes a successful POST request**
  - Asserts that data is returned for a successful POST request.

---

Add new test cases and assertions here as you expand test coverage for other components, screens, and services.
