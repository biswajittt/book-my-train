import dotenv from "dotenv";
dotenv.config();
import supabase from "../supabase.js";

export const protectRoute = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    return res.status(401).json({ error: "Invalid token" });

  req.user = data.user; // Attach user info to request
  next();
};
