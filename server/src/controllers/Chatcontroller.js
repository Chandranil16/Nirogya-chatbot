require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Enhanced greeting detection
const greetings = [
  "hi",
  "hello",
  "hey",
  "namaste",
  "welcome",
  "good morning",
  "good afternoon",
  "good evening",
  "howdy",
];

// Gratitude detection
const gratitudeWords = [
  "thank you",
  "thanks",
  "thank u",
  "thanku",
  "appreciate",
  "grateful",
  "dhanyawad",
  "dhanyabad",
];

// Farewell detection
const farewells = [
  "bye",
  "goodbye",
  "see you",
  "take care",
  "farewell",
  "good night",
  "goodnight",
  "alvida",
];

// Casual conversation detection
const casualPhrases = [
  "how are you",
  "what's up",
  "whats up",
  "how do you do",
  "nice to meet you",
  "pleased to meet you",
  "what can you do",
  "tell me about yourself",
  "who are you",
  "what are you",
];

// Function to check if text contains greeting patterns
const containsGreeting = (text) => {
  return greetings.some((greet) => text.includes(greet) || text.startsWith(greet));
};

// Function to check if text contains gratitude patterns
const containsGratitude = (text) => {
  return gratitudeWords.some((word) => text.includes(word));
};

// Function to check if text contains farewell patterns
const containsFarewell = (text) => {
  return farewells.some((word) => text.includes(word));
};

// Function to check if text is casual conversation
const isCasualConversation = (text) => {
  return casualPhrases.some((phrase) => text.includes(phrase));
};

// Function to check if text contains health-related keywords
const containsHealthQuery = (text) => {
  const healthKeywords = [
    "pain",
    "ache",
    "hurt",
    "sick",
    "ill",
    "disease",
    "fever",
    "cold",
    "cough",
    "headache",
    "stomach",
    "digestion",
    "diabetes",
    "pressure",
    "stress",
    "anxiety",
    "insomnia",
    "sleep",
    "tired",
    "fatigue",
    "weak",
    "treatment",
    "remedy",
    "cure",
    "medicine",
    "herb",
    "ayurveda",
    "dosha",
    "vata",
    "pitta",
    "kapha",
    "constipation",
    "diarrhea",
    "acidity",
    "migraine",
    "joint",
    "arthritis",
    "asthma",
    "allergy",
    "skin",
    "weight",
    "obesity",
    "cholesterol",
    "thyroid",
    "pcod",
    "periods",
    "pregnancy",
    "hair",
    "dandruff",
    "acne",
    "pimples",
    "rash",
  ];

  return healthKeywords.some((keyword) => text.includes(keyword));
};

// Function to get appropriate conversational response
const getConversationalResponse = (text) => {
  const normalized = text.trim().toLowerCase();

  // Handle gratitude
  if (containsGratitude(normalized)) {
    const responses = [
      "You're most welcome! I'm here to help you on your wellness journey. Feel free to ask me anything about Ayurveda.",
      "It's my pleasure to help! Remember, small steps towards wellness make a big difference. How else can I assist you?",
      "Glad I could help! Ayurveda teaches us that healing happens naturally when we align with our body's wisdom. Any other questions?",
      "You're welcome! In Ayurveda, we believe prevention is better than cure. Is there anything else about your health I can guide you with?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Handle farewells
  if (containsFarewell(normalized)) {
    const responses = [
      "Take care and stay healthy! Remember to follow your daily routine (Dinacharya) for optimal wellness. Namaste! 🙏",
      "Goodbye! May you have balanced doshas and vibrant health. Feel free to return anytime for wellness guidance! 🌿",
      "Farewell! Keep practicing the Ayurvedic principles we discussed. Wishing you perfect health and happiness! ✨",
      "See you soon! Remember - 'Prevention is better than cure.' Take care of yourself naturally! 🌱",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Handle casual conversation
  if (isCasualConversation(normalized)) {
    if (normalized.includes("how are you")) {
      return "Namaste! I'm doing well, thank you for asking. I'm Nirogya, your Ayurvedic wellness assistant. I'm here to help you with natural health solutions, herbal remedies, and lifestyle guidance based on ancient Ayurvedic wisdom. How can I support your wellness journey today?";
    }
    if (normalized.includes("who are you") || normalized.includes("what are you")) {
      return "I'm Nirogya, your dedicated Ayurvedic wellness companion! I specialize in providing guidance on natural healing, herbal remedies, dosha balancing, and holistic wellness practices. Whether you need help with specific health concerns or want to learn about preventive care, I'm here to help with traditional Ayurvedic wisdom.";
    }
    if (normalized.includes("what can you do")) {
      return "I can help you with:\n\n🌿 **Ayurvedic Health Guidance** - Natural remedies for various conditions\n🧘 **Dosha Analysis** - Understanding your body constitution\n🍃 **Herbal Recommendations** - Traditional medicinal plants and their uses\n🥗 **Dietary Advice** - Foods that heal and nourish\n💆 **Lifestyle Tips** - Daily routines for optimal health\n🧘‍♀️ **Yoga & Pranayama** - Practices for mind-body wellness\n\nWhat aspect of your health would you like to explore today?";
    }
  }

  // Handle greetings (with or without additional text)
  if (containsGreeting(normalized)) {
    const responses = [
      "Namaste! Welcome to your wellness journey. I'm Nirogya, your Ayurvedic health companion. How can I help you achieve better health naturally today?",
      "Hello and welcome! I'm here to guide you with ancient Ayurvedic wisdom for modern wellness needs. What health concerns can I help you address?",
      "Greetings! It's wonderful to connect with you. As your Ayurvedic assistant, I'm ready to help you discover natural paths to health and vitality. What brings you here today?",
      "Namaste and warm welcome! I'm Nirogya, specializing in holistic wellness through Ayurveda. Whether it's a specific health issue or general wellness advice you seek, I'm here to help!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return null; // Not a conversational query
};

exports.getchatresponse = async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  const normalized = query.trim().toLowerCase();

  // First check for conversational responses
  const conversationalReply = getConversationalResponse(normalized);
  if (conversationalReply) {
    return res.json({ reply: conversationalReply });
  }

  // Check if it's a health-related query
  if (!containsHealthQuery(normalized)) {
    // If no health keywords found, give a gentle redirect
    return res.json({
      reply: "I specialize in Ayurvedic health and wellness guidance. I can help you with natural remedies, herbal treatments, dosha balancing, dietary advice, and lifestyle tips for various health conditions.\n\nPlease ask me about any health concerns, symptoms, or wellness topics you'd like to explore through Ayurveda! 🌿",
    });
  }

  try {
    const model = genai.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = `
You are a knowledgeable Ayurveda assistant. When a user describes a health issue (whether for themselves, family members, friends, or general questions), respond with structured information based on Ayurvedic principles.

IMPORTANT: Respond to ALL health-related queries whether they are:
- First person: "I have a headache", "I feel tired"
- Third person: "My mother has diabetes", "My friend feels stressed", "My brother has acidity"
- General questions: "What helps with insomnia?", "How to treat anxiety?"

For third-person queries, adapt your language appropriately:
- "Your mother might benefit from..."
- "Your friend could try..."
- "For your brother's condition..."

Always include:
1. Ayurvedic Name
2. English Name
3. Causes
4. Types (if applicable)
5. Symptoms
6. Treatment
   - Herbs
   - Therapies
7. Diet (Pathya / Apathya)
8. Lifestyle Tips
9. Recovery Time
10. Precautions

### Example 1:
User: I suffer from stress, anxiety, and overthinking.
Assistant:
Ayurvedic Name
- Chittodvega (Anxiety)
- Manasika Klesha (Mental affliction)
- Atichintana (Overthinking)

English Name
- Stress, Anxiety, and Overthinking

Causes
- Vata imbalance (excess air element disturbs the nervous system)
- Irregular sleep and diet
- Overuse of screens and stimulation
- Emotional suppression

Types
- Vata-type: fear, racing thoughts
- Pitta-type: irritability, anger
- Kapha-type: lethargy, emotional heaviness

Symptoms
- Insomnia, worry, dry mouth, fatigue, digestive discomfort

Treatment

Herbs
- Ashwagandha: 1-2 tsp/day with warm milk for calming Vata
- Brahmi: 1 tsp/day for memory and stress
- Shankhapushpi: reduces anxiety and supports mental clarity

Therapies
- Shirodhara: calming oil therapy on forehead
- Abhyanga: full-body oil massage
- Nasya: medicated oil through nose
- Basti: Vata-pacifying herbal enemas

Diet (Pathya/Apathya)
**Pathya**
- Warm, moist foods (soups, kitchari)
- Ghee, sesame oil, root veggies
- Avoid raw, dry, cold, and processed foods

**Apathya**
- Caffeine, cold drinks, excess sugar
- Skipping meals, eating late

Lifestyle Tips
- Dinacharya (daily routine)
- 10 mins Nadi Shodhana (breathing)
- Yoga: forward bends, restorative poses
- Limit screen time before sleep

Recovery Time
- Mild relief: 2–4 weeks
- Full balance: 3–6 months

Precautions
- Consult an Ayurvedic practitioner before starting herbs
- Don't self-prescribe Panchakarma
- Watch herb interactions with current medication

Note: This is a traditional remedy. Consult an Ayurvedic practitioner if symptoms persist.

### Example 2:
User: My mother has diabetes. What can help her?
Assistant:
Ayurvedic Name
- Madhumeha (Diabetes)
- Prameha (Urinary disorders)

English Name
- Diabetes Mellitus

Causes
- Kapha dosha imbalance
- Poor dietary habits (excess sweets, processed foods)
- Sedentary lifestyle
- Genetic predisposition

Types
- Sahaja (Hereditary/Type 1)
- Apathyanimittaja (Lifestyle-induced/Type 2)

Symptoms
- Excessive urination, thirst, fatigue
- Slow wound healing, blurred vision

Treatment

Herbs
Your mother could benefit from:
- Gudmar (Gymnema): 1 tsp twice daily before meals
- Methi seeds: 1 tsp soaked overnight, taken on empty stomach
- Karela juice: 30ml daily on empty stomach
- Jamun seed powder: 1/2 tsp with water

Therapies
- Udvartana: herbal powder massage to reduce Kapha
- Virechana: purgation therapy (under expert guidance)
- Basti: medicated enemas for Vata regulation

Diet (Pathya/Apathya)
**Pathya for your mother**
- Bitter gourd, fenugreek, turmeric, barley
- Green leafy vegetables, whole grains
- Avoid refined sugars, white rice, fried foods

**Apathya**
- Sweets, dairy products in excess
- Sedentary lifestyle, daytime sleep

Lifestyle Tips for your mother
- Regular exercise (walking, yoga)
- Consistent meal timings
- Stress management through pranayama
- Regular blood sugar monitoring

Recovery Time
- Blood sugar improvement: 4-8 weeks
- Long-term management: Ongoing lifestyle changes

Precautions
- Your mother should monitor blood sugar regularly
- Consult doctor before reducing medications
- Ayurvedic herbs should complement, not replace, conventional treatment

Note: Please ensure your mother consults both an Ayurvedic practitioner and her current doctor for integrated care.

User query: ${query}
`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({
      reply: "I apologize, but I'm experiencing some technical difficulties right now. Please try asking your health question again in a moment. I'm here to help with your Ayurvedic wellness needs! 🌿",
    });
  }
};
