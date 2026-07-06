import { connectDB } from "./config/db.js";
import app from "./app.js"; // also loads .env — see the comment there

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
