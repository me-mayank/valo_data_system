import { Lead } from './leads.model.js';

export class LeadsRepository {
  async findOneByEmailOrPhone(email, phone) {
    const orConditions = [];
    if (email) {
      orConditions.push({ email: email.toLowerCase().trim() });
    }
    if (phone) {
      orConditions.push({ phone: phone.trim() });
    }
    if (orConditions.length === 0) return null;

    return Lead.findOne({ $or: orConditions });
  }

  async create(data) {
    return Lead.create(data);
  }

  async mergeLead(id, { interestedCourseIds = [], updateFields = {} }) {
    const update = {};

    if (Object.keys(updateFields).length > 0) {
      update.$set = updateFields;
    }

    if (interestedCourseIds.length > 0) {
      update.$addToSet = {
        interestedCourseIds: { $each: interestedCourseIds },
      };
    }

    return Lead.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  async updateById(id, data) {
    return Lead.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async find(filter = {}, skip = 0, limit = 25, sort = { createdAt: -1 }) {
    return Lead.find(filter).sort(sort).skip(skip).limit(limit);
  }

  async count(filter = {}) {
    return Lead.countDocuments(filter);
  }

  async findById(id) {
    return Lead.findById(id);
  }

  async deleteById(id) {
    return Lead.findByIdAndDelete(id);
  }

  async getTopSources(limit = 5) {
    return Lead.aggregate([
      { $match: { source: { $exists: true, $ne: null } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, source: '$_id', count: 1 } },
    ]);
  }

  async getTopCourses(limit = 5) {
    return Lead.aggregate([
      { $unwind: '$interestedCourseIds' },
      { $group: { _id: '$interestedCourseIds', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, courseId: { $toString: '$_id' }, count: 1 } },
    ]);
  }
}

export const leadsRepository = new LeadsRepository();
