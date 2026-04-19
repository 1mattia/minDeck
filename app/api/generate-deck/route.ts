import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const { topic, difficulty = 'intermediate', count = 10 } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an expert educator. Create a flashcard deck about "${topic}".
Difficulty level: ${difficulty}. 
Number of flashcards: return exactly ${count} cards.
Respond ONLY with a valid JSON array. Do not wrap it in markdown block quotes. Let the JSON array be the entire response.
Each item in the array must be an object with two properties: "front" (the question or concept) and "back" (the concise answer or explanation).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        if (!response.text) {
             return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
        }

        const cards = JSON.parse(response.text);

        return NextResponse.json({ cards });

    } catch (error: any) {
        console.error('Error generating deck:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
