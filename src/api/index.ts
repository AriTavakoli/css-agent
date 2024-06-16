import express from "express";
import MessageResponse from "../interfaces/MessageResponse";
import suggestions from "./routes/suggestion";
import clearIndex from "./routes/vector/clearIndex";
import context from "./routes/vector/context";
import embedding from "./routes/vector/embed";
import generate from "./routes/vector/generate-data";
import graph from "./routes/edit-graph";
import assistant from "./routes/assistants/assistant";
import agent from "./routes/multi-agent";
import initializeAssistant from "./routes/assistants/initalize-assistants";
import clearAssistants from "./routes/assistants/clear-assistants";
import listAssistants from "./routes/assistants/list-assistants";
const router = express.Router();
// router.use('/suggestions', temp)
router.use("/suggestions", suggestions);
router.use("/clearIndex", clearIndex);
router.use("/context", context);
router.use("/embedding", embedding);
router.use("/generate-data", generate);
router.use("/graph", graph);
router.use("/agent", agent);
router.use('/assistant', assistant);
router.use('/initialize-assistants', initializeAssistant);
router.use('/clear-assistants', clearAssistants);
router.use('/list-assistants', listAssistants);


export default router;
