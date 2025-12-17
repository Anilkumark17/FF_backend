const express = require("express");
const app = express();
const { PORT } = require("./src/config");
const routes = require("./src/routes");

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
