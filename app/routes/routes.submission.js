import express from "express";
import submissionController from '../controller/submission.controller.js';

const router = express.Router();

router.get("/", (req, res) => {

  submissionController.crawlSite(req, res);
});

export default router;