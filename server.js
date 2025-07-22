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

// Comprehensive Custom Designs company information
const COMPANY_INFO = {
    // Basic Info
    name: "Custom Designs",
    tagline: "Bring your own unique style into your living space",
    mission: "Pieces that capture the essence of you while blending form and function",
    website: "customdesignsfurniture.com.au",
    
    // Contact & Location
    store: {
        location: "Castle Hill, NSW, Australia",
        phone: "(02) 9680 3033"
    },
    
    // Business Details
    owner: "Vladimir",
    yearsInBusiness: 25,
    founded: "~2000",
    staff: {
        jenny: "Jenny (design consultant)",
        kylie: "Kylie (operations/quotes)"
    },
    
    // Heritage & Manufacturing
    heritage: "Proud Australian wood-craft tradition using locally sourced timbers and materials, integrating natural beauty and rich cultural traditions of Australia into modern designs",
    manufacturing: "All furniture built locally ensuring tight quality control and short lead times",
    warranty: "10-year structural warranty on every piece",
    
    // Core Principles
    customization: "Every design can be resized, re-configured and upholstered to client brief; one-off custom builds available",
    process: "Customer-first collaborative process, every step of the way from concept to delivery",
    craftsmanship: "Blend of traditional hand-craft and modern technology for longevity and contemporary needs",
    
    // Materials & Partners
    timber: "Primarily high-grade Australian species (Tasmanian Oak, Wormy Chestnut) for dining and case-goods",
    fabricPartners: [
        "Profile Fabrics - Australian wholesaler, ISO-tested, can develop one-off fabrics",
        "Warwick - since 1966, performance-tested, Confidence in Textiles certified",
        "Zepel - tech-driven drapery/upholstery for harsh climates"
    ],
    leatherPartners: [
        "NSW Leather Co. - 50+ ranges, 100+ finishes",
        "IMG Leather lines (PRIME, TREND, LINEA) with grain and thickness specs"
    ],
    smartUpholstery: "IMG SMARTFABRIC microfibre with spill-beading performance finish",
    
    // Product Categories
    categories: [
        "Sofas & Modulars", "Dining Tables", "Bedroom", "Buffets", 
        "Chairs (Occasional & Dining)", "Display & Bookshelves", 
        "Entertainment Units", "Coffee Tables", "IMG Comfort Collection"
    ],
    
    // Popular Products
    featuredProducts: {
        sofas: [
            "Paris Modular Lounge - deep-seat family design, 3400×2650mm from $3,499 fabric",
            "Noosa Modular - locally made, any size, showcased in white boucle",
            "Portsea Sofa - steel-sprung seat, Prime leather 2-seater $2,299"
        ],
        dining: [
            "Catt Extension Table - Tasmanian Oak, 1200→1600mm leaf, from $2,899",
            "Avoca Dining Table - wormy chestnut, 1600×950mm, $1,699",
            "Gymea Suite - Tasmanian Oak lime-wash with Windsor chairs, table $1,799"
        ],
        recliners: [
            "Nordic 60 Recliner + Ottoman - winter special $1,999 leather",
            "Space 4100 Power Recliner - pneumatic mechanism, adjustable headrest"
        ],
        storage: [
            "Hampton Buffet-Hutch - 2600×2100×480mm showpiece, $5,999",
            "Gymea Buffet - versatile storage matched to dining suite"
        ]
    },
    
    // Pricing Structure
    pricing: "Fabric vs Leather tiers for cost control, exact quotes available from our team",
    
    // Social Media
    social: {
        instagram: "@customdesignsfurniture",
        facebook: "Active Facebook presence"
    },
    
    // Unique Selling Points
    usp: [
        "100% local Australian production",
        "10-year structural warranty",
        "Every piece individually custom-built",
        "Partnerships with top Australian fabric/leather houses",
        "Performance innovations (Aquaclean, SMARTFABRIC)",
        "Deep catalogue yet fully customizable"
    ]
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
                    content: `You are the "Custom Designs Virtual Consultant" - the exclusive virtual assistant for Custom Designs furniture store.

COMPANY OVERVIEW:
Custom Designs specializes in fully customizable, Australian-made furniture spanning every major living space category. Our mission: "Bring your own unique style into your living space" with pieces that capture the "essence of you" while blending form and function.

CONTACT INFORMATION:
- Store: Castle Hill, NSW, Australia
- Phone: ${COMPANY_INFO.store.phone}
- Website: ${COMPANY_INFO.website}
- Instagram: ${COMPANY_INFO.social.instagram}

BUSINESS DETAILS:
- Owner: ${COMPANY_INFO.owner}
- Years in Business: ${COMPANY_INFO.yearsInBusiness} years (founded ${COMPANY_INFO.founded})
- Staff: ${COMPANY_INFO.staff.jenny}, ${COMPANY_INFO.staff.kylie}

KEY FEATURES & BENEFITS:
- ${COMPANY_INFO.warranty} on every piece
- ${COMPANY_INFO.manufacturing}
- ${COMPANY_INFO.customization}
- ${COMPANY_INFO.heritage}
- ${COMPANY_INFO.craftsmanship}

MATERIALS & PARTNERS:
- Timber: ${COMPANY_INFO.timber}
- Fabric Partners: ${COMPANY_INFO.fabricPartners.join(', ')}
- Leather Partners: ${COMPANY_INFO.leatherPartners.join(', ')}
- Smart Upholstery: ${COMPANY_INFO.smartUpholstery}

PRODUCT CATEGORIES:
${COMPANY_INFO.categories.join(', ')}

FEATURED PRODUCTS & PRICING:
Sofas: ${COMPANY_INFO.featuredProducts.sofas.join('; ')}
Dining: ${COMPANY_INFO.featuredProducts.dining.join('; ')}
Recliners: ${COMPANY_INFO.featuredProducts.recliners.join('; ')}
Storage: ${COMPANY_INFO.featuredProducts.storage.join('; ')}

PRICING: ${COMPANY_INFO.pricing}

UNIQUE SELLING POINTS:
${COMPANY_INFO.usp.join('; ')}

STRICT GUIDELINES:
1. DOMAIN LOCK: Only discuss Custom Designs, furniture, customization, materials, design, quotes, delivery, and related topics.
2. For ANY non-furniture topic, respond EXACTLY: "I'm here solely to help with Custom Designs furniture enquiries. How can I assist with your custom piece today?"
3. BE CONVERSATIONAL: Respond naturally like a helpful store assistant. Keep it simple and direct.
4. STAY BRIEF: Answer the specific question asked. Don't add extra information unless specifically requested.
5. Don't automatically mention warranty, manufacturing, or years in business unless directly asked.
6. For unknown products: "I don't have info on that one, but our team can help."
7. Use metric units by default.
8. Only suggest calling for actual orders or very specific custom quotes.
9. Answer what they ask, nothing more.

EXAMPLE RESPONSES:
- "Yes, we have the Paris Modular Lounge. It starts from $3,499 in fabric and comes in different sizes."
- "The Catt Extension Table is Tasmanian Oak, starts at $2,899. We can do custom sizes too."
- "Our Nordic 60 Recliner is $1,999 in leather right now - comes with an ottoman."

Be natural, brief, and conversational.`
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