const Groq = require('groq-sdk');
require('dotenv').config();

const fullStory = `Once upon a time, there was a boy named Daniel. Daniel was ten years old. He lived with his mom, his dad, and his little brother, Ben. Ben was six years old.

Daniel loved his family very much. But sometimes, Daniel felt very sad. He felt like his parents loved Ben more than him.

Every day was the same. When Ben smiled, Mom smiled too. When Ben cried, Dad ran to him fast. When Ben drew a small picture, everyone said, "Wow! Good job, Ben!"

But when Daniel got a good grade at school, no one said anything. When Daniel cleaned his room, no one said "thank you." Daniel started to think, "Maybe I am not special. Maybe nobody sees me."

One night, the family ate dinner together. Ben's cup fell, and juice spilled on the table. Mom said, "It's okay, baby. Don't worry." But last week, Daniel broke a small plate by accident. Dad said, "Daniel! Be more careful next time!"

Daniel felt something hurt inside his heart. He put down his spoon. "Can I go to my room?" he asked quietly.

That night, Daniel sat alone. He looked at an old photo on the wall. In the photo, Daniel was a baby. His mom and dad were holding him and smiling. This was before Ben was born.

"Was I special before?" Daniel whispered. "Am I not special now?"

Tears came down his face. He did not want dinner. He did not want to talk to anyone.

Downstairs, Mom saw Daniel's empty chair. She walked to his room and knocked softly. "Daniel? Can I come in?"

Daniel said nothing, but Mom opened the door anyway. She saw his red eyes. She sat next to him on the bed.

"What's wrong, honey?" she asked softly.

At first, Daniel did not answer. But his heart felt too heavy. So he told the truth.

"You love Ben more than me," Daniel said. "Nobody notices me. I feel invisible in this house."

Mom's eyes filled with tears too. She held Daniel's hands.

"Oh, Daniel," she said. "That is not true. I am so sorry you feel this way."

She said that Ben was still very small. He needed more help with easy things. But that did not mean she loved Daniel less.

"You are strong. You are kind. You are smart," Mom said. "Sometimes, because you are older, we forget to say these words. But my love for you never changed. Not even for one second."

Daniel looked up. "Really?"

"Really," Mom said, smiling through her tears. "You are my son too. My first son. I am sorry I made you feel forgotten."

Later that night, Dad came into the room too. He sat next to Daniel. "I am proud of you every day," Dad said. "Even when I don't say it enough."

Daniel felt very happy. It had been a long time since he felt this way.

After that day, things changed a little. Mom and Dad asked Daniel about his school day. They said nice words about his hard work, not just about Ben's smile.

Daniel learned something important too. Sometimes, love is quiet. But it is always okay to speak up when your heart feels heavy.

Because every child — big or small — deserves to feel like they belong.`;

const prompt = `Analyze the following story and split it into logical visual scenes for a video.
CRITICAL RULES:
1. Break the story when the LOCATION changes, the ENVIRONMENT changes, or a significant visual action occurs.
2. Keep each scene relatively short (roughly 1 to 3 sentences maximum).
3. Output the exact original text of the story (do not summarize or skip words).
4. Output ONLY a valid JSON object with a single "scenes" array property, where each item in the array is a string containing the text for that scene. Do NOT output any reasoning, word counts, or explanations.

Story:
${fullStory}`;

async function run() {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }]
    });
    console.log("CONTENT:", response.choices[0].message.content);
}
run();
