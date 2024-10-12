// Import necessary modules
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { parseResume } from '../utils/parser.js'; // Ensure this path is correct

// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File upload handler
export const handleFileUpload = async (req, res) => {
    if (!req.file || !req.body.jobDescription) {
        return res.status(400).send('Please upload both file and job description.');
    }

    console.log('File uploaded:', req.file);
    console.log('Job description:', req.body.jobDescription); // Log the actual job description

    // Path to the uploaded resume
    const resumeFilePath = path.join(__dirname, '..', req.file.path); // Ensure this path is correct


    try {
        // Parse the resume to extract text
        const resumeText = await parseResume(resumeFilePath);
        
        // Log the extracted resume text for debugging
        console.log('Extracted Resume Text:', resumeText);
        console.log(resumeFilePath);
        // Send the response with extracted data
        res.send({
            message: 'File and job description processed successfully',
            extractedText: resumeText, // Return the extracted text from the resume
            jobDescription: req.body.jobDescription // Include the job description
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).send('Error processing the uploaded file or job description.');
    }
};
