const express = require("express");
const router = express.Router();
const { matchStrings } = require("../controllers/embedding.controller");

router.post("/match", matchStrings);

module.exports = router;
