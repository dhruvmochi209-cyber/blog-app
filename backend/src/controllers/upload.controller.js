import { uploadOnCloudinary } from '../utils/cloudinary.utils.js';

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }

        // Determine the task type from the body, default to 'images'
        const taskType = req.body.taskType || 'images';

        // Upload to Cloudinary under Writen/taskType
        const cloudinaryResult = await uploadOnCloudinary(req.file.path, taskType);

        if (!cloudinaryResult) {
            return res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary' });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            url: cloudinaryResult.secure_url
        });

    } catch (error) {
        console.error("Upload Controller Error:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
