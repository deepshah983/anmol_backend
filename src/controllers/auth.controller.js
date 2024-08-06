import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user: { id: user._id, role: user.role } },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ msg: 'Login successful', token });
    } catch (err) {
        res.status(400).json({ msg: 'Error logging in', error: err.message });
    }
};

export default { login };
