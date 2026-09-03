import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';


// export const uploadFileLocal = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

//     const payload = req.file.filename;
//     if (!payload) return res.status(404).json({ success: false, message: 'Failed to upload file locally' });
    
//     res.status(200).json({ success: true, payload });

//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

export const getUploadSignature = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const targetFolder = `geoparty/assets/${userId}`;

    const paramsToSign = {
      folder: targetFolder,
      timestamp: timestamp,
      unique_filename: true,
      use_filename: true
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    const payload = {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: targetFolder,
    };
    
    res.status(200).json({ success: true, payload });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};