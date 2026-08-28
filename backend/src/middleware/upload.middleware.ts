import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';

// create folder if not exists
const uploadDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    let finalName = file.originalname;
    let targetPath = path.join(uploadDir, finalName);

    // if duplicate file
    if (fs.existsSync(targetPath)) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      finalName = `${baseName}-${uniqueSuffix}${ext}`;
    }

    cb(null, finalName);
  },
});

export const upload = multer({ storage });