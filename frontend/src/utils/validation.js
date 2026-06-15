import { parseDateTimeLocal } from "./dates";

const ASSIGNMENT_NAME_MIN = 2;
const ASSIGNMENT_NAME_MAX = 100;
const COURSE_MAX = 50;

export function validateHomeworkForm({ assignmentName, course, dueDate }) {
  const errors = {};

  const name = assignmentName.trim();
  if (!name) {
    errors.assignmentName = "Assignment name is required.";
  } else if (name.length < ASSIGNMENT_NAME_MIN) {
    errors.assignmentName = `Assignment name must be at least ${ASSIGNMENT_NAME_MIN} characters.`;
  } else if (name.length > ASSIGNMENT_NAME_MAX) {
    errors.assignmentName = `Assignment name must be ${ASSIGNMENT_NAME_MAX} characters or fewer.`;
  }

  const courseTrimmed = course.trim();
  if (courseTrimmed.length > COURSE_MAX) {
    errors.course = `Course must be ${COURSE_MAX} characters or fewer.`;
  }

  if (!dueDate) {
    errors.dueDate = "Due date is required.";
  } else {
    const parsed = parseDateTimeLocal(dueDate);
    if (!parsed) {
      errors.dueDate = "Due date is not valid.";
    } else if (parsed <= new Date()) {
      errors.dueDate = "Due date must be in the future.";
    }
  }

  return {
    errors,
    values: {
      assignmentName: name,
      course: courseTrimmed || null,
      dueDate,
    },
  };
}
