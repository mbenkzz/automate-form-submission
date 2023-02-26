import express from "express";
import router from "./app/routes/routes.submission.js";

const app = express();
const port = 3000;

app.use(express.static("storage"));

// parse requests of content-type - application/json
app.use(express.json());

// call routes from routes.submission.js
app.use("/submission", router);

// route for root
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the submission app." });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

export default app;