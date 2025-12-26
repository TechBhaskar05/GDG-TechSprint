import crypto from "crypto";
import bcrypt from "bcrypt";

import { User } from "../models/user.model.js"; // whatever file name is
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, wardId } = req.body;

  if (!name || !email || !password)
    throw new ApiError(400, "Name, email & password are required");

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, "Email already registered");

  const user = await User.create({
    name,
    email,
    password,
    role,
    wardId,
  });

  // Access token
  const accessToken = user.generateAccessToken();

  // Create raw refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");

  await user.addRefreshSession(
    refreshToken,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    req.headers["user-agent"],
    req.ip
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
      "User registered successfully"
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, "Email & password required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid credentials");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");

  const accessToken = user.generateAccessToken();

  const refreshToken = crypto.randomBytes(40).toString("hex");

  await user.addRefreshSession(
    refreshToken,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    req.headers["user-agent"],
    req.ip
  );

  return res.json(
    new ApiResponse(
      200,
      { accessToken, refreshToken },
      "Logged in successfully"
    )
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshSessions"
  );

  return res.json(new ApiResponse(200, user, "User fetched successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) throw new ApiError(401, "Refresh token required");

  // Get all users with refresh sessions
  const users = await User.find({ "refreshSessions.0": { $exists: true } });

  let foundUser = null;
  let foundSession = null;

  for (const user of users) {
    for (const session of user.refreshSessions) {
      const match = await bcrypt.compare(refreshToken, session.tokenHash);

      if (match) {
        foundUser = user;
        foundSession = session;
        break;
      }
    }

    if (foundUser) break;
  }

  if (!foundUser) throw new ApiError(401, "Invalid refresh token");

  if (foundSession.expiresAt < new Date())
    throw new ApiError(401, "Refresh token expired");

  // generate new access token
  const accessToken = foundUser.generateAccessToken();

  return res.json(
    new ApiResponse(200, { accessToken }, "Access token refreshed")
  );
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  const user = await User.findById(req.user._id);

  user.refreshSessions = await Promise.all(
    user.refreshSessions.map(async (s) => {
      const match = await bcrypt.compare(refreshToken, s.tokenHash);
      return match ? null : s;
    })
  );

  user.refreshSessions = user.refreshSessions.filter(Boolean);

  await user.save();

  return res.json(new ApiResponse(200, null, "Logged out successfully"));
});
