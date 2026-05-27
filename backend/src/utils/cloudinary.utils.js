import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Uploads a local file to Cloudinary and deletes the local temp file.
 * @param {string} localFilePath - Path to the local file to upload.
 * @param {string} taskType - The subfolder task type (e.g., 'covers', 'avatars', 'article-images').
 * @returns {Promise<object|null>} Cloudinary upload result object.
 */
export const uploadOnCloudinary = async (localFilePath, taskType = 'general') => {
    try {
        if (!localFilePath) return null;

        // Ensure taskType is safe
        const safeTaskType = taskType.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
        
        // As requested: Main folder 'Writen', subfolder based on task type.
        const folderPath = `Writen/${safeTaskType}`;

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: folderPath,
            resource_type: "auto",
        });

        // Delete the temporary local file
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        
        // Ensure local temp file is deleted even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        return null;
    }
};
