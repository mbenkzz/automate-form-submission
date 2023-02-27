import express from "express";
import submissionController from '../controller/submission.controller.js';

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/submission", (req, res) => {
  submissionController.crawlSite(req, res);
});

router.get("/recaptcha", (req, res) => {
  submissionController.recaptcha(req, res);
});

router.get("/capycaptcha", (req, res) => {
  submissionController.capycaptcha(req, res);
});

router.get("/normalcaptcha", (req, res) => {
  submissionController.captcha(req, res);
});

export default router;