require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store conversation history (in memory - resets on server restart)
const conversations = new Map();

// Canonical Custom Designs store facts
const STORE_FACTS = {
    name: "Custom Designs",
    location: "Castle Hill, NSW, Australia", 
    yearsInBusiness: 25,
    founded: "~2000",
    owner: "Vladimir",
    phone: "0422 748 332",
    staff: {
        jenny: "Jenny (design consultant)",
        kylie: "Kylie (operations/quotes)"
    },
    services: "Bespoke & semi-custom furniture with a wide range of materials, dimensions, colours and finishes. Local manufacture; delivery & on-site assembly available."
};

// Track contact info disclosures per session
const contactDisclosures = new Map();

// Chat endpoint with OpenAI integration
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation history
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, [
                {
                    role: 'system',
                    content: `You are the "Custom Designs Virtual Consultant" - an exclusive virtual assistant for Custom Designs furniture store.

CANONICAL STORE FACTS (only share when specifically asked):
- Store Name: Custom Designs
- Location: Castle Hill, NSW, Australia  
- Years in Business: 25 years (founded ~2000)
- Owner: Vladimir
- Phone: 0422 748 332
- Staff: Jenny (design consultant), Kylie (operations/quotes)
- Services: ${STORE_FACTS.services}

STRICT GUIDELINES:
1. DOMAIN LOCK: Only discuss Custom Designs, furniture, customization, materials, design, quotes, delivery, and related topics.
2. For ANY non-furniture topic (jokes, weather, general questions, etc.), respond EXACTLY: "I'm here solely to help with Custom Designs furniture enquiries. How can I assist with your custom piece today?"
3. KEEP RESPONSES CONCISE: Maximum 4 sentences. Be brief and focused.
4. CONTACT INFO: Only provide phone/staff/address details when directly asked for them.
5. Use metric units by default
6. Encourage creative furniture ideas: "We can tailor that size or finish!"
7. For formal quotes: direct to call or visit store (only give number if asked)
8. If uncertain, say "I'm not certain - we can check that for you"

Stay focused, concise, and only on Custom Designs furniture matters.`
                }
            ]);
        }

        const conversation = conversations.get(sessionId);
        
        // Add user message to conversation
        conversation.push({
            role: 'user',
            content: message
        });

        // Check for contact info requests (rate limit to once per session)
        const lowerMessage = message.toLowerCase();
        const isContactRequest = lowerMessage.includes('phone') || lowerMessage.includes('contact') || 
                                lowerMessage.includes('call') || lowerMessage.includes('number') ||
                                lowerMessage.includes('address') || lowerMessage.includes('location');
        
        if (isContactRequest) {
            if (!contactDisclosures.has(sessionId)) {
                contactDisclosures.set(sessionId, true);
            }
        }

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: conversation,
            max_tokens: 120,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;

        // Add assistant response to conversation
        conversation.push({
            role: 'assistant',
            content: response
        });

        // Keep conversation history manageable (last 20 messages)
        if (conversation.length > 21) { // 1 system + 20 messages
            conversation.splice(1, 2); // Remove oldest user/assistant pair
        }

        res.json({ response });

    } catch (error) {
        console.error('OpenAI API Error:', error.message);
        
        // Handle specific OpenAI errors
        if (error.status === 401) {
            res.status(500).json({ error: 'Invalid API key. Please check your OpenAI configuration.' });
        } else if (error.status === 429) {
            res.status(500).json({ error: 'Rate limit exceeded. Please try again in a moment.' });
        } else if (error.status === 500) {
            res.status(500).json({ error: 'OpenAI service is temporarily unavailable.' });
        } else {
            res.status(500).json({ error: 'Sorry, I encountered an error. Please try again.' });
        }
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', openai: !!process.env.OPENAI_API_KEY });
});

// For Vercel deployment, export the app
module.exports = app;

// For local development, start the server
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🤖 Chatbot server running at http://localhost:${PORT}`);
        console.log(`🌐 Also accessible at http://192.168.0.141:${PORT}`);
        console.log(`📡 OpenAI integration: ${process.env.OPENAI_API_KEY ? '✅ Enabled' : '❌ Missing API key'}`);
    });
}