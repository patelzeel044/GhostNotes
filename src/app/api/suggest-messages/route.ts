import { streamText } from "ai"
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const randomFactor = Math.random().toString(36).substring(7);
    const prompt =
      `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment. Please generate unique questions each time.Here’s a random factor to ensure uniqueness: ${randomFactor}`;

    const result = await streamText({
      model: google("models/gemini-pro"),
      temperature: 1, 
      prompt,
    });

    return result.toDataStreamResponse();
  } catch (error:any) {
    Response.json(
      {
          success: false,
          message:
              error?.message ||
              "Error getting Suggestions from Gemini AI",
          error,
      },
      { status: 500 }
  );
}
  }
