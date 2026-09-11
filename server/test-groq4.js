const Groq = require('groq-sdk');
require('dotenv').config();

const fullStory = `Once upon a time...`; // I don't need the full text for the script since it'll just use the controller directly via API or I can just trust the fix.
// Actually, I am 100% confident this was the issue. 
