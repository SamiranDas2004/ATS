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
// Function to calculate ATS score
const calculateATSScore = (resumeKeywords, jobDescriptionKeywords) => {
    const matchedKeywords = resumeKeywords.filter(keyword => jobDescriptionKeywords.includes(keyword));
    const score = (matchedKeywords.length / jobDescriptionKeywords.length) * 100; // Percentage score
    return {
        score,
        matchedKeywords,
        totalKeywords: jobDescriptionKeywords.length,
        matchedCount: matchedKeywords.length
    };
};


const extractKeywords = (text) => {
    // Convert text to lower case, split into words, and filter out common stop words
    const stopWords = new Set([
        "i", "me", "my", "we", "our", "ours", "you", "your", "yours", "he", "him", 
        "his", "she", "her", "it", "its", "they", "them", "their", "theirs", 
        "that", "what", "who", "whom", "this", "these", "those", "am", "is", 
        "are", "was", "were", "be", "been", "being", "have", "has", "had", 
        "do", "does", "did", "doing", "a", "an", "the", "and", "or", "but", 
        "if", "then", "because", "as", "for", "at", "by", "with", "about", 
        "against", "between", "into", "through", "during", "before", "after", 
        "above", "below", "to", "from", "up", "down", "in", "out", "on", 
        "off", "over", "under", "again", "further", "then", "once", "here", 
        "there", "when", "where", "why", "how", "all", "any", "both", 
        "each", "few", "more", "most", "other", "some", "such", "no", 
        "nor", "not", "only", "own", "same", "so", "than", "too", "very", 
        "s", "t", "can", "will", "just"
    ]);

    const words = text
        .toLowerCase()                       // Convert text to lower case
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '') // Remove punctuation
        .split(/\s+/)                        // Split by whitespace
        .filter(word => word && !stopWords.has(word)); // Filter out stop words and empty strings

    return [...new Set(words)]; // Return unique keywords
};

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
       
        // Extract keywords from both the resume and job description
        const resumeKeywords = extractKeywords(resumeText);
        const jobDescriptionKeywords = extractKeywords(req.body.jobDescription);

        console.log('Resume Keywords:', resumeKeywords);
        console.log('Job Description Keywords:', jobDescriptionKeywords);

        // Calculate ATS score
        const atsScore = calculateATSScore(resumeKeywords, jobDescriptionKeywords);
        console.log('ATS Score:', atsScore);

        // Send the response with extracted data and ATS score
        res.send({
            message: 'File and job description processed successfully',
            extractedText: resumeText, // Return the extracted text from the resume
            jobDescription: req.body.jobDescription, // Include the job description
            atsScore // Include the ATS score
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).send('Error processing the uploaded file or job description.');
    }
};
