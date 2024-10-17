import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [missedKeyWords, setMissedKeyWords] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFile && jobDescription) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('jobDescription', jobDescription);

      try {
        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
console.log(response.data);

        setAtsScore(response.data.atsScore.score);
        
        // Use Set to remove duplicate keywords
        const uniqueKeywords = [...new Set(response.data.atsScore.missingKeywords)];
        setMissedKeyWords(uniqueKeywords);
        console.log(response.data);
        
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.error('Please select a file and enter a job description.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-5 bg-gray-900">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full"> {/* Increased the max-w-lg to max-w-2xl */}
        <h1 className="text-2xl font-bold mb-6 text-gray-700">Upload Your Resume</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Resume (PDF/DOC)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              rows="4"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Upload
            </button>
            <div className="mt-4">
              <div className='font-bold'>Your ATS score is: {atsScore !== null ? atsScore : 'N/A'}</div>
              <div><div className='font-bold'>Missed Keywords:</div> {missedKeyWords.length > 0 ? missedKeyWords.join(', ') : 'None'}</div>
            </div>
          </div>
        </form>

        {selectedFile && (
          <p className="mt-4 text-sm text-gray-600">
            Selected file: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
