// routes.js
import express from 'express';
import { uploadMiddleware } from '../middlewares/multer.middleware.js';
import { handleFileUpload } from '../controllers/fileUpload.js';

const uploadRouter = express.Router();

// Set up a route for file uploads
uploadRouter.post('/upload', uploadMiddleware.single('file'), handleFileUpload);

export default uploadRouter;
