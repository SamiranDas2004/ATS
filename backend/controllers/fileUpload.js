import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import natural from "natural"; // Import natural language processing
import stopword from "stopword"; // For stopword removal
import { parseResume } from "../utils/parser.js"; // Your resume parser

// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the POS Tagger
const baseFolder = "./node_modules/natural/lib/natural/brill_pos_tagger";
const rulesFilename = `${baseFolder}/data/English/tr_from_posjs.txt`;
const lexiconFilename = `${baseFolder}/data/English/lexicon_from_posjs.json`;
const defaultCategory = 'N';
const lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
const ruleSet = new natural.RuleSet(rulesFilename);
const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

// WordNet for synonym lookup
const wordnet = new natural.WordNet();

// Get synonyms using WordNet
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

// Generate N-grams from text
const generateNGrams = (text, n = 2) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  return natural.NGrams.ngrams(tokens, n).map((ngram) => ngram.join(" "));
};

// Remove stopwords from text
const removeStopWords = (text) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  return stopword.removeStopwords(tokens);
};

// Calculate TF-IDF scores and exclude nouns
const calculateTFIDF = (textArray, threshold = 0.1) => {
  const tfidf = new natural.TfIdf();
  textArray.forEach((text) => tfidf.addDocument(text));

  const importantWords = [];
  tfidf.listTerms(0).forEach((item) => {
    if (item.tfidf >= threshold) {
      importantWords.push(item.term);
    }
  });

  // POS tagging to filter out nouns
  const tokens = importantWords.map(word => {
    const taggedWords = tagger.tag([word]);
    return taggedWords.taggedWords[0];
  });

  // Filter out words tagged as nouns (NN, NNS, NNP, NNPS)
  const nonNounWords = tokens
    .filter(token => !["NN", "NNS", "NNP", "NNPS"].includes(token.tag))
    .map(token => token.token);

  // Ensure uniqueness
  const uniqueKeywords = [...new Set(nonNounWords)];

  // Split phrases and handle spaces
  let newUniqueWords = [];
  uniqueKeywords.forEach(keyword => {
    if (keyword.includes(' ')) {
      const splitWords = keyword.split(' ');  // Split multi-word phrases into individual words
      newUniqueWords = newUniqueWords.concat(splitWords);  // Add split words to the array
    } else {
      newUniqueWords.push(keyword);  // Add single-word keywords directly
    }
  });

  // Return the final unique words set
  return [...new Set(newUniqueWords)];
};

// Section weight assignment based on where the keyword appears in the resume
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

// Calculate the ATS score based on resume and job description keywords
const calculateATSScore = async (resumeKeywords, jobDescriptionKeywords, resumeText) => {
  const normalizedResumeKeywords = resumeKeywords.map((keyword) => keyword.toLowerCase());
  const normalizedJobDescriptionKeywords = jobDescriptionKeywords.map((keyword) => keyword.toLowerCase());

  // Initial match of keywords
  let matchedKeywords = normalizedJobDescriptionKeywords.filter((keyword) =>
    normalizedResumeKeywords.includes(keyword)
  );

  // Fetch synonyms for each keyword and match with job description
  const synonymPromises = normalizedResumeKeywords.map(async (keyword) => {
    try {
      const synonyms = await getSynonyms(keyword);
      if (synonyms.length > 0) {
        return synonyms.filter((synonym) => 
          normalizedJobDescriptionKeywords.includes(synonym.toLowerCase())
        );
      }
      return [];
    } catch (err) {
      console.error(`Error getting synonyms for "${keyword}":`, err);
      return [];
    }
  });

  // Await all synonym matches
  const synonymMatches = await Promise.all(synonymPromises);

  // Flatten and concatenate synonym matches with matched keywords
  matchedKeywords = matchedKeywords.concat(synonymMatches.flat());

  // Calculate weighted matches based on sections of the resume
  const weightedMatchedKeywords = resumeKeywords.reduce((acc, keyword) => {
    const weight = getSectionWeight(keyword, resumeText);
    return acc + (normalizedJobDescriptionKeywords.includes(keyword.toLowerCase()) ? weight : 0);
  }, 0);

  // Calculate missing keywords
  const missingKeywords = normalizedJobDescriptionKeywords.filter(
    (keyword) => !matchedKeywords.includes(keyword)
  );

  // Calculate the ATS score
  const score = (weightedMatchedKeywords / normalizedJobDescriptionKeywords.length) * 100;

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalKeywords: normalizedJobDescriptionKeywords.length,
    matchedCount: matchedKeywords.length,
  };
};

// Handle file upload for resume processing
export const handleFileUpload = async (req, res) => {
  if (!req.file || !req.body.jobDescription) {
    return res.status(400).send("Please upload both file and job description.");
  }

  const resumeFilePath = path.join(__dirname, "..", req.file.path);

  try {
    const resumeText = await parseResume(resumeFilePath);
    const cleanResumeText = removeStopWords(resumeText).join(" ");
    const cleanJobDescriptionText = removeStopWords(req.body.jobDescription).join(" ");

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
      missingKeywords: atsScore.missingKeywords,
      totalKeywords: atsScore.totalKeywords,
      matchedCount: atsScore.matchedCount,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).send("Error processing the uploaded file or job description.");
  }
};
