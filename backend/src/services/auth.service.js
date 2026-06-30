const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

const login = async (username, password) => {
    // Tìm user theo username
    const user = await User.findOne({ username });

    if (!user) {
        throw new Error("Invalid username or password");
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
        throw new Error("Account has been deactivated");
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid username or password");
    }

    // Tạo JWT
    const token = generateToken({
        id: user._id,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
            referenceId: user.referenceId,
        },
    };
};

module.exports = {
    login,
};