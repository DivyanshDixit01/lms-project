import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { uploadImage, deleteMediaFromCloudinary } from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateToken(res, user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.id;
    const { name, location, education } = req.body; // REMOVED: bio, website, occupation

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prepare update data
    const updatedData = {
      name: name || user.name,
      location: location || user.location,
      education: education || user.education,
    };

    // Handle profile picture upload if file exists
    if (req.file) {
      try {
        // Upload new image to Cloudinary
        const uploadResult = await uploadImage(req.file.path);
        updatedData.profilePicture = uploadResult.secure_url;

        // Delete old image from Cloudinary if exists
        if (user.profilePicture) {
          const publicId = user.profilePicture.split("/").pop().split(".")[0];
          await deleteMediaFromCloudinary(publicId);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// REMOVED: changePassword, deleteAccount, updatePreferences functions

export default { register, login, logout, getUser, updateUser };
