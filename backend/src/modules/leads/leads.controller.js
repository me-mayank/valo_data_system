import { leadsService } from './leads.service.js';
import { getClientIp } from '../../shared/utils/client-ip.js';

export class LeadsController {
  async submitLead(req, res) {
    const clientIp = getClientIp(req);
    const result = await leadsService.submitLead(req.body, clientIp);
    res.status(200).json(result);
  }

  async getAdminLeads(req, res) {
    const data = await leadsService.getAdminLeads(req.query);
    res.status(200).json({ ok: true, data });
  }

  async getLeadById(req, res) {
    const data = await leadsService.getLeadById(req.params.id);
    res.status(200).json({ ok: true, data });
  }

  async deleteLead(req, res) {
    const data = await leadsService.deleteLead(req.params.id);
    res.status(200).json({ ok: true, data });
  }

  async exportLeadsCsv(req, res) {
    const csv = await leadsService.exportLeadsCsv(req.query);
    const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  }
}

export const leadsController = new LeadsController();
