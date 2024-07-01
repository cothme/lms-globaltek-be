import express from "express";
const router = express.Router();
import * as TopicController from "../controllers/topic.controller";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
router.post("/create/:courseId", requireAdminAuth, TopicController.createTopic);
router.get("/", TopicController.getTopic);
router.patch("/:topicId", requireAdminAuth, TopicController.updateTopic);
router.delete("/:topicId", requireAdminAuth, TopicController.deleteTopic);

export default router;
