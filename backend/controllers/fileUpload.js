import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import fs from 'fs';
import { parseResume } from '../utils/parser.js'; // Ensure this path is correct
import natural from 'natural'; // Import the natural NLP library

// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to calculate ATS score based on matching important words
const calculateATSScore = (resumeKeywords, jobDescriptionKeywords) => {
    const normalizedResumeKeywords = resumeKeywords.map(keyword => keyword.toLowerCase());
    const normalizedJobDescriptionKeywords = jobDescriptionKeywords.map(keyword => keyword.toLowerCase());
    
    const matchedKeywords = normalizedResumeKeywords.filter(keyword => normalizedJobDescriptionKeywords.includes(keyword));
    const score = (matchedKeywords.length / normalizedJobDescriptionKeywords.length) * 100; // Percentage score

    return {
        score,
        matchedKeywords,
        totalKeywords: normalizedJobDescriptionKeywords.length,
        matchedCount: matchedKeywords.length
    };
};

// Function to calculate TF-IDF scores and return important words based on a threshold
const calculateTFIDF = (textArray, threshold = 1.2) => {  // Default threshold for filtering
    const tfidf = new natural.TfIdf();
    textArray.forEach(text => tfidf.addDocument(text));

    const importantWords = [];
    tfidf.listTerms(0).forEach(item => {
        if (item.tfidf >= threshold) {
            importantWords.push(item.term);
        }
    });

    return importantWords;
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
        console.log('Job Description:', req.body.jobDescription);

        // Extract important words from both resume and job description using TF-IDF
        const resumeImportantWords = calculateTFIDF([resumeText]);  // Important words from resume
        const jobDescriptionImportantWords = calculateTFIDF([req.body.jobDescription]);  // Important words from JD

        console.log('Resume Important Words:', resumeImportantWords);
        console.log('Job Description Important Words:', jobDescriptionImportantWords);

        // Calculate ATS score based on matching important words
        const atsScore = calculateATSScore(resumeImportantWords, jobDescriptionImportantWords);
        console.log('ATS Score:', atsScore);

        // Send the response with extracted data and ATS score
        res.send({
            atsScore, 
            matchedKeywords: atsScore.matchedKeywords,
            totalKeywords: atsScore.totalKeywords,
            matchedCount: atsScore.matchedCount
        });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).send('Error processing the uploaded file or job description.');
    }
};
