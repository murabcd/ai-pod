import { openai } from "@ai-sdk/openai";
import {
  experimental_generateSpeech as generateSpeech,
  generateText,
} from "ai";

function parseDialogue(dialogue: string) {
  const lines = dialogue.split("\n").filter((line) => line.trim());
  const segments: Array<{ speaker: string; text: string }> = [];

  const SpeakerPrefixLength = 5;
  for (const line of lines) {
    if (line.startsWith("ALEX:") || line.startsWith("SARAH:")) {
      const speaker = line.startsWith("ALEX:") ? "ALEX" : "SARAH";
      const text = line.substring(SpeakerPrefixLength).trim();
      if (text) {
        segments.push({ speaker, text });
      }
    }
  }

  return segments;
}

export async function POST(request: Request) {
  const { text, url, title } = await request.json();

  const { text: dialogue } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are creating a podcast dialogue between two hosts: Alex (curious, asks questions) and Sarah (knowledgeable, explains concepts). Given a webpage, create a natural 2-3 minute conversation that covers the main ideas. Make it engaging and conversational, like a real podcast. Use the language of the page. Return the dialogue in this exact format:\n\nALEX: [Alex's lines]\nSARAH: [Sarah's lines]\n\nKeep each speaker's turn concise (1-2 sentences max). Focus on the most valuable insights and practical takeaways.",
    prompt: JSON.stringify({ text, url, title }),
  });

  // Parse the dialogue into separate segments
  const segments = parseDialogue(dialogue);

  // Generate audio for each segment with different voices
  const audioSegments = await Promise.all(
    segments.map(async (segment, _index) => {
      const voice = segment.speaker === "ALEX" ? "alloy" : "shimmer";
      const { audio } = await generateSpeech({
        model: openai.speech("gpt-4o-mini-tts"),
        text: segment.text,
        voice,
      });
      return {
        speaker: segment.speaker,
        audio: Array.from(audio.uint8Array),
        mediaType: audio.mediaType || "audio/mpeg",
      };
    })
  );

  // Return the segments as JSON
  return new Response(JSON.stringify(audioSegments), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// DO NOT DELETE - NECESSARY FOR CORS
export function OPTIONS(_: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
