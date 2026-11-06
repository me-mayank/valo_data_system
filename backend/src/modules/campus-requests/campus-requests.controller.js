import { campusRequestsService } from './campus-requests.service.js';
import { getClientIp } from '../../shared/utils/client-ip.js';

export class CampusRequestsController {
  async submitCampusRequest(req, res) {
    const clientIp = getClientIp(req);
    const result = await campusRequestsService.submitCampusRequest(req.body, clientIp);
    res.status(200).json(result);
  }

  async getAdminCampusRequests(req, res) {
    const data = await campusRequestsService.getAdminCampusRequests(req.query);
    res.status(200).json({ ok: true, data });
  }

  async getCampusRequestById(req, res) {
    const data = await campusRequestsService.getCampusRequestById(req.params.id);
    res.status(200).json({ ok: true, data });
  }

  async deleteCampusRequest(req, res) {
    const data = await campusRequestsService.deleteCampusRequest(req.params.id);
    res.status(200).json({ ok: true, data });
  }

  async exportCampusRequestsCsv(req, res) {
    const csv = await campusRequestsService.exportCampusRequestsCsv(req.query);
    const filename = `campus-requests-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  }
}

export const campusRequestsController = new CampusRequestsController();
