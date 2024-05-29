import CourseModel from "../models/course.model";
import UserModel from "../models/user.model";
import Course from "../interfaces/Course";

export const findCourseByCodeOrTitle = async (
  courseId?: string,
  course_title?: string
) => {
  return await CourseModel.findOne({
    $or: [{ courseId }, { course_title }],
  });
};

export const findById = async (_id: string) => {
  return await CourseModel.findOne({ _id });
};

export const createCourse = async (courseData: Course) => {
  return await CourseModel.create(courseData);
};

export const getAllCourse = async () => {
  return await CourseModel.find();
};

export const getCourseById = async (courseId: string) => {
  return await CourseModel.findOne({ _id: courseId });
};

export const updateCourse = async (courseId: string, courseData: Course) => {
  return await CourseModel.updateOne({ _id: courseId }, courseData);
};

export const deleteCourse = async (courseId: string) => {
  return await CourseModel.deleteOne({ _id: courseId });
};

export const publishCourse = async (courseId: string) => {
  const course = await getCourseById(courseId);
  const courseStatus = course?.published;

  if (courseStatus) {
    return await CourseModel.updateOne(
      { _id: courseId },
      { $set: { published: false } }
    );
  } else {
    return await CourseModel.updateOne(
      { _id: courseId },
      { $set: { published: true } }
    );
  }
};

export const getPublishedCourses = async () => {
  return await CourseModel.find({ published: true });
};

export const getSubscribers = async (courseId: string) => {
  const course = await CourseModel.findOne({ _id: courseId }).select(
    "subscribers"
  );
  const userIds = course?.subscribers;
  const subscribers = await UserModel.find({
    _id: { $in: userIds },
  });
  console.log(subscribers);

  return subscribers;
};
