import {
  findCourseByCodeOrTitle,
  createCourse,
  getAllCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  getPublishedCourses,
} from "../repositories/course.repository";
import createHttpError from "http-errors";
import Course from "../interfaces/Course";
import { jwtDecode } from "jwt-decode";
import mongoose from "mongoose";
import User from "../interfaces/User";

export const createNewCourseService = async (courseData: Course) => {
  const {
    course_title,
    course_description,
    course_code,
    publisher,
    difficulty,
    required_subscription,
    published,
  } = courseData;

  if (
    ![
      course_title,
      course_code,
      course_description,
      required_subscription,
    ].every(Boolean)
  ) {
    throw createHttpError(400, "Missing fields!");
  }
  if (!course_title) {
    throw createHttpError(400, "Course must have a title");
  }

  const existingCourse = await findCourseByCodeOrTitle(
    course_code,
    course_title
  );
  if (existingCourse) {
    throw createHttpError(409, "Course already exists");
  }

  return await createCourse({
    course_title,
    course_description,
    course_code,
    publisher,
    difficulty,
    required_subscription,
    published,
  });
};

export const fetchAllCoursesService = async () => {
  return getAllCourse();
};

export const fetchCourseByIdService = async (courseId: string) => {
  const course = await getCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  return course;
};

export const updateCourseService = async (
  courseData: Course,
  token: string,
  courseId: string
) => {
  const authHeader = token;
  const {
    course_title,
    course_description,
    course_code,
    required_subscription,
    published,
  } = courseData;
  const admin = jwtDecode<User>(authHeader);
  if (!mongoose.isValidObjectId(courseId)) {
    throw createHttpError(500, "Invalid Course ID");
  }
  if (
    ![
      course_title,
      course_description,
      course_code,
      required_subscription,
    ].every(Boolean)
  ) {
    throw createHttpError(400, "Parameters missing");
  }
  const course = await getCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  if (course.publisher != admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }
  console.log(course.publisher + admin?.user_name);
  return await updateCourse(courseId, {
    course_title,
    course_description,
    course_code,
    required_subscription,
    published,
  });
};

export const deleteCourseService = async (courseId: string, token: string) => {
  const admin = jwtDecode<User>(token);
  const authHeader = admin;
  if (!authHeader) {
    throw createHttpError(401, "Authorization header is missing");
  }

  if (!mongoose.isValidObjectId(courseId)) {
    throw createHttpError(400, "Invalid course ID");
  }

  const course = await getCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  if (course.publisher != admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }
  return deleteCourse(courseId);
};

export const publishCourseService = async (courseId: string, token: string) => {
  const admin = jwtDecode<User>(token);
  const course = await getCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  if (course.publisher != admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }
  return publishCourse(courseId);
};

export const getPublishedCoursesService = async () => {
  return getPublishedCourses();
};
