import express from "express";
const router = express.Router();
import * as TopicController from "../controllers/topic.controller";

router.post("/create/:courseId", TopicController.createTopic);
router.get("/", TopicController.getTopic);
router.patch("/:topicId", TopicController.updateTopic);
router.delete("/:topicId", TopicController.deleteTopic);

export default router;
