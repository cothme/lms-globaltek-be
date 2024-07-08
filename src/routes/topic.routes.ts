import express from "express";
const router = express.Router();
import * as TopicController from "../controllers/topic.controller";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
router.post(
  "/create/:courseName",
  [requireAdminAuth],
  TopicController.createTopic
);
router.get("/:courseName", TopicController.getTopics);
router.get("/getTopic/:topicName", TopicController.getTopic);
router.patch("/:topicId", requireAdminAuth, TopicController.updateTopic);
router.delete("/:topicName", requireAdminAuth, TopicController.deleteTopic);

export default router;
