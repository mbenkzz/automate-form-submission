import express from "express";
import crawlSite from 'module';

const router = express.Router();

module.exports = (app) => {

  router.get("/", crawlSite);

  app.use("/submission", router);
};

export default routes;