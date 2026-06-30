const authService = require("../services/auth.service");

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required",
            });
        }

        const result = await authService.login(username, password);

        return res.status(200).json({
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            message: error.message,
        });
    }
};

module.exports = {
    login,
};