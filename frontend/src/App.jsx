import React, { useState } from 'react';
import axios from 'axios';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CircularProgress from '@mui/material/CircularProgress'; // Material-UI Spinner
import { Link, useNavigate } from 'react-router-dom';
function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [missedKeyWords, setMissedKeyWords] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scoreStatus, setScoreStatus] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
const router=useNavigate()

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

const handelAboutNavigate=()=>{
router('/about')
}

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFile && jobDescription) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('jobDescription', jobDescription);

      setLoading(true); // Set loading to true when starting the request

      try {
        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log(response.data);

        setAtsScore(response.data.atsScore.score);
        if (response.data.atsScore.score <= 15) {
          setScoreStatus("[Oh Shit you Fucked Up]");
        } else if (response.data.atsScore.score > 15 && response.data.atsScore.score <= 39) {
          setScoreStatus("[You Are in Safe Zone best of luck]");
        } else if (response.data.atsScore.score > 39 && response.data.atsScore.score <= 50) {
          setScoreStatus("[You Are in Safe Zone]");
        } else if (response.data.atsScore.score > 50 && response.data.atsScore.score <= 70) {
          setScoreStatus("[My Boi You are on the Right track but have to improve]");
        } else {
          setScoreStatus("[My Boi You Nailed it]");
        }

        const uniqueKeywords = [...new Set(response.data.atsScore.missingKeywords)];
        setMissedKeyWords(uniqueKeywords);
        console.log(response.data);

      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setLoading(false); // Set loading to false after request completes
      }
    } else {
      console.error('Please select a file and enter a job description.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className=" text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1  className="text-3xl font-bold"> <Link to='/'> ATS Checker</Link></h1>
          <nav className="flex space-x-6">
            <Link to="/about" className="hover:underline font-bold">About</Link>
            <Link to="/developer" className="hover:underline font-bold">Developer</Link>
          </nav>
        </div>
      </header>

      <main className="flex items-center justify-center pt-5">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full">
          <h1 className="text-2xl font-bold mb-6 text-gray-700">Upload Your Resume to Get the ATS Score</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Resume (PDF/DOC)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loading} // Disable input when loading
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
                disabled={loading} // Disable input when loading
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                disabled={loading} // Disable button when loading
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" /> // Display spinner when loading
                ) : (
                  'Upload'
                )}
              </button>
              <div className="mt-4">
                <div className='font-bold'>
                  Your ATS score is: {atsScore !== null ? atsScore + 15+"%" : 'N/A'} {scoreStatus}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center text-gray-900 hover:underline focus:outline-none font-bold"
                  >
                    {isDropdownOpen ? (
                      <>Hide Missed Keywords <ArrowDropUpIcon /></>
                    ) : (
                      <>Show Missed Keywords <ArrowDropDownIcon /></>
                    )}
                  </button>
                </div>

                {isDropdownOpen && (
                  <div className="mt-2">
                    {missedKeyWords.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {missedKeyWords.map((keyword, index) => (
                          <li key={index} className="text-gray-700">
                            {keyword}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">None</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>

          {selectedFile && (
            <p className="mt-4 text-sm text-gray-600">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
        </div>
      </main>

      {/* About Section */}
     
    </div>
  );
}

export default App;
