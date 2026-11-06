import { Course } from './courses.model.js';

export class CoursesRepository {
  async findPublished(filter = {}) {
    return Course.find({ ...filter, status: 'published' }).sort({ sortOrder: 1, createdAt: -1 });
  }

  async findBySlug(slug) {
    return Course.findOne({ slug });
  }

  async findPublishedBySlug(slug) {
    return Course.findOne({ slug, status: 'published' });
  }

  async findById(id) {
    return Course.findById(id);
  }

  async findAdminList({ filter = {}, skip = 0, limit = 20 }) {
    return Course.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async findPublishedByIds(ids) {
    return Course.find({
      _id: { $in: ids },
      status: 'published',
    }).select('_id title code');
  }

  async findTitlesByIds(ids) {
    const courses = await Course.find({ _id: { $in: ids } }).select('_id title code');
    /** @type {Record<string, string>} */
    const map = {};
    for (const c of courses) {
      map[c._id.toString()] = c.code ? `${c.code}: ${c.title}` : c.title;
    }
    return map;
  }

  async count(filter = {}) {
    return Course.countDocuments(filter);
  }

  async create(data) {
    return Course.create(data);
  }

  async updateById(id, data) {
    return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Course.findByIdAndDelete(id);
  }

  async bulkUpdateSortOrders(items) {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));
    return Course.bulkWrite(ops);
  }
}

export const coursesRepository = new CoursesRepository();
