import express from "express";
import submissionController from '../controller/submission.controller.js';

const router = express.Router();

router.get("/", async (req, res) => {
  await submissionController.crawlSite;
});

export default router;