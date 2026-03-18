import express from "express";
import { processStrings, searchEmbeddings } from "../controllers/embeddingController.js";

const router = express.Router();

router.post("/process", processStrings);
router.post("/search", searchEmbeddings);

export default router;
