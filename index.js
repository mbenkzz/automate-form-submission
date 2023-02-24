import express from "express";
// import routes from "./routes/routes.submission.js";
import routes from "module";

const app = express();
const port = 3000;

app.use(express.static("storage"));

// parse requests of content-type - application/json
app.use(express.json());

// call routes from routes.submission.js
routes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

