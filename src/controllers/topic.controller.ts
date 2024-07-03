import { RequestHandler } from "express";
import Topic from "../interfaces/Topic";
import * as TopicService from "../services/topic.service";
import { addTopicToCourse } from "../repositories/course.repository";
import * as CourseRepository from "../repositories/course.repository";
import { isValidObjectId } from "mongoose";
import TopicModel from "../models/topic.model";
import { upload, uploadPdfToCloudinary } from "../helpers/pdfUpload";
import createHttpError from "http-errors";
import { uploadVideoToCloudinary } from "../helpers/videoUpload";

export const createTopic: RequestHandler = async (req, res, next) => {
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      return next(createHttpError(400, err.message));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files) {
      return next(createHttpError(400, "No files provided"));
    }

    const uploadFile = async (
      file: Express.Multer.File,
      uploadFunction: Function
    ) => {
      return new Promise<string>((resolve, reject) => {
        req.file = file;
        uploadFunction(req, res, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(req.body.cloudinaryUrl);
          }
        });
      });
    };

    try {
      const pdfUrl = files.pdf
        ? await uploadFile(files.pdf[0], uploadPdfToCloudinary)
        : null;
      const videoUrl = files.video
        ? await uploadFile(files.video[0], uploadVideoToCloudinary)
        : null;
      console.log(videoUrl, pdfUrl);

      const authHeader = String(req.headers.authorization);
      const { courseName } = req.params;
      const topicData: Topic = {
        ...req.body,
        pdf: pdfUrl ?? undefined,
        video: videoUrl ?? undefined,
        parent_course: courseName,
      };

      if (!courseName) {
        return res.status(404).json({ message: "Course not found" });
      }

      const newTopic = await TopicService.createNewTopicService(
        courseName,
        authHeader,
        topicData
      );
      console.log(newTopic);

      await addTopicToCourse(courseName, String(newTopic._id));

      return res.status(201).json(newTopic);
    } catch (error: any) {
      next(createHttpError(500, error.message));
    }
  });
};

export const getTopics: RequestHandler = async (req, res, next) => {
  const { courseName } = req.params;
  console.log(courseName);

  try {
    if (courseName === undefined) throw new Error("Course name is required");
    const topics = await TopicService.getAllTopicService(courseName);
    res.status(200).json({ topics });
  } catch (error) {
    next(error);
  }
};

export const getTopic: RequestHandler = async (req, res, next) => {
  const { topicName } = req.params;
  try {
    const topic = await TopicService.getTopicService(topicName);
    res.status(200).json(topic);
  } catch (error) {
    next(error);
  }
};

export const updateTopic: RequestHandler = async (req, res, next) => {
  const authHeader = String(req.headers.authorization);
  const { topicId } = req.params;
  const topicData: Topic = req.body;
  try {
    const topic = await TopicModel.findOne({ _id: topicId });
    const updatedTopic = await TopicService.updateTopicService(
      String(topic?.parent_course),
      authHeader,
      topicId,
      topicData
    );
    res.status(200).json(updatedTopic);
  } catch (error) {
    next(error);
  }
};

export const deleteTopic: RequestHandler = async (req, res, next) => {
  const authHeader = String(req.headers.authorization);
  const { topicId } = req.params;
  try {
    const topic = await TopicModel.findOne({ _id: topicId });
    await TopicService.deleteTopicService(
      topicId,
      String(topic?.parent_course),
      authHeader
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
