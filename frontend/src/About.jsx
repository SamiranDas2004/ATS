import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header should be outside the centered content */}
      <header className="text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Resume ATS Checker</h1>
          <nav className="flex space-x-6">
            <Link to="/about" className="hover:underline font-bold">About</Link>
            <Link to="/developer" className="hover:underline font-bold">Developer</Link>
          </nav>
        </div>
      </header>

      {/* Centered content for the About section */}
      <div className="flex items-center justify-center py-10">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold mb-4 text-gray-700">About Resume ATS Checker</h1>
          <p className="text-gray-700">
            Resume ATS Checker is a tool designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS).
            It compares your resume with job descriptions, calculates your ATS score, and highlights missing keywords, making your job
            application process more efficient. Maximize your chances of getting noticed by ensuring your resume is ATS-friendly!
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
