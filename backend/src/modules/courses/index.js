import { publicCoursesRouter, coursesRouter } from './courses.routes.js';
import { coursesService } from './courses.service.js';
import { Course } from './courses.model.js';
import { COURSE_EVENTS } from './courses.events.js';

export const getPublishedCourseIds = (ids) => coursesService.getPublishedCourseIds(ids);
export const getCourseTitles = (ids) => coursesService.getCourseTitles(ids);
export const countCourses = (filter) => coursesService.countCourses(filter);
export const seedSampleCourses = () => coursesService.seedSampleCourses();

export {
  publicCoursesRouter,
  coursesRouter,
  coursesRouter as adminCoursesRouter,
  Course,
  COURSE_EVENTS,
  coursesService,
};
