import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Add a new user
const userAdd = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: "Email is already added.",
        details: "A user with this email already exists.",
      });
    }

    // Check if an admin already exists
    if (role === 'admin') {
      const adminExists = await User.findOne({ role: 'admin' });
      if (adminExists) {
        return res.status(400).json({
          error: true,
          message: "Admin already exists.",
          details: "Only one admin is allowed.",
        });
      }
    }

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role,
    });

    const savedUser = await user.save();
    res.status(200).json({
      msg: "User added successfully",
      data: savedUser,
    });
  } catch (error) {
    res.status(400).json({
      msg: "User not added",
      error,
    });
  }
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

    // Generate JWT tokens
    const accessToken = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
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

const refreshToken = async (req, res) => {
  const parseJwt = (token) => {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
  };

  const oldrefreshToken = req.body.refreshToken

  jwt.verify(oldrefreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
          return res.status(200).send({ error: true, message: "Authorization failed!" })
      }
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      const payload = parseJwt(token)
      const data = {
          id: payload.id,
          role: payload.role,
          email: payload.email
      }
      const accessToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '2h' })
      const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
      res.status(200).json({
          error: false,
          message: "Token Renewed.",
          accessToken,
          refreshToken
      })
  })
}
// Update Password
const updatePassword = async (req, res) => {
  const { old_password, new_password, confirm_password } = req.body;

  // Check if new password and confirm password match
  if (new_password !== confirm_password) {
    return res.status(400).json({
      error: true,
      message: "New password and confirm password do not match.",
    });
  }

  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found.",
      });
    }

    // Check if old password is correct
    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: "Old password is incorrect.",
      });
    }

    // Update password
    user.password = new_password; // The password will be hashed in the pre-save hook
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Error updating password.",
      details: error.message,
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
  refreshToken,
  updatePassword
};
