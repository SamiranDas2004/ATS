import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import About from './About.jsx';
import Developer from './Developer.jsx';
createRoot(document.getElementById('root')).render(
<BrowserRouter>
  <Routes>
   <Route path='/' element={<App/>}/>
   <Route path='/about' element={<About/>}/>
   <Route path='/developer' element={<Developer/>}/>
    </Routes>
    </BrowserRouter>
)
