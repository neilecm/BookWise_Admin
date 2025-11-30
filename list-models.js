const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // There isn't a direct "listModels" in the helper, but we can try to generate with a known fallback or check error
    // Actually the API has listModels but the SDK might expose it differently or not at all in older versions.
    // Let's try to just run a generation with a few candidates and see which one doesn't throw 404.
    
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of models) {
      console.log(`Testing ${m}...`);
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("Hello");
        console.log(`SUCCESS: ${m} is working.`);
        return;
      } catch (e) {
        console.log(`FAILED ${m}: ${e.message}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

listModels();
