import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { api } from './axios';
import type { ApiResponse } from '../types/api';
import type { signatureData, UploadData } from '../types/upload';


const compressImage = async (file: File): Promise<File> => {
  if (file.type === 'image/gif') return file; 
  
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp'
  };

  try {
    const compressed = await imageCompression(file, options);
    return new File (
      [compressed],
      `${baseName}.webp`,
      { type: 'image/webp', lastModified: Date.now() }
    );
  } catch (error) {
    console.error('Image compression failed, falling back to original file:', error);
    return file; // fallback to original file
  }
};


// export const uploadFileLocal = async (file: File): Promise<ApiResponse<string>> => {
//   const formData = new FormData();
//   formData.append('file', file);

//   const response = await api.post<ApiResponse<string>>('/upload/local', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   });
//   return response.data;
// };

export const getUploadSignature = async (userId: string): Promise<ApiResponse<signatureData>> => {
  const response = await api.get<ApiResponse<signatureData>>(`/upload/signature/${userId}`);
  return response.data;
};

export const uploadFile = async (file: File, userId: string): Promise<UploadData> => {
  const fileType = file.type.startsWith('image/') ? 'image' : 'video';
  let fileToUpload;
  if (fileType === 'image') fileToUpload = await compressImage(file);
  else                      fileToUpload = file;

  const sigResponse = await getUploadSignature(userId);
  const sigData = sigResponse.payload;

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('api_key', sigData.apiKey);
  formData.append('timestamp', sigData.timestamp.toString());
  formData.append('signature', sigData.signature);
  formData.append('folder', sigData.folder);
  formData.append('unique_filename', 'true');
  formData.append('use_filename', 'true');

  const response = await axios.post<UploadData>(
    `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${fileType}/upload`,
    formData
  );

  const publicId = response.data?.public_id.split('/').pop() || '';
  const type = file.type.split('/')[0]?.toUpperCase();
  await api.post<ApiResponse<string>>('/asset', { publicId, type });

  return response.data;
};