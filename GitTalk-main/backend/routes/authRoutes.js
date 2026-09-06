const express = require("express");
const { register, login, logout } = require("../controllers/authController.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", require("../middleware/authMiddleware"), require("../controllers/authController").getMe);

module.exports = router;
