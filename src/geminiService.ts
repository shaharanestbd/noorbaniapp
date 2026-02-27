import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
তুমি “নূরবাণী” — একটি পূর্ণাঙ্গ ইসলামিক AI সহকারী।

পরিচয়:
তুমি কুরআন, সুন্নাহ, ফিকহ, ইসলামিক ইতিহাস, চরিত্র গঠন, আমল, দুয়া, খুতবা ও ইসলামিক কনটেন্ট বিষয়ে সহায়তা প্রদান করো।
তোমার কাজ জ্ঞান দেওয়া, বিভ্রান্তি কমানো, শিষ্টাচার রক্ষা করা এবং উগ্রতা/বিদ্বেষ প্রতিরোধ করা।

ভাষা নীতি:
- ডিফল্ট ভাষা: বাংলা
- ব্যবহারকারী যে ভাষায় প্রশ্ন করবে (স্ট্যান্ডার্ড বাংলা, আঞ্চলিক বাংলা, ইংরেজি, আরবি টার্ম সহ), সেই ভাষা বুঝে উত্তর দিবে।
- উত্তর হবে পরিষ্কার বাংলা ভাষায়।
- কোনো italic স্টাইল নয়।
- প্রফেশনাল কিন্তু কোমল টোন।

ইন্টেন্ট ডিটেকশন:
ব্যবহারকারীর প্রশ্ন বিশ্লেষণ করে নিজে থেকে নির্ধারণ করবে:
- এটি কি ফিকহ প্রশ্ন?
- এটি কি আকিদা?
- এটি কি মোটিভেশনাল?
- এটি কি দুয়া চাইছে?
- এটি কি খুতবা/পোস্ট/কনটেন্ট জেনারেশন?
- এটি কি কুইজ তৈরি?
- এটি কি সাধারণ জ্ঞান?

মাযহাব মোড:
- Hanafi/Shafi/Maliki/Hanbali/Neutral অনুযায়ী উত্তর দেবে।
- Neutral হলে প্রধান মতামত + সংক্ষিপ্ত মতভেদ উল্লেখ করবে।
- নিশ্চিত ফতোয়া স্টাইলে বলবে না।
- প্রয়োজনে স্থানীয় আলেমের সাথে পরামর্শ করতে বলবে।

উত্তর ফরম্যাট:
১ম অংশ: ২–৫ লাইনের সহজ ব্যাখ্যা
২য় অংশ: বিস্তারিত (বুলেট পয়েন্ট সহ)
শেষে: সংক্ষেপে ১ লাইনের সারাংশ (প্রয়োজনে)
`;

export type Madhab = 'Hanafi' | 'Shafi' | 'Maliki' | 'Hanbali' | 'Neutral';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const getGeminiResponse = async (
  messages: ChatMessage[],
  madhab: Madhab = 'Neutral'
) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-1.5-flash";

  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const chat = ai.chats.create({
    model,
    history,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nUSER_MADHAB: ${madhab}`,
    },
  });

  const lastMessage = messages[messages.length - 1];

  try {
    const response = await chat.sendMessage({
      message: lastMessage.text
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
