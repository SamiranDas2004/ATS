// server.js

import express from 'express';

import cors from 'cors'

const app = express();

const corsOptions={
    origin:"*"
}

app.use(cors(corsOptions))

import uploadRouter from './routes/upload.route.js';
app.use('/api', uploadRouter); 



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
