// utils/parser.js
import fs from 'fs';
import pdf from 'pdf-parse';

// Function to parse the resume and extract text
export const parseResume = async (filePath) => {
    // Check if the file exists
    if (!filePath) {
        throw new Error(`File not found at path: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath); // Read the file as a buffer
console.log("sex",dataBuffer);

    // Use pdf-parse to extract text from the PDF
  
};
