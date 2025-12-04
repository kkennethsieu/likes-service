import express from "express";
import likesRoutes from "./routes/likesRoutes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8000",
      "http://localhost:4000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Likes microservice is running");
});

app.use("/likes", likesRoutes);

const PORT = process.env.LIKES_PORT || 7060;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on ${PORT}`);
});
