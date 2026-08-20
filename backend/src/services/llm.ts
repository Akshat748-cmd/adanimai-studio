import { BusinessProfile } from '@adanimai/shared';

export interface ExtractedBusinessData {
  name: string;
  category: string;
  description: string;
  products: string[];
  suggestedTone: string;
  location?: string;
}

const LANGUAGE_PROMPT_INSTRUCTIONS: Record<string, string> = {
  hi: 'Hindi (written in clear, authentic Hindi Devanagari script or natural spoken Hindustani)',
  en: 'English (crisp, engaging, compelling advertisement English)',
  pa: 'Punjabi (in authentic Gurmukhi script / natural spoken Punjabi)',
  mr: 'Marathi (in authentic Marathi Devanagari script)',
  ta: 'Tamil (in authentic Tamil script)',
  te: 'Telugu (in authentic Telugu script)',
  bn: 'Bengali (in authentic Bengali script)',
  gu: 'Gujarati (in authentic Gujarati script)',
  kn: 'Kannada (in authentic Kannada script)',
  ml: 'Malayalam (in authentic Malayalam script)',
};

/**
 * Pass 1: Analyzes raw scraped text or manual notes into a structured business profile.
 */
export async function analyzeBusinessWithLLM(
  rawContent: string,
  urlHint?: string,
  manualHint?: Partial<BusinessProfile>
): Promise<ExtractedBusinessData> {
  const prompt = `You are an expert business intelligence and advertisement analyst. 
Analyze the provided content and extract a clean structured JSON business profile.

Content to analyze:
${rawContent.slice(0, 3500)}

${urlHint ? `Website URL: ${urlHint}` : ''}
${manualHint?.name ? `Given Name: ${manualHint.name}` : ''}
${manualHint?.category ? `Given Category: ${manualHint.category}` : ''}

CRITICAL RULES:
1. "category" MUST accurately identify the business domain (e.g., "Education & Coaching" for schools/colleges, "Health & Wellness / Clinic" for hospitals/doctors, "Food & Beverage / Restaurant" for restaurants/cafes, "Real Estate & Construction" for builders/properties, "Tech & Digital Services" for IT/software, "Automobile & Repair" for vehicles, "Beauty, Salon & Spa" for salons, "Retail Store & Fashion" for retail shops).
2. "products" MUST list 2-4 actual key offerings / services / features extracted from the content (e.g. for a school: ["Admissions Open (Playgroup to XII)", "Science, Commerce & Arts Streams", "Modern Campus & Sports Facilities"]).
3. "name" should be the official business/institution name.

Respond ONLY with valid JSON in this exact structure, with NO markdown formatting, NO backticks, NO extra commentary:
{
  "name": "Business or Institution Name",
  "category": "Education & Coaching / Health & Wellness / etc.",
  "description": "2-3 sentences summarizing the value proposition and specialty.",
  "products": ["Key Offering 1", "Key Offering 2", "Key Offering 3"],
  "suggestedTone": "Energetic",
  "location": "City or Region (if detectable, otherwise null)"
}`;

  try {
    const response = await callAnyAvailableLLM(prompt);
    if (response) {
      const cleaned = response.trim().replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.name && parsed.category) {
        return {
          name: parsed.name || manualHint?.name || 'My Business',
          category: parsed.category || manualHint?.category || detectCategoryFromContent(rawContent, urlHint, manualHint?.name),
          description: parsed.description || manualHint?.description || rawContent.slice(0, 200),
          products: Array.isArray(parsed.products) && parsed.products.length > 0 
            ? parsed.products 
            : extractOfferingsFromContent(rawContent, parsed.category || 'Retail Store & Fashion'),
          suggestedTone: parsed.suggestedTone || 'Energetic',
          location: parsed.location || manualHint?.location || '',
        };
      }
    }
  } catch (err) {
    console.warn('Live LLM Pass 1 analysis failed or not configured, using smart contextual analyzer:', err);
  }

  return smartContextualAnalysis(rawContent, urlHint, manualHint);
}

/**
 * Pass 2: Generates a persuasive, sales-oriented advertisement script in the selected language.
 * Strictly tailored to the specific business category and exact offerings.
 */
export async function generateAdScriptWithLLM(
  business: BusinessProfile,
  languageCode: string = 'en',
  customTone?: string
): Promise<string> {
  const languageDesc = LANGUAGE_PROMPT_INSTRUCTIONS[languageCode] || 'English';
  const tone = customTone || business.tone || 'Energetic & Persuasive';

  const prompt = `You are a world-class commercial copywriter and TV advertisement spokesperson scriptwriter.

Task:
Write a short, powerful, highly persuasive advertisement script for this business/institution that an animated spokesperson/avatar will speak aloud in a video ad to promote it.

CRITICAL INSTRUCTIONS:
1. CATEGORY-AWARE COPY: Promote this exact business according to its real domain (${business.category}).
   - If it's a School/College/Education: Focus on quality education, bright student future, admissions open, expert teachers, modern campus.
   - If it's Healthcare/Doctor: Focus on health, trusted care, specialist treatments, booking appointments.
   - If it's Food/Restaurant: Focus on delicious taste, fresh ingredients, dining/delivery.
   - If it's Real Estate: Focus on dream homes, prime locations, modern amenities.
   - If it's Tech/Service: Focus on business growth, innovative solutions, reliable support.
   - If it's Retail/Fashion: Focus on latest collections, top quality, exclusive offers.
2. STRICT SPEECH OUTPUT: The output will be fed directly into a text-to-speech engine. Output ONLY the literal spoken words. Do NOT include any stage directions, no speaker tags (like "Narrator:"), no sound effect notes, no bracketed instructions [smiles/waves], no quotes, and no markdown. Just the exact words to be spoken aloud.
3. Language: ${languageDesc}.
4. Tone: ${tone}.
5. Length: 45 to 70 words (approx 20 to 30 seconds of spoken video).

Business Details:
- Name: ${business.name}
- Category: ${business.category}
- Description: ${business.description}
- Key Offerings / Products: ${business.products.join(', ')}
${business.location ? `- Location: ${business.location}` : ''}
`;

  try {
    const response = await callAnyAvailableLLM(prompt);
    if (response && response.trim().length > 15) {
      return cleanSpeechScript(response);
    }
  } catch (err) {
    console.warn('Live LLM Pass 2 script generation failed or not configured, using category-tailored generator:', err);
  }

  return generateTailoredCategoryScript(business, languageCode);
}

function cleanSpeechScript(raw: string): string {
  return raw
    .replace(/^["']|["']$/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/^(Spokesperson|Host|Presenter|Voiceover|Narrator|Actor|Character):\s*/i, '')
    .replace(/\*\*/g, '')
    .replace(/#/g, '')
    .trim();
}

async function callAnyAvailableLLM(prompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 700, temperature: 0.7 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn('Gemini API call failed:', e);
    }
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() !== '') {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 700,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn('Groq API call failed:', e);
    }
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey.trim() !== '') {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 700,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn('OpenAI API call failed:', e);
    }
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && anthropicKey.trim() !== '') {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 700,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn('Anthropic API call failed:', e);
    }
  }

  return null;
}

function smartContextualAnalysis(
  rawContent: string,
  urlHint?: string,
  manualHint?: Partial<BusinessProfile>
): ExtractedBusinessData {
  const name = manualHint?.name?.trim() || cleanExtractedName(rawContent, urlHint);
  const category = manualHint?.category || detectCategoryFromContent(rawContent, urlHint, name);
  
  const description = manualHint?.description?.trim() || 
    extractSmartDescription(rawContent, name, category);

  const products = manualHint?.products && manualHint.products.length > 0 
    ? manualHint.products 
    : extractOfferingsFromContent(rawContent, category);

  return {
    name,
    category,
    description,
    products,
    suggestedTone: manualHint?.tone || 'Energetic',
    location: manualHint?.location || extractLocationHint(rawContent),
  };
}

function detectCategoryFromContent(content: string, url?: string, name?: string): string {
  const text = `${url || ''} ${name || ''} ${content}`.toLowerCase();

  if (
    /\b(gift|gifting|sustainable|eco-friendly|bamboo|seed paper|corporate gift|greener|handicraft|stationery|custom merchandise|hampers?|green chapter)\b/i.test(text)
  ) {
    return 'Sustainable & Corporate Gifting';
  }

  if (
    /\b(school|public school|vidyalaya|academy|college|university|institute|admissions?|students?|cbse|icse|rbse|board|class(?:es)?|standard|playgroup|nursery|kindergarten|k-12|curriculum|faculty|campus|tuition|coaching|education|learning|exam|syllabus|alumni)\b/i.test(text)
  ) {
    return 'Education & Coaching';
  }

  if (
    /\b(hospital|clinic|healthcare|medical|doctor|dental|dentist|eye care|optometry|ortho|pediatric|surgeon|surgery|pharma|pharmacy|nursing|patient|treatment|diagnostics?|pathology|therapy|wellness)\b/i.test(text)
  ) {
    return 'Health & Wellness / Clinic';
  }

  if (
    /\b(juice|smoothie|shake|mocktail|cold drink|fresh juice|cafe|coffee|espresso|brew)\b/i.test(text)
  ) {
    return 'Juice Bar & Café';
  }

  if (
    /\b(restaurant|food|dining|cuisine|kitchen|thali|sweets|mithai|bakery|dhaba|pizza|burger|biryani|snack|meal|taste|delicious|dine|takeaway|menu|catering)\b/i.test(text)
  ) {
    return 'Food & Beverage / Restaurant';
  }

  if (
    /\b(salon|spa|parlour|parlor|beauty|makeup|haircut|hairstyle|bridal|facial|skincare|cosmetics?|grooming|massage)\b/i.test(text)
  ) {
    return 'Beauty, Salon & Spa';
  }

  if (
    /\b(automobile|car|bike|motorcycle|auto repair|mechanic|garage|workshop|service center|tyre|tire|motors|detailing|oil change|spares)\b/i.test(text)
  ) {
    return 'Automobile & Repair';
  }

  if (
    /\b(real estate|property|properties|builder|developer|construction|flats?|apartments?|plots?|villas?|housing|commercial space|residence|broker|realtor)\b/i.test(text)
  ) {
    return 'Real Estate & Construction';
  }

  if (
    /\b(software|tech|digital marketing|web development|app development|it solutions|seo|cloud|hosting|cyber|ai|saas|agency)\b/i.test(text)
  ) {
    return 'Tech & Digital Services';
  }

  if (
    /\b(clothing|clothes|fashion|apparel|garments|store|shop|showroom|boutique|jewellery|jewelry|footwear|supermarket|grocery|mart|collection|retail)\b/i.test(text)
  ) {
    return 'Retail Store & Fashion';
  }

  return 'Retail Store & Fashion';
}

function extractOfferingsFromContent(rawContent: string, category: string): string[] {
  const contentLower = rawContent.toLowerCase();
  const offerings: string[] = [];

  if (category === 'Sustainable & Corporate Gifting') {
    return ['Eco-Friendly Corporate Gifts & Hampers', 'Custom Plantable Seed & Bamboo Products', 'Sustainable Brand Merchandise'];
  }

  if (category === 'Education & Coaching') {
    if (/admission/i.test(contentLower)) offerings.push('Admissions Open (Playgroup to Class XII)');
    if (/science|commerce|arts|stream/i.test(contentLower)) offerings.push('Science, Commerce & Arts Streams');
    if (/campus|sports|lab|facility/i.test(contentLower)) offerings.push('Modern Campus & Digital Labs');
    if (/faculty|teacher|expert/i.test(contentLower)) offerings.push('Experienced & Caring Faculty');
    if (offerings.length === 0) {
      return ['Playgroup to Class XII Education', 'Modern Infrastructure & Sports', 'Admissions Open'];
    }
    return offerings.slice(0, 3);
  }

  if (category === 'Health & Wellness / Clinic') {
    if (/emergency|24/i.test(contentLower)) offerings.push('24/7 Emergency & ICU Services');
    if (/doctor|consult/i.test(contentLower)) offerings.push('Specialist Doctor Consultations');
    if (/lab|diagnostic|test/i.test(contentLower)) offerings.push('Advanced Diagnostic & Pathology Lab');
    if (offerings.length === 0) {
      return ['Specialist Doctor Consultations', 'Modern Diagnostic & Care Facilities', '24/7 Patient Support'];
    }
    return offerings.slice(0, 3);
  }

  if (category === 'Food & Beverage / Restaurant' || category === 'Juice Bar & Café') {
    if (/juice|shake|beverage/i.test(contentLower)) offerings.push('100% Pure & Fresh Juices / Shakes');
    if (/food|thali|dish|special/i.test(contentLower)) offerings.push('Special Delicious Multi-Cuisine Menu');
    if (/dine|delivery|takeaway/i.test(contentLower)) offerings.push('Hygienic Dine-in & Fast Home Delivery');
    if (offerings.length === 0) {
      return ['Signature Delicious Dishes', 'Fresh & Pure Ingredients', 'Dine-in & Quick Home Delivery'];
    }
    return offerings.slice(0, 3);
  }

  if (category === 'Real Estate & Construction') {
    return ['Luxury 2/3 BHK Flats & Villas', 'Prime Location Commercial Spaces', 'Verified & Approved Plots'];
  }

  if (category === 'Tech & Digital Services') {
    return ['Custom Web & Mobile App Development', 'High-ROI Digital Marketing & SEO', '24/7 Technical Support'];
  }

  if (category === 'Automobile & Repair') {
    return ['Complete Vehicle Servicing & Inspection', 'Engine & Brake Maintenance', '100% Genuine Spare Parts'];
  }

  if (category === 'Beauty, Salon & Spa') {
    return ['Trendy Haircuts & Styling', 'Bridal Makeup & Skin Glow Treatments', 'Relaxing Spa & Facial Packages'];
  }

  return ['Exclusive New Collections', 'Premium Quality Standards', 'Best Value & Special Offers'];
}

function cleanExtractedName(rawContent: string, urlHint?: string): string {
  const lines = rawContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^(Keywords|Description):\s*/i, '').trim();
    const cleaned = firstLine.split(/[-|–•]/)[0].trim();
    if (cleaned.length >= 3 && cleaned.length <= 60) {
      return cleaned;
    }
  }

  if (urlHint) {
    try {
      const hostname = new URL(urlHint).hostname.replace(/^www\./i, '');
      const parts = hostname.split('.')[0];
      return parts.charAt(0).toUpperCase() + parts.slice(1);
    } catch {}
  }

  return 'Our Business';
}

function extractSmartDescription(rawContent: string, name: string, category: string): string {
  const descMatch = rawContent.match(/Description:\s*([^\n]+)/i);
  if (descMatch && descMatch[1].trim().length > 20) {
    return descMatch[1].trim();
  }

  const clean = rawContent.replace(/Keywords:[^\n]+/i, '').replace(/Description:[^\n]+/i, '').trim();
  if (clean.length > 30) {
    return clean.slice(0, 240) + '...';
  }

  return `${name} provides premier ${category} services with a commitment to excellence and quality.`;
}

function extractLocationHint(rawContent: string): string {
  const match = rawContent.match(/\b(in|at|near)\s+([A-Z][a-zA-Z\s]{2,20}(?:City|Road|Nagar|Colony|Marg|Rajasthan|Delhi|Mumbai|Bangalore|Jaipur|Punjab|Hindaun|Pune|Hyderabad|Chennai|Kolkata|Ahmedabad))\b/i);
  return match ? match[2].trim() : '';
}

function generateTailoredCategoryScript(business: BusinessProfile, lang: string): string {
  const name = business.name || 'हमारा संस्थान';
  const category = business.category || 'Retail Store & Fashion';
  const prod = business.products[0] || 'बेस्ट सर्विसेज';
  const allProds = business.products.slice(0, 2).join(' और ') || prod;
  const loc = business.location ? ` (${business.location})` : '';
  const locEn = business.location ? ` in ${business.location}` : '';

  if (category === 'Sustainable & Corporate Gifting') {
    switch (lang) {
      case 'hi':
        return `क्या आप अपने ब्रांड और कॉर्पोरेट इवेंट्स के लिए 100% इको-फ्रेंडली और प्रीमियम गिफ्ट्स ढूंढ रहे हैं? तो आज ही जुड़िए ${name}${loc} से! यहाँ आपको मिलते हैं कस्टम ${allProds} जो आपके ब्रांड को देते हैं एक ग्रीन और सस्टेनेबल पहचान। आज ही अपने कॉर्पोरेट ऑर्डर्स के लिए संपर्क करें!`;
      case 'en':
      default:
        return `Looking to make your corporate gifting meaningful and eco-friendly? Partner with ${name}${locEn}! We bring you premium, customized ${allProds} designed for a greener corporate future. Elevate your brand with sustainable corporate gifts — connect with us today!`;
    }
  }

  if (category === 'Education & Coaching') {
    switch (lang) {
      case 'hi':
        return `क्या आप अपने बच्चों के उज्ज्वल और सुनहरे भविष्य के लिए एक बेहतरीन स्कूल की तलाश में हैं? तो आज ही जुड़िए ${name}${loc} से! यहाँ आपको मिलती है क्लास 12th तक की उच्च स्तरीय शिक्षा, आधुनिक लैब्स और अनुभवी फैकल्टी का पूरा मार्गदर्शन। नए सत्र के एडमिशन्स ओपन हैं, आज ही विजिट करें और अपने बच्चे के सपनों को दें नई उड़ान!`;
      case 'pa':
        return `ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਬੱਚਿਆਂ ਦੇ ਸੁਨਹਿਰੇ ਭਵਿੱਖ ਲਈ ਇੱਕ ਬਿਹਤਰੀਨ ਸਕੂਲ ਦੀ ਭਾਲ ਕਰ ਰਹੇ ਹੋ? ਤਾਂ ਅੱਜ ਹੀ ਜੁੜੋ ${name}${loc} ਨਾਲ! ਇੱਥੇ ਮਿਲਦੀ ਹੈ ਵਧੀਆ ਸਿੱਖਿਆ, ਆਧੁਨਿਕ ਸਹੂਲਤਾਂ ਅਤੇ ਤਜਰਬੇਕਾਰ ਅਧਿਆਪਕ। ਦਾਖਲੇ ਸ਼ੁਰੂ ਹਨ, ਅੱਜ ਹੀ ਸੰਪਰਕ ਕਰੋ!`;
      case 'mr':
        return `तुम्ही तुमच्या मुलांच्या उज्ज्वल भविष्यासाठी एका उत्कृष्ट शाळेच्या शोधात आहात का? मग आजच भेट द्या ${name}${loc}! येथे मिळते दर्जेदार शिक्षण, आधुनिक लॅब्स आणि तज्ज्ञ शिक्षकांचे मार्गदर्शन. नवीन प्रवेश सुरू आहेत, आजच संपर्क साधा!`;
      case 'ta':
        return `உங்கள் குழந்தைகளின் பிரகாசமான எதிர்காலத்திற்கு ஒரு சிறந்த பள்ளியை தேடுகிறீர்களா? உடனே இணையுங்கள் ${name}${loc}! சிறந்த கல்வி, நவீன வசதிகள் மற்றும் அனுபவமிக்க ஆசிரியர்கள். சேர்க்கை தொடங்குகிறது, இன்றே அணுகுங்கள்!`;
      case 'te':
        return `మీ పిల్లల ఉజ్వల భవిష్యత్తు కోసం అత్యుత్తమ పాఠశాల కోసం చూస్తున్నారా? అయితే ఈ రోజే సంప్రదించండి ${name}${loc}! నాణ్యమైన విద్య, ఆధునిక సదుపాయాలు మరియు అనుభవజ్ఞులైన ఉపాధ్యాయులు. అడ్మిషన్లు ప్రారంభమయ్యాయి!`;
      case 'bn':
        return `আপনার সন্তানের উজ্জ্বল ভবিষ্যতের জন্য কি একটি সেরা স্কুল খুঁজছেন? তাহলে আজই যোগাযোগ করুন ${name}${loc}! এখানে পাবেন উন্নত শিক্ষা, আধুনিক পরিকাঠামো ও অভিজ্ঞ শিক্ষকবৃন্দ। অ্যাডমিশন শুরু হয়ে গেছে, আজই আসুন!`;
      case 'gu':
        return `શું તમે તમારા બાળકોના ઉજ્જવળ ભવિષ્ય માટે એક ઉત્તમ સ્કૂલ શોધી રહ્યા છો? તો આજે જ મુલાકાત લો ${name}${loc}! શ્રેષ્ઠ શિક્ષણ, આધુનિક સુવિધાઓ અને અનુભવી ફેકલ્ટી. નવા પ્રવેશ શરૂ છે, આજે જ સંપર્ક કરો!`;
      case 'en':
      default:
        return `Looking for the perfect educational institution to shape your child's bright future? Look no further than ${name}${locEn}! With top-tier academic excellence, modern infrastructure, and admissions open now, give your child the foundation they truly deserve. Visit or contact us today!`;
    }
  }

  if (category === 'Health & Wellness / Clinic') {
    switch (lang) {
      case 'hi':
        return `आपकी और आपके परिवार की अच्छी सेहत है हमारी पहली प्राथमिकता! ${name}${loc} पर आपको मिलती है ${allProds} और अनुभवी डॉक्टर्स की बेहतरीन देखरेख। आधुनिक तकनीक और भरोसेमंद इलाज के लिए आज ही संपर्क करें और अपना अपॉइंटमेंट बुक करें!`;
      case 'en':
      default:
        return `Your family's health and wellness deserve the highest standard of care! Visit ${name}${locEn} for ${allProds}, backed by experienced medical specialists and state-of-the-art facilities. Book your consultation today!`;
    }
  }

  if (category === 'Food & Beverage / Restaurant' || category === 'Juice Bar & Café') {
    switch (lang) {
      case 'hi':
        return `क्या आप ढूंढ रहे हैं सबसे लज़ीज़, ताज़ा और 100% शुद्ध स्वाद? तो सीधे चले आइए ${name}${loc}! यहाँ आपको मिलता है ${allProds} का लाजवाब स्वाद, वो भी एकदम सही दाम और बेहतरीन माहौल में। आज ही आइए और अपने अपनों के साथ आनंद लीजिए!`;
      case 'en':
      default:
        return `Craving incredible taste, pure ingredients, and mouthwatering freshness? Head straight to ${name}${locEn}! Indulge in our signature ${allProds} crafted with love and top quality. Visit us today or order now to taste the magic!`;
    }
  }

  if (category === 'Real Estate & Construction') {
    switch (lang) {
      case 'hi':
        return `क्या आप ढूंढ रहे हैं अपने सपनों का घर या सुरक्षित इन्वेस्टमेंट प्रॉपर्टी? तो आज ही जानिए ${name}${loc} के बारे में! ${allProds} के साथ पाएं प्राइम लोकेशन, मॉडर्न सुविधाएं और बेस्ट डील्स। आज ही अपनी साइट विजिट बुक करें!`;
      case 'en':
      default:
        return `Finding your dream property is now simple and secure with ${name}${locEn}! Explore our premium ${allProds} in top locations with world-class amenities. Book your site visit or contact us today!`;
    }
  }

  if (category === 'Tech & Digital Services') {
    switch (lang) {
      case 'hi':
        return `क्या आप अपने बिज़नेस को तेजी से ऑनलाइन ग्रो करना चाहते हैं? ${name}${loc} लेकर आया है ${allProds} के लिए सुपर-स्मार्ट और पावरफुल सॉल्यूशंस! टेक्नोलॉजी के साथ अपने काम को दें नई रफ्तार। आज ही फ्री कंसल्टेशन के लिए संपर्क करें!`;
      case 'en':
      default:
        return `Ready to scale your business with modern technology? Partner with ${name}${locEn} for industry-leading ${allProds}! Supercharge your growth with cutting-edge digital solutions. Get in touch with our experts today!`;
    }
  }

  switch (lang) {
    case 'hi':
      return `क्या आप ढूंढ रहे हैं सबसे बेस्ट और प्रीमियम क्वालिटी ${prod}? तो सीधे आइए ${name}${loc}! यहाँ आपको मिलेगा लेटेस्ट वैरायटी और शानदार कलेक्शन का सबसे बेहतरीन अनुभव, वो भी किफायती दामों में। आज ही आइए और खुद अनुभव कीजिए!`;
    case 'pa':
      return `ਕੀ ਤੁਸੀਂ ਲੱਭ ਰਹੇ ਹੋ ਸਭ ਤੋਂ ਵਧੀਆ ਕੁਆਲਿਟੀ ${prod}? ਤਾਂ ਸਿੱਧੇ ਆਓ ${name}${loc}! ਇੱਥੇ ਤੁਹਾਨੂੰ ਮਿਲਦਾ ਹੈ ਸ਼ਾਨਦਾਰ ਕੁਆਲਿਟੀ ਅਤੇ ਲੇਟੈਸਟ ਕਲੈਕਸ਼ਨ, ਉਹ ਵੀ ਵਧੀਆ ਰੇਟਾਂ ਤੇ। ਅੱਜ ਹੀ ਆਓ ਅਤੇ ਖੁਦ ਅਨੁਭਵ ਕਰੋ!`;
    case 'mr':
      return `तुम्ही शोधत आहात का सर्वात उत्तम आणि दर्जेदार ${prod}? मग आजच भेट द्या ${name}${loc}! येथे तुम्हाला मिळते उत्तम दर्जा आणि नवीन व्हरायटी, अगदी योग्य दरात. आजच या आणि खात्री करा!`;
    case 'ta':
      return `சிறந்த மற்றும் தரமான ${prod} பெற விரும்புகிறீர்களா? உடனே வாருங்கள் ${name}${loc}! இங்கே உங்களுக்கு கிடைக்கும் மிகச் சிறந்த தரம் மற்றும் நம்பகமான சேவை. இன்றே வாருங்கள்!`;
    case 'te':
      return `మీరు అత్యుత్తమమైన క్వాలిటీ ${prod} కోసం చూస్తున్నారా? అయితే వెంటనే రండి ${name}${loc}! ఇక్కడ మీకు లభిస్తుంది అద్భుతమైన క్వాలిటీ మరియు తాజా కలెక్షన్. ఈ రోజే రండి!`;
    case 'bn':
      return `আপনি কি খুঁজছেন সেরা কোয়ালিটির ${prod}? তাহলে চলে আসুন ${name}${loc}! এখানে পাবেন সবচেয়ে সেরা কালেকশন ও দুর্দান্ত অফার। আজই চলে আসুন!`;
    case 'gu':
      return `શું તમે શોધી રહ્યા છો સૌથી બેસ્ટ અને પ્રીમિયમ ${prod}? તો સીધા આવી જાઓ ${name}${loc}! અહીં તમને મળશે લેટેસ્ટ કલેક્શન અને શાનદાર ક્વોલિટી. આજે જ મુલાકાત લો!`;
    case 'en':
    default:
      return `Looking for the absolute best quality and exceptional value in ${prod}? Look no further than ${name}${locEn}! We bring you top-tier quality, dedicated service, and unbeatable deals. Visit us today to experience the difference!`;
  }
}
