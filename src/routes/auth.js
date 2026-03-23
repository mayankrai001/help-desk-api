const express = require("express");
const router = express.Router();

const { signup, login, microsoftLogin, microsoftCallback } = require("../controllers/auth");

router.post("/signup", signup);
router.post("/login", login);
router.get("/microsoft", microsoftLogin);
router.get("/microsoft/callback", microsoftCallback);

module.exports = router;
