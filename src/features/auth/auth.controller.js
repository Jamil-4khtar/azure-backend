import { asyncHandler } from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/response.js";
import { loginUser, registerUserWithInvite } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { token, name, password } = req.body;

  const newUser = await registerUserWithInvite({ token, name, password });

  // strip password before sending
  const { password: _omit, ...safeUser } = newUser;

  return successResponse(
    res,
    { user: safeUser },
    "User registered successfully",
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);

  // result may contain tokens + user depending on your service
  return successResponse(res, result, "Login successful");
});

export const getProfile = asyncHandler(async (req, res) => {
  const { password: _omit, ...safeUser } = req.user || {};

  return successResponse(
    res,
    { user: safeUser },
    "Profile retrieved successfully"
  );
});
