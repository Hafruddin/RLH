// backend/routes/authRouter.js — Unified Authentication Routes
import express from "express";
import { login, getMe, switchRole, getDemoUsers } from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/rbacAuth.js";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.get("/me", authenticateUser, getMe);
authRouter.post("/switch-role", switchRole);
authRouter.get("/demo-users", getDemoUsers);

export default authRouter;
