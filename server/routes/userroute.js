import express from "express";
import multer from "multer";
import {
  register,
  login,
  getUser,
  logout,
  updateUser,
  // REMOVED: changePassword, deleteAccount, updatePreferences
} from "../controllers/usercontroller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getUser);
router.put("/profile", isAuthenticated, upload.single("profilePicture"), updateUser);

// REMOVED: /change-password, /account, /preferences routes

export default router;