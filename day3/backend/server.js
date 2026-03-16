const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const embeddingRoutes = require("./routes/embedding.routes");
app.use("/api", embeddingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
