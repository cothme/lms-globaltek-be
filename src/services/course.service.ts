import * as CourseRepository from "../repositories/course.repository";
import createHttpError from "http-errors";
import Course from "../interfaces/Course";
import { jwtDecode } from "jwt-decode";
import mongoose from "mongoose";
import User from "../interfaces/User";
import CourseModel from "../models/course.model";

export const createNewCourseService = async (courseData: Course) => {
  const {
    course_title,
    course_description,
    course_code,
    required_subscription,
  } = courseData;

  const missingFields = [];
  if (!course_title) missingFields.push("Course Title");
  if (!course_description) missingFields.push("Course Description");
  if (!course_code) missingFields.push("Course Code");
  if (!required_subscription) missingFields.push("Subscription ");

  if (missingFields.length > 0) {
    throw createHttpError(400, `Missing fields: ${missingFields.join(", ")}`);
  }

  const existingCourse = await CourseRepository.findCourse(courseData);
  console.log(existingCourse);

  if (existingCourse) {
    throw createHttpError(409, "Course already exists");
  }

  return await CourseRepository.createCourse(courseData);
};

export const getAllCourseService = async (
  query: Course,
  page?: number,
  limit?: number
) => {
  const { courses, allCourses } = await CourseRepository.getAllCourse(
    query,
    page!,
    limit!
  );

  if (!courses || courses.length === 0) {
    throw createHttpError(404, "No Courses!");
  }

  const totalItems = await CourseModel.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit!);

  return {
    courses,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
    },
    courseCount: allCourses,
  };
};

export const fetchCourseByIdService = async (
  courseId: string,
  page?: number,
  limit?: number
) => {
  const course = await CourseRepository.getCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  return course;
};

export const fetchCourseByCourseNameService = async (courseName: string) => {
  const course = await CourseRepository.getCourseByName(courseName);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  return course;
};

export const updateCourseService = async (
  courseData: Course,
  token: string,
  courseName: string
) => {
  const authHeader = token;
  const {
    course_title,
    course_description,
    course_code,
    required_subscription,
    published,
  } = courseData;

  const missingFields = [];
  if (!course_title) missingFields.push("course_title");
  if (!course_description) missingFields.push("course_description");
  if (!course_code) missingFields.push("course_code");
  if (!required_subscription) missingFields.push("required_subscription");

  if (missingFields.length > 0) {
    throw createHttpError(400, `Missing fields: ${missingFields.join(", ")}`);
  }

  const course = await CourseRepository.getCourseByName(courseName);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  const admin = jwtDecode<User>(authHeader);
  if (course.publisher !== admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }

  return await CourseRepository.updateCourse(courseName, {
    course_title,
    course_description,
    course_code,
    required_subscription,
    published,
  });
};

export const deleteCourseService = async (courseId: string, token: string) => {
  try {
    const admin = jwtDecode<User>(token);
    const authHeader = admin;
    if (!authHeader) {
      throw createHttpError(401, "Authorization header is missing");
    }

    if (!mongoose.isValidObjectId(courseId)) {
      throw createHttpError(400, "Invalid course ID");
    }

    const course = await CourseRepository.getCourseById(courseId);
    if (!course) {
      throw createHttpError(404, "Course not found");
    }

    if (course.publisher != admin?.user_name) {
      throw createHttpError(403, "Unauthorized");
    }
    const deleteCourse = await CourseRepository.deleteCourse(courseId);
    const deleteUserFromCourse = await CourseRepository.deleteCourseFromUser(
      courseId
    );
    return {
      success: true,
      message: "User successfully deleted from system and courses.",
      data: {
        deleteCourse,
        deleteUserFromCourse,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "An error occurred while deleting the user.",
      error: error.message,
    };
  }
};

export const publishCourseService = async (courseId: string, token: string) => {
  const admin = jwtDecode<User>(token);
  const course = await CourseRepository.getCourseById(courseId);
  if (!course) {
    throw createHttpError(404, "Course not found");
  }
  if (course.publisher != admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }
  return CourseRepository.publishCourse(courseId);
};

export const getPublishedCoursesService = async () => {
  return CourseRepository.getPublishedCourses();
};

export const getSubscribersService = async (
  token: string,
  courseName: string
) => {
  const existingCourse = CourseRepository.findCourseByCodeOrTitle(courseName);
  const admin = jwtDecode<User>(token);
  const course = await CourseRepository.getCourseByName(courseName);
  console.log((course?.publisher ?? "") + admin?.user_name);
  if (course?.publisher != admin?.user_name) {
    throw createHttpError(403, "Unauthorized");
  }
  if (!existingCourse) {
    throw createHttpError(409, "Course not found");
  }
  const subscribers = await CourseRepository.getSubscribers(courseName);
  return subscribers;
};

export const removeUserFromCourseService = async (
  userId: string,
  courseId: string
) => {
  if (!courseId) {
    return { success: false, message: "Course not found" };
  }
  return await CourseRepository.removeUserFromCourse(userId, courseId);
};
