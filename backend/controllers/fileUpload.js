import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import natural from "natural"; // Import natural language processing
import stopword from "stopword"; // For stopword removal
import { parseResume } from "../utils/parser.js"; // Your resume parser

// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// WordNet for synonym lookup
const wordnet = new natural.WordNet();
const getSynonyms = async (word) => {
  return new Promise((resolve, reject) => {
    wordnet.lookup(word, (err, definitions) => {
      if (err) {
        reject(err);
      } else {
        const synonyms = definitions.flatMap((def) => def.synonyms);
        resolve(synonyms);
      }
    });
  });
};



// Function to generate N-grams from text
const generateNGrams = (text, n = 2) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  return natural.NGrams.ngrams(tokens, n).map((ngram) => ngram.join(" "));
};

// Function to remove stopwords from text
const removeStopWords = (text) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  return stopword.removeStopwords(tokens);
};

const calculateATSScore = async ( resumeKeywords,jobDescriptionKeywords, resumeText) => {
  const normalizedResumeKeywords = resumeKeywords.map((keyword) =>
    keyword.toLowerCase()
  );
  const normalizedJobDescriptionKeywords = jobDescriptionKeywords.map(
    (keyword) => keyword.toLowerCase()
  );

  console.log("Normalized Resume Keywords:", normalizedResumeKeywords);
  console.log(
    "Normalized Job Description Keywords:",
    normalizedJobDescriptionKeywords
  );

  // Initial match of keywords
  let matchedKeywords = normalizedResumeKeywords.filter((keyword) =>
    normalizedJobDescriptionKeywords.includes(keyword)
  );

  // Log matched keywords
  console.log("Initially Matched Keywords:", matchedKeywords);

  // Parallelize synonym lookups for performance and handle empty results
  const synonymPromises = normalizedResumeKeywords.map(async (keyword) => {
    try {
      const synonyms = await getSynonyms(keyword);
      if (synonyms.length > 0) {
        console.log(`Synonyms for "${keyword}":`, synonyms);
        return synonyms.filter((synonym) =>
          normalizedJobDescriptionKeywords.includes(synonym.toLowerCase())
        );
      }
      return []; // Return empty array if no synonyms are found
    } catch (err) {
      console.error(`Error getting synonyms for "${keyword}":`, err);
      return []; // Return empty array on error
    }
  });

  // Await all synonym matching
  const synonymMatches = await Promise.all(synonymPromises);

  // Flatten and concatenate synonym matches with matched keywords
  matchedKeywords = matchedKeywords.concat(synonymMatches.flat());

  // Log after adding synonym matches
  console.log("Matched Keywords After Synonym Matching:", matchedKeywords);

  // Apply weighting based on sections
  const weightedMatchedKeywords = resumeKeywords.reduce((acc, keyword) => {
    const weight = getSectionWeight(keyword, resumeText);
    return (
      acc +
      (normalizedJobDescriptionKeywords.includes(keyword.toLowerCase())
        ? weight
        : 0)
    );
  }, 0);

  // Log weighted matched keywords for debugging
  console.log("Weighted Matched Keywords:", weightedMatchedKeywords);

  // Calculate missing keywords
  const missingKeywords = normalizedJobDescriptionKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword)
  );

  // Log missing keywords
  console.log("Missing Keywords:", missingKeywords);

  const score =
    (weightedMatchedKeywords / normalizedJobDescriptionKeywords.length) * 100; // Weighted score

  return {
    score,
    matchedKeywords,
    missingKeywords, // Add missing keywords to the response
    totalKeywords: normalizedJobDescriptionKeywords.length,
    matchedCount: matchedKeywords.length, // Count of all matched keywords
  };
};

// Function to get synonyms for a keyword using WordNet

// Function to calculate TF-IDF scores and return important words
const calculateTFIDF = (textArray, threshold = 0.1) => {
  const tfidf = new natural.TfIdf();
  textArray.forEach((text) => tfidf.addDocument(text));

  const importantWords = [];
  tfidf.listTerms(0).forEach((item) => {
    if (item.tfidf >= threshold) {
      importantWords.push(item.term);
    }
  });

  return importantWords;
};

// Function to get section weight based on the keyword's occurrence in a resume section
const getSectionWeight = (keyword, text) => {
  const sectionWeights = {
    Skills: 2, // Skills section is more important
    Experience: 1.5,
    Education: 1, // Default weight
  };
  const sections = Object.keys(sectionWeights);

  for (const section of sections) {
    if (text.includes(section)) {
      return sectionWeights[section];
    }
  }

  return 1; // Default weight
};

// File upload handler
export const handleFileUpload = async (req, res) => {
    if (!req.file || !req.body.jobDescription) {
      return res.status(400).send("Please upload both file and job description.");
    }
  
    const resumeFilePath = path.join(__dirname, "..", req.file.path);
  
    try {
      const resumeText = await parseResume(resumeFilePath);
      const cleanResumeText = removeStopWords(resumeText).join(" ");
      const cleanJobDescriptionText = removeStopWords(
        req.body.jobDescription
      ).join(" ");
  
      const resumeImportantWords = calculateTFIDF([cleanResumeText]).concat(
        generateNGrams(cleanResumeText, 2)
      );
      const jobDescriptionImportantWords = calculateTFIDF([cleanJobDescriptionText]).concat(
        generateNGrams(cleanJobDescriptionText, 2)
      );
  
      const atsScore = await calculateATSScore(
        resumeImportantWords,
        jobDescriptionImportantWords,
        cleanResumeText
      );
  
      res.send({
        atsScore,
        matchedKeywords: atsScore.matchedKeywords,
        missingKeywords: atsScore.missingKeywords, // Include missing keywords in the response
        totalKeywords: atsScore.totalKeywords,
        matchedCount: atsScore.matchedCount,
      });
    } catch (error) {
      console.error("Error processing upload:", error);
      res.status(500).send("Error processing the uploaded file or job description.");
    }
  };