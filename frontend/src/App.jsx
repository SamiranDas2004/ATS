import React, { useState } from 'react';
import axios from 'axios'; // Import Axios

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(''); // Initialize with an empty string

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFile && jobDescription) { // Ensure both file and description are provided
      const formData = new FormData(); // Create a FormData object
      formData.append('file', selectedFile); // Append the selected file to the form data
      formData.append('jobDescription', jobDescription); // Append job description

      try {
        // Send a POST request to the server
        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
          },
        });

        // Handle success
        console.log('File uploaded successfully:', response.data);
      } catch (error) {
        // Handle error
        console.error('Error uploading file:', error);
      }
    } else {
      console.error('Please select a file and enter a job description.');
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <form onSubmit={handleSubmit}>
        <input className="text-3xl font-bold underline" type="file" onChange={handleFileChange} />
        <input
          type='text'
          placeholder="Enter job description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)} // Update state with the entered text
        />
        <button type="submit">Upload</button>
      </form>
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
    </div>
  );
}

export default App;
