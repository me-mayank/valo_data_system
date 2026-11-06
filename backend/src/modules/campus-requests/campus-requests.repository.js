import { CampusRequest } from './campus-requests.model.js';

export class CampusRequestsRepository {
  async create(data) {
    return CampusRequest.create(data);
  }

  async find(filter = {}, skip = 0, limit = 25, sort = { createdAt: -1 }) {
    return CampusRequest.find(filter).sort(sort).skip(skip).limit(limit);
  }

  async count(filter = {}) {
    return CampusRequest.countDocuments(filter);
  }

  async findById(id) {
    return CampusRequest.findById(id);
  }

  async deleteById(id) {
    return CampusRequest.findByIdAndDelete(id);
  }
}

export const campusRequestsRepository = new CampusRequestsRepository();

