import express from "express";
// import routes from "./routes/routes.submission.js";
import router from "./app/routes/routes.submission.js";

const app = express();
const port = 3000;

app.use(express.static("storage"));

// parse requests of content-type - application/json
app.use(express.json());

// call routes from routes.submission.js
app.use("/", router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

export default app;