import { uploadsRouter } from './uploads.routes.js';
import { uploadsService } from './uploads.service.js';

export const signUpload = () => uploadsService.signUpload();
export const deleteImage = (publicId) => uploadsService.deleteImage(publicId);

export { uploadsRouter };

