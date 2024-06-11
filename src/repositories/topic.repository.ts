import TopicModel from "../models/topic.model";
import Topic from "../interfaces/Topic";

export const findTopicByTitle = async (topic_title: string) => {
  return await TopicModel.findOne({ topic_title });
};

export const findById = async (_id: string) => {
  return await TopicModel.findOne({ _id });
};

export const createTopic = async (topicData: Topic) => {
  return await TopicModel.create(topicData);
};

export const getAllTopics = async (
  query: Topic,
  page: number,
  limit: number
) => {
  const allTopics = await TopicModel.find();
  const offset = (page - 1) * limit;

  const topics = await TopicModel.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return { topics, allTopics: allTopics.length };
};

export const updateTopic = async (_id: string, topicData: Topic) => {
  return await TopicModel.findByIdAndUpdate(_id, topicData, { new: true });
};

export const deleteTopic = async (_id: string) => {
  return await TopicModel.findByIdAndDelete(_id);
};
