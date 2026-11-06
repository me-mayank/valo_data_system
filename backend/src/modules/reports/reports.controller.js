import { reportsService } from './reports.service.js';

export class ReportsController {
  async getOverview(req, res) {
    const data = await reportsService.getOverview();
    res.status(200).json({ ok: true, data });
  }
}

export const reportsController = new ReportsController();
