import { uploadsService } from './uploads.service.js';

export class UploadsController {
  async sign(req, res) {
    const data = await uploadsService.signUpload();
    res.json({
      ok: true,
      data,
    });
  }
}

export const uploadsController = new UploadsController();
