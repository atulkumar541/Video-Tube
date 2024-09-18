import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refereshAccessToken,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { verifyJWTToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//Secured Routes

router.route("/logout").post(verifyJWTToken, logoutUser);
router.route("refresh-token").post(refereshAccessToken);
router.route("/change-password").post(verifyJWTToken, changeCurrentPassword);
router.route("/current-user").get(verifyJWTToken, getCurrentUser);
router.route("/update-account").patch(verifyJWTToken, updateUserDetails);

router
  .route("/avatar")
  .patch(verifyJWTToken, upload.single("avatar"), updateUserAvatar);

router
  .route("/cover-image")
  .patch(verifyJWTToken, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:username").get(verifyJWTToken, getUserChannelProfile);
router.route("/history").get(verifyJWTToken, getWatchHistory);

export default router;
