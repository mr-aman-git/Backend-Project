import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uplodonCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // STEP 1 - GET USER DETAILS FROM FRONTEND
  // STEP 2 - VALIDATION-NOT EMPTY
  // STEP 3 - CHECK IF USER ALREADY EXIST: USERNAME, EMAIL
  // STEP 4 - CHECK FOR IMAGES AND AVATAR OR FILE
  // STEP 5 - UPLOAD CLOUDINARY THEM
  // STEP 6 - CREATE USER OBJECT-CREATE ENTRY IN DB
  // STEP 7 - REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM RESPONSE
  // STEP 8 - CHECK FOR USER CREATION
  // STEP 9 - RETURN RES

  // STEP 1 - GET USER DETAILS FROM FRONTEND
  const { fullname, username, email, password } = req.body;

  // STEP 2 - VALIDATION-NOT EMPTY
  if (fullname == "") {
    throw new ApiError(400, "fullname is required");
  }
  if (username == "") {
    throw new ApiError(400, "username is required");
  }
  if (email == "") {
    throw new ApiError(400, "email is required");
  }
  if (password == "") {
    throw new ApiError(400, "password is required");
  }

  // STEP 3 - CHECK IF USER ALREADY EXIST: USERNAME, EMAIL
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email and Username Already exist");
  }

  // STEP 4 - CHECK FOR IMAGES AND AVATAR OR FILE

  const avtarLocalPath = req.files?.avtar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path || "";
  let coverImageLocalPath = "";

  if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avtarLocalPath) {
    throw new ApiError(400, "Avtar Image Required");
  }
  // STEP 5 - UPLOAD CLOUDINARY THEM
  const avtar = await uplodonCloudinary(avtarLocalPath);
  const coverImage = await uplodonCloudinary(coverImageLocalPath);

  if (!avtar) {
    throw new ApiError(400, "Avatar Image not Upload");
  }

  // STEP 6 - CREATE USER OBJECT-CREATE ENTRY IN DB

  const user = await User.create({
    fullname,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    email,
    password,
  });

  // STEP 7 - REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM RESPONSE
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // STEP 8 - CHECK FOR USER CREATION
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  // STEP 9 - RETURN RES
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user Register Successfull"));
});

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accesToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating acces and refresh token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "password incorrect");
  }

  const { refreshToken, accesToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesToken", accesToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accesToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accesToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorize Token");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh Token is expired or used");
    }

    const { accesToken, newRefreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accesToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          201,
          { accesToken, newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?.id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "current user fetch successfully");
});

export {
  registerUser,
  loginUser,
  userLogout,
  refreshToken,
  changeCurrentPassword,
  getCurrentUser,
};
