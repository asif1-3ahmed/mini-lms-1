/**
 * 🔄 Redirect helper for builder pages
 * Handles navigation after save for topics, quizzes, and assignments.
 */

export const goBackAfterSave = (navigate, type = "topic") => {
  switch (type) {
    case "topic":
    case "quiz":
    case "assignment":
      // After saving, go back to the weeks view
      navigate("/builder/weeks");
      break;

    case "week":
      // If saving a week itself, go back to courses
      navigate("/builder/courses");
      break;

    default:
      navigate("/builder/courses");
  }
};
