const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  citizenAIChat,
} = require("../controllers/citizenAIController");

const router = express.Router();

router.post(
  "/chat",
  protect,
  citizenAIChat
);

module.exports = router;