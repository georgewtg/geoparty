export const uploadFileDataLocal = async (file: Express.Multer.File) => {
  try {
    return file.filename;
  } catch (error) {
    console.error("Error uploading file locally", error);
    throw error;
  }
};