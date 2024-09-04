import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Add a new user
const userAdd = (req, res) => {
 
  
  User.findOne({ email: req.body.email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: "Email is already added.",
          details: "A user with this email already exists.",
        });
      }
     console.log(req.body);
     
      const user = new User({
        userName: req.body.userName,
        email: req.body.email,
        phone: req.body.phone,
       // password: req.body.password,
       // role: req.body.role,
      });

      return user.save();
    })
    .then((user) => {
      res.status(200).json({
        message: "User added successfully",
        data: user,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "User not added",
        error,
      });
    });
};

// Get all users
const getAllUsers = (req, res) => {
  console.log("hello");
  User.find()
    .then((users) => {
      res.status(200).json({
        data: users,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "Error retrieving users",
        error,
      });
    });
};

// Get a single user by ID
const getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.status(200).json({
          data: user,
        });
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: "Error retrieving user",
        error,
      });
    });
};

// Update a user
const updateUser = (req, res) => {
  console.log(req.body);

  
  User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((user) => {
      res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "Error updating user",
        error,
      });
    });
};

// Delete a user
const deleteUser = (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) {
        res.status(200).json({
          message: "User deleted successfully",
        });
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        message: "Error deleting user",
        error,
      });
    });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
};

export default {
  userAdd,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};
