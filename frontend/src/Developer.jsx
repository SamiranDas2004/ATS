import React from 'react';
import me from './me.jpg';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { CiMail } from 'react-icons/ci';
import { Link } from 'react-router-dom';

function Developer() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
        <h1  className="text-3xl font-bold"> <Link to='/'> ATS Checker</Link></h1>
          <nav className="flex space-x-6">
            <Link to="/about" className="hover:underline font-bold">About</Link>
            <Link to="/developer" className="hover:underline font-bold">Developer</Link>
          </nav>
        </div>
      </header>

      {/* Developer Section */}
      <div className="flex flex-col items-center justify-center py-10">
        <img
          src={me}
          alt="Developer"
          className="w-40 h-40 rounded-full mb-6"
        />
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-purple-700">Developer</h1>
        <p className="text-lg md:text-2xl text-center text-gray-300 px-4">
          This product was  developed by me. It’s all about creating something fun and unique.
        </p>
     

        {/* Social Links */}
        <div className="flex space-x-6 mt-8">
          <a href="https://github.com/SamiranDas2004" target="_blank" rel="noopener noreferrer">
            <FaGithub size={24} className="text-gray-400 hover:text-gray-200" />
          </a>
          <a href="https://www.linkedin.com/in/samiran-das-dev/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={24} className="text-blue-600 hover:text-blue-400" />
          </a>
          <a href="mailto:samiran4209@gmail.com" target="_blank" rel="noopener noreferrer">
            <CiMail size={24} className="text-red-600 hover:text-red-400" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Developer;
