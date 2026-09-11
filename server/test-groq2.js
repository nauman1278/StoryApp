const Groq = require('groq-sdk');
require('dotenv').config();
async function run() {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: 'Say hello' }]
    }).catch(e => console.error(e));
    console.log(response.choices[0].message);
}
run();
