import TopicModel from "../models/topic.model";
import * as TopicRepository from "../repositories/topic.repository";

import Topic from "../interfaces/Topic";
import createHttpError from "http-errors";

export const createNewTopicService = async (topicData: Topic) => {
  const { topic_title, topic_description, parent_course } = topicData;
  if (!parent_course) throw createHttpError(400, "Parent Course is required");
  const missingFields = [];
  if (!topic_title) missingFields.push("Topic Title");
  if (!topic_description) missingFields.push("Topic Description");

  if (missingFields.length > 0) {
    throw createHttpError(400, `Missing fields: ${missingFields.join(", ")}`);
  }

  if (topic_title) {
    const existingTopic = await TopicRepository.findTopicByTitle(topic_title);
    if (existingTopic) {
      throw createHttpError(409, "Topic already exists");
    }
  } else {
    throw createHttpError(404, "Topic undefined");
  }

  return await TopicRepository.createTopic(topicData);
};

export const getAllTopicService = async (
  query: Topic,
  page: number,
  limit: number
) => {
  return await TopicRepository.getAllTopics(query, page, limit);
};

export const updateTopicService = async (topicId: string, topicData: Topic) => {
  if (!topicId) {
    throw createHttpError(400, "Topic ID is required");
  }
  const existingTopic = await TopicRepository.findById(topicId);
};

export const deleteTopicService = async (topicId: string) => {
  if (!topicId) {
    throw createHttpError(400, "Topic ID is required");
  }
  const existingTopic = await TopicRepository.findById(topicId);
};
