import { handleInstagramSlides } from './ig-image.js';

export default async function handler(req: any, res: any) {
  return handleInstagramSlides(req, res);
}
