import app from "./app.js";

const PORT = process.env.LIKES_PORT || 7060;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on ${PORT}`);
});
