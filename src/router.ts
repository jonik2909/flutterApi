import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Welcome Flutter API!");
});

export default router;
