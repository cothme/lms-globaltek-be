import CourseModel from "../models/course.model";
import UserModel from "../models/user.model";
import Course from "../interfaces/Course";

export const findCourseByCodeOrTitle = async (
  courseId?: string,
  courseName?: string
) => {
  return await CourseModel.findOne({
    $or: [{ courseId }, { course_title: courseName }],
  });
};

export const findCourse = async (courseData: Course) => {
  return await CourseModel.find(courseData);
};

export const findCourseByTitle = async (courseName: string) => {
  return await CourseModel.findOne({ course_title: courseName });
};

export const findCourseByCode = async (courseCode: string) => {
  return await CourseModel.findOne({ course_code: courseCode });
};

export const findById = async (_id: string) => {
  return await CourseModel.findOne({ _id });
};

export const createCourse = async (courseData: Course) => {
  return await CourseModel.create(courseData);
};

export const getAllCourse = async (
  query: Course,
  page: number,
  limit: number
) => {
  const allCourses = await CourseModel.find();
  const offset = (page - 1) * limit;

  const courses = await CourseModel.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return { courses, allCourses: allCourses.length };
};

export const getCourseById = async (courseId: string) => {
  return await CourseModel.findOne({ _id: courseId });
};
export const getCourseByName = async (courseName: string) => {
  return await CourseModel.findOne({ course_title: courseName });
};

export const updateCourse = async (courseName: string, courseData: Course) => {
  return await CourseModel.updateOne({ course_title: courseName }, courseData);
};

export const deleteCourse = async (courseId: string) => {
  return await CourseModel.deleteOne({ _id: courseId });
};

export const deleteCourseFromUser = async (courseId: string) => {
  return await UserModel.updateMany({ $pull: { courses_enrolled: courseId } });
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

export const getSubscribers = async (courseName: string) => {
  const course = await CourseModel.findOne({ course_title: courseName }).select(
    "subscribers"
  );
  const userIds = course?.subscribers;
  const subscribers = await UserModel.find({
    _id: { $in: userIds },
  });

  return subscribers;
};

export const removeUserFromCourse = async (
  userId: string,
  courseName: string
) => {
  try {
    const courseId = (await getCourseByName(courseName))?._id;
    await UserModel.updateMany(
      { _id: userId },
      { $pull: { courses_enrolled: courseId } }
    );

    await CourseModel.updateOne(
      { _id: courseId },
      { $pull: { subscribers: userId } }
    );

    return { success: true, message: "User removed from course successfully" };
  } catch (error) {
    console.error("Error removing user from course:", error);
    return { success: false, message: "Failed to remove user from course" };
  }
};

export const addTopicToCourse = async (courseName: string, topicId: string) => {
  try {
    await CourseModel.updateOne(
      { course_title: courseName },
      { $push: { topics: topicId } }
    );
    return { success: true, message: "Topic added to course successfully" };
  } catch (error) {
    console.error("Error adding topic to course:", error);
    return { success: false, message: "Failed to add topic to course" };
  }
};
