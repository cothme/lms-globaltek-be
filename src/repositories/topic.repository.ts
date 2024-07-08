import TopicModel from "../models/topic.model";
import Topic from "../interfaces/Topic";
import CourseModel from "../models/course.model";

export const findTopicByTitle = async (topic_title: string) => {
  return await TopicModel.findOne({ topic_title });
};

export const findById = async (_id: string) => {
  return await TopicModel.findOne({ _id });
};

export const createTopic = async (topicData: Topic) => {
  return await TopicModel.create(topicData);
};

export const getAllTopics = async (courseName: string) => {
  const course = await CourseModel.findOne({
    course_title: courseName,
  }).select("topics");

  const topicIds = course?.topics;
  const topics = await TopicModel.find({ _id: { $in: topicIds } });
  return topics;
};

export const getTopic = async (topicName: string) => {
  return await TopicModel.findOne({ topic_title: topicName });
};

export const updateTopic = async (_id: string, topicData: Topic) => {
  return await TopicModel.findByIdAndUpdate(_id, topicData, { new: true });
};

export const deleteTopic = async (topicName: string) => {
  return await TopicModel.findOneAndDelete({ topic_title: topicName });
};

export const removeTopicFromCourse = async (
  courseName: string,
  topicId: string
) => {
  return await CourseModel.updateMany(
    { course_title: courseName },
    { $pull: { topics: topicId } }
  );
};
