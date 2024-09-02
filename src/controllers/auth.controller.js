import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    let { email, password } = req.body;

    // Trim email and password
    email = email.trim();
    password = password.trim();
    
    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials',
                code: 400
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials',
                code: 400
            });
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            { user: { id: user._id, role: user.role } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            success: true,
            msg: 'Login successful',
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            code: 200
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: 'Error logging in',
            error: err.message,
            code: 500
        });
    }
};

export default { login };
