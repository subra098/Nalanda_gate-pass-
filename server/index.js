import app from "./src/app.js";

const PORT = 5001; // Forced to bypass blocked port 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (Accessible on network)`);
});
