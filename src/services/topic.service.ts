import TopicModel from "../models/topic.model";
import * as TopicRepository from "../repositories/topic.repository";
import * as CourseRepository from "../repositories/course.repository";
import Topic from "../interfaces/Topic";
import createHttpError from "http-errors";
import { jwtDecode } from "jwt-decode";
import User from "../interfaces/User";
import extractPublicIdFromUrl from "../helpers/getImagePublicUrl";
import { v2 as cloudinary } from "cloudinary";

export const createNewTopicService = async (
  courseName: string,
  token: string,
  topicData: Topic
) => {
  const admin = jwtDecode<User>(token);
  const authHeader = admin;
  const course = await CourseRepository.findCourseByTitle(courseName);

  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  if (course.publisher != admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }
  const { topic_title, topic_description, parent_course, pdf } = topicData;

  if (!parent_course) {
    throw createHttpError(400, "Parent Course is required");
  }

  const missingFields = [];
  if (!topic_title) missingFields.push("Topic Title");
  if (!topic_description) missingFields.push("Topic Description");

  if (missingFields.length > 0) {
    throw createHttpError(400, `Missing fields: ${missingFields.join(", ")}`);
  }

  const existingTopic = await TopicRepository.findTopicByTitle(
    String(topic_title)
  );
  if (existingTopic) {
    throw createHttpError(409, "Topic already exists");
  }

  return await TopicRepository.createTopic(topicData);
};

export const getAllTopicService = async (courseName: string) => {
  return await TopicRepository.getAllTopics(courseName);
};

export const getTopicService = async (topicName: string) => {
  return await TopicRepository.getTopic(topicName);
};

export const updateTopicService = async (
  courseName: string,
  token: string,
  topicId: string,
  topicData: Topic
) => {
  const admin = jwtDecode<User>(token);
  const authHeader = admin;
  const course = await CourseRepository.findCourseByTitle(courseName);

  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  if (course.publisher != admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }
  if (!topicId) {
    throw createHttpError(400, "Topic ID is required");
  }
  const existingTopic = await TopicRepository.findById(topicId);
  if (!existingTopic) {
    throw createHttpError(404, "Topic not found");
  }
  return await TopicRepository.updateTopic(topicId, topicData);
};

export const deleteTopicService = async (
  topicName: string,
  courseName: string,
  token: string
) => {
  if (!topicName) {
    throw createHttpError(400, "Topic Name is required");
  }

  const admin = jwtDecode<User>(token);
  const course = await CourseRepository.findCourseByTitle(courseName);

  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  if (course.publisher !== admin.user_name) {
    throw createHttpError(403, "Unauthorized");
  }

  const topic = await TopicRepository.findTopicByTitle(topicName);

  if (!topic) {
    throw createHttpError(404, "Topic not found");
  }

  const deleteTopic = await TopicRepository.deleteTopic(topicName);

  if (!deleteTopic) {
    throw createHttpError(404, "Topic not found");
  }

  const pdfPublicId = extractPublicIdFromUrl(String(topic.pdf));
  const videoPublicId = extractPublicIdFromUrl(String(topic.video));
  console.log(pdfPublicId, videoPublicId);

  try {
    await cloudinary.uploader.destroy("uploads/" + String(videoPublicId), {
      resource_type: "video",
    });
    await cloudinary.uploader.destroy("uploads/" + String(pdfPublicId));
  } catch (error) {
    throw createHttpError(500, "Error deleting files from Cloudinary");
  }

  const removeTopicFromCourse = await TopicRepository.removeTopicFromCourse(
    course.course_title,
    String(topic._id)
  );

  if (!removeTopicFromCourse) {
    throw createHttpError(500, "Internal Server Error");
  }
};
