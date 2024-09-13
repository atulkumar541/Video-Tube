import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // referesh token binding in user object
    await user.save({ validateBeforeSave: false }); // referesh token store in DB
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /*
    1. validation for all required feilds
    2. remove password
    3. generate access token
    4. generate refresh token to insert the users collection in the database
    5. Save post values to users DB
    6. Send response
    */
  const { fullName, username, email, password } = req.body;
  // if any of the fields are empty after trimming return true/false
  // then throw an error
  if (
    [fullName, username, email, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fiedls are required");
  }
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser)
    throw new ApiError(409, "User with Email or Username already exists");

  const avatarLocalFilePath = req.files?.avatar[0]?.path;
  // const coverImageLocalFilePath = req.files?.coverImage[0]?.path;

  let coverImageLocalFilePath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalFilePath = req.files.coverImage[0].path;
  }

  if (!avatarLocalFilePath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinary(avatarLocalFilePath);
  const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

  // console.log("avatar", avatar);

  if (!avatar) throw new ApiError(500, "Avatar upload failed");

  const userData = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(userData._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) throw new ApiError(500, "User creation failed");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
  1. get request body username or email and password
  2. validate username or email and password
  3. check in DB
  4. generate access token && generate refresh token
  5. send Cookies
  5. send response
  */
  const { username, email, password } = req.body;

  if (!(username || email))
    throw new ApiError(400, "Username or Email is required");

  if (!password) throw new ApiError(400, "Password is required");

  const getUser = await User.findOne({ $or: [{ email }, { username }] }); // find user by email or username
  if (!getUser) throw new ApiError(404, "User not found");

  const isPasswordMatch = await getUser.isPasswordCorrect(
    password,
    getUser.password
  );
  if (!isPasswordMatch) throw new ApiError(401, "Invalid User Credentials");

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(getUser._id);

  const loggedInUser = await User.findById(getUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  /*
    get id from req user
    remove cookies
    reset blanck refresh token
  */
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
