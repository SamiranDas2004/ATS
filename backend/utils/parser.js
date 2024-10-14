import fs from 'fs';
import { getDocument } from 'pdfjs-dist';

export const parseResume = async (filePath) => {
    try {
        const data = new Uint8Array(fs.readFileSync(filePath));
        const pdfDocument = await getDocument({ data }).promise;
        let extractedText = '';

        // Loop through each page and extract text
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');
            extractedText += textItems + '\n';
        }

        console.log("Extracted Text:", extractedText);
        return extractedText;
    } catch (error) {
        console.error("Error:", error.message);
    }
};


