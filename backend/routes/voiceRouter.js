// backend/routes/voiceRouter.js
import express from "express";
import {
  VOICE_AGENTS,
  getSignedConversationUrl,
  processVoiceTurn,
  voiceAnalyticsStore
} from "../services/voiceAgentService.js";

const voiceRouter = express.Router();

/**
 * 1. GET /api/voice/agents - Public list of configured agents (No Secrets)
 */
voiceRouter.get("/agents", (req, res) => {
  const safeAgents = Object.entries(VOICE_AGENTS).map(([key, val]) => ({
    type: key,
    name: val.name,
    role: val.role,
    description: val.description
  }));
  res.status(200).json({ success: true, agents: safeAgents });
});

/**
 * 2. GET /api/voice/session/:agentType - ElevenLabs Signed URL or Hybrid Session
 */
voiceRouter.get("/session/:agentType", async (req, res) => {
  try {
    const { agentType = "concierge" } = req.params;
    const sessionData = await getSignedConversationUrl(agentType);
    res.status(200).json(sessionData);
  } catch (err) {
    res.status(500).json({
      success: false,
      isFallback: true,
      message: err.message
    });
  }
});

/**
 * 3. POST /api/voice/converse - Natural Language Action Layer with DB Mutation
 */
voiceRouter.post("/converse", async (req, res) => {
  try {
    const { message, context, currentAgent } = req.body || {};
    const user = {
      id: req.auth?.userId || "user_patient_demo",
      role: req.headers["x-user-role"] || "patient",
      name: "Rahul Kumar"
    };

    const turnResult = await processVoiceTurn({
      message,
      context,
      user,
      currentAgent
    });

    res.status(200).json(turnResult);
  } catch (err) {
    res.status(500).json({
      success: false,
      errorCode: "VOICE_TURN_ERROR",
      message: err.message
    });
  }
});

/**
 * 4. GET /api/voice/analytics - Live stats for Admin AI Agent Monitor
 */
voiceRouter.get("/analytics", (req, res) => {
  res.status(200).json({
    success: true,
    data: voiceAnalyticsStore
  });
});

export default voiceRouter;
