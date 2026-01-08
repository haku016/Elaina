// Cài: npm install express @google/generative-ai
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
    const result = await model.generateContent(req.body.message);
    res.json({ reply: result.response.text() });
});

app.listen(3000);