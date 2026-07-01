require("dotenv").config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev_jwt_secret_change_me";
  console.warn("JWT_SECRET was missing; using a development fallback secret.");
}

const app = require("./app");
const connectDB = require("./config/database");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
