import express from "express";
import "dotenv/config.js";
import authRoutes from "./features/auth/index.js";
import inviteRoutes from "./features/invite/index.js";
import passwordResetRoutes from "./features/password-reset/index.js";
import contentRoutes from "./features/content/index.js";
import pagesRoutes from "./features/pages/index.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes)
app.use("/api/invite", inviteRoutes);
app.use("/api", passwordResetRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/pages", pagesRoutes)

app.get('/', (req, res) => {
  res.send('Backend Server is running!');
});


app.listen(PORT, () => {
  console.log(`Node.js server listening on port ${PORT}`);
});
