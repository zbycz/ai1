import type { LonLat } from '../../services/types';

export type UploadFileInfo = {
  buffer: Buffer;
  filename: string;
  location: LonLat | null;
  date: Date;
};
