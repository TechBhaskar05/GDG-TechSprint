import crypto from "crypto";
import bcrypt from "bcrypt";

import { User } from "../models/user.model.js"; // whatever file name is
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { generateOTP } from "../utils/generateOtp.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, wardId } = req.body;

  if (!name || !email || !password)
    throw new ApiError(400, "Name, email & password are required");

  if (!["citizen", "authority"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  if (role === "authority" && !wardId) {
    throw new ApiError(400, "Ward ID is required for authority");
  }

  let user = await User.findOne({ email });

  if (user && user.isVerified)
    throw new ApiError(400, "Email already registered");

  const otp = generateOTP();

  if (!user) {
    user = await User.create({
      name,
      email,
      password,
      role,
      wardId : role==="authority" ? wardId : null,
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
      },
    });
  } else {
    user.otp = {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    await user.save();
  }

  await sendEmail(
    email,
    "CivicFix AI – Email Verification OTP",
    `<h2>Your OTP is: <b>${otp}</b></h2>`
  );

  return res.json(new ApiResponse(200,
    {
      email,
      role,
      
    }
    , "OTP sent to email"));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.otp?.code) throw new ApiError(400, "No OTP generated");

  if (user.otp.expiresAt < new Date()) throw new ApiError(400, "OTP expired");

  if (user.otp.code !== otp) throw new ApiError(400, "Invalid OTP");

  user.isVerified = true;
  user.otp = undefined;

  await user.save();

  return res.json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      "Email verified successfully"
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  console.log("step 1 done");
  const { email, password, role } = req.body;

  console.log(role);
  

  if (!email || !password || !role)
    throw new ApiError(400, "Email & password & role required");
  console.log("step 1 done");

  const user = await User.findOne({ email, role });
  if (!user) throw new ApiError(400, "Invalid credentials");
  console.log("step 1 done");
  if (!user.isVerified)
    throw new ApiError(401, "Please verify your email first");
  console.log("step 1 done");

  const isMatch = await user.isPasswordCorrect(password);
  console.log("step 1 done");
  console.log(isMatch);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");
  console.log("step 1 done");

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
      {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          wardId: user.wardId
        },
        accessToken,
        refreshToken,
      },
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
