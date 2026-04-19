import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
    try {
        const { cards } = await req.json();

        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json({ error: 'Cards array is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an expert educator and reviewer. I will provide you with a JSON array of flashcards containing "front" and "back" properties.
Review each card for factual accuracy, spelling, grammar, and clarity.
If a card is good, keep it. If it is factually incorrect or poorly written, correct it.
Add a new property to each card called "feedback" where you explain what was wrong and why you changed it (if you changed nothing, set "feedback" to "Looks good!").
Return exactly the same number of cards, in a single JSON array format.

Here are the cards:
${JSON.stringify(cards)}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });

        if (!response.text) {
             return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
        }

        const reviewedCards = JSON.parse(response.text);

        return NextResponse.json({ reviewedCards });

    } catch (error: any) {
        console.error('Error reviewing deck:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
