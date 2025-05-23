import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";
import { use } from "react";
import { ApiResponse } from "../utils/ApiResponse.js";
dotenv.config({ path: "./.env" });

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accesToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthoraise request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiResponse(401, "invalid Access Token User");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.msg || "invalid access token");
  }
});
