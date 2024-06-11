import { RequestHandler } from "express";
import Topic from "../interfaces/Topic";
import * as TopicService from "../services/topic.service";
import { addTopicToCourse } from "../repositories/course.repository";

export const createTopic: RequestHandler = async (req, res, next) => {
  const { courseId } = req.params;
  const topicData: Topic = req.body;
  try {
    const newTopic = await TopicService.createNewTopicService(topicData);
    const newTopictoCourse = await addTopicToCourse(
      courseId,
      String(newTopic._id)
    );
    res.status(201).json(newTopic);
  } catch (error) {
    next(error);
  }
};

export const getTopic: RequestHandler = async (req, res, next) => {
  const { page = 1, limit = 10, ...query } = req.query;
  const parsedPage = parseInt(page as string, 10);
  const parsedLimit = parseInt(limit as string, 10);
  try {
    const allTopics = await TopicService.getAllTopicService(
      query,
      parsedPage,
      parsedLimit
    );
    res.status(200).json(allTopics);
  } catch (error) {
    next(error);
  }
};

export const updateTopic: RequestHandler = async (req, res, next) => {
  const { topicId } = req.params;
  const topicData: Topic = req.body;
  try {
    const updatedTopic = await TopicService.updateTopicService(
      topicId,
      topicData
    );
    res.status(200).json(updatedTopic);
  } catch (error) {
    next(error);
  }
};

export const deleteTopic: RequestHandler = async (req, res, next) => {
  const { topicId } = req.params;
  try {
    await TopicService.deleteTopicService(topicId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
