import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, GroundingMetadata, AppMode, Language, Attachment } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTIONS: Record<AppMode, string> = {
  nexus: "You are Lumière, a next-generation AI search engine. You are helpful, precise, and futuristic. Use Google Search to provide up-to-date, grounded answers.",
  
  coder: "You are VIBE_CODER, an elite programming assistant. You prefer Python and modern web frameworks. Your aesthetic is cyberpunk/terminal. 1. Always provide complete, working code. 2. Explain logic briefly but technically. 3. If the user asks for 'vibe coding', assume they want rapid, intuitive, and highly stylized code solutions.",
  
  scholar: "You are the Universal Tutor. Your goal is to educate. 1. Break down complex topics into step-by-step guides. 2. Use analogies. 3. At the end of an explanation, offer a 'Quiz' question to test the user's knowledge. 4. Be encouraging and patient.",
  
  studio: "You are a Creative Design Director. You help generate prompts for visuals, critique designs, and offer creative direction. You speak in terms of composition, color theory, and visual impact. If asked for visuals, describe them in vivid, photo-realistic detail suitable for an image generator.",
  
  human: "You are a friendly friend. Speak in super simple, short sentences. No big words. No jargon. Be very casual, like you're texting a friend. Lowercase is okay sometimes. Just keep it real and human.",

  analyst: "You are a Senior Data Analyst. You specialize in identifying patterns, extracting key insights, and formatting data into structured tables or lists. Be objective, concise, and data-driven. Prioritize clarity and factual accuracy.",

  coach: "You are Zenith, a hyper-intelligent Personal Growth Coach and Tuition Master. Your goal is to optimize the user's learning based on their mental state. \n\nPROTOCOL:\n1. IF AN IMAGE IS PROVIDED: Analyze the facial expression to detect 'Mood' (e.g., Stressed, Energetic, Distracted, Curious). \n2. Based on the mood, generate a 'Dynamic Lesson Plan'. \n   - If Tired/Stressed: Suggest a 15-minute 'Micro-Learning' session on a fun topic.\n   - If Energetic: Suggest a 45-minute 'Deep Dive' with a structured timetable.\n3. Act like a strict but supportive teacher. Create ASCII tables for schedules. \n4. Always ask: 'Are you ready to begin the session?'",

  lexicon: "You are the Omni-Lexicon. Your purpose is to define and explore words and concepts with absolute precision. \nStructure your response as follows:\n1. **Definition**: Clear and concise.\n2. **Etymology**: Origin and history of the word.\n3. **Synonyms & Antonyms**: List 3-5 of each.\n4. **Usage**: 3 examples of the word used in sophisticated sentences.\n5. **Nuance**: A brief note on connotation or context.",

  polyglot: "You are Polyglot, an immersive AI Language Coach. Your goal is to teach the user a new language similarly to apps like Duolingo. \n\nPROTOCOL:\n1. If the user selects a language, start a 'Level 1' lesson immediately. \n2. Lesson Structure: \n   - Introduce 3 new words.\n   - Show a simple sentence using them.\n   - Ask the user to translate a phrase.\n3. Gamify the experience: Give 'XP' or 'Stars' for correct answers.\n4. If the user speaks to you in a foreign language, correct their grammar gently and keep the conversation going.\n5. Be encouraging and fun.",

  motion: "You are the Veo Director. The user will provide a prompt, and you must generate a high-quality video using the Veo-3.1 model. If the user asks for help, explain that you can generate 16:9 videos from text descriptions. Be concise and confirm when the video is being rendered."
};

export const generateChatTitle = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a very brief (3-5 words max), futuristic, punchy title for a chat that starts with this message: "${content.substring(0, 200)}". Do not use quotes. Do not use "Title:". Just the words.`,
    });
    return response.text?.trim() || "New Session";
  } catch (error) {
    console.error("Error generating title:", error);
    return content.slice(0, 30) + (content.length > 30 ? '...' : '');
  }
};

export const streamGeminiResponse = async (
  history: Message[],
  mode: AppMode,
  onChunk: (text: string, metadata?: GroundingMetadata, generatedAttachment?: Attachment) => void,
  interfaceLanguage: Language = 'en'
) => {
  try {
    // Check for special media in the LAST user message (current request)
    const lastMsg = history[history.length - 1];
    const isVideoInput = lastMsg.attachment?.mimeType.startsWith('video/');
    const isAudioInput = lastMsg.attachment?.mimeType.startsWith('audio/');
    
    // MODEL SELECTION LOGIC
    let modelId = "gemini-2.5-flash"; // Default

    if (isVideoInput) {
        // Use Pro model for video understanding
        modelId = "gemini-3-pro-preview";
    } else if (mode === 'motion') {
        // Special case: Video Generation does not use streamGeminiResponse directly in the same way,
        // but we handle it here to keep the API surface clean.
        onChunk("Initializing Veo-3.1 Video Generation Engine...\n");
        await handleVideoGeneration(lastMsg.content, onChunk);
        return; 
    }

    // Construct the history
    const contents = history.map(msg => {
      const parts: any[] = [{ text: msg.content }];
      
      // If message has an attachment, add it to the parts
      if (msg.role === 'user' && msg.attachment && msg.attachment.base64) {
        parts.push({
          inlineData: {
            mimeType: msg.attachment.mimeType,
            data: msg.attachment.base64
          }
        });
      }
      
      return {
        role: msg.role,
        parts: parts
      };
    });

    const historyForChat = contents.slice(0, -1);
    const lastMsgObj = contents[contents.length - 1];
    const messagePart = lastMsgObj.parts; 

    // System Instructions
    let systemInstruction = SYSTEM_INSTRUCTIONS[mode];
    if (interfaceLanguage !== 'en') {
        systemInstruction += `\n\nIMPORTANT: The user's interface language is set to '${interfaceLanguage}'. Unless you are teaching a specific language (Polyglot mode), please respond in that language or adapt your persona to be accessible to a speaker of that language.`;
    }
    
    if (isAudioInput) {
        systemInstruction += "\n\nUser input is AUDIO. Transcribe it if necessary, but primarily RESPOND to the spoken content naturally. Capture the tone and emotion.";
    }
    if (isVideoInput) {
        systemInstruction += "\n\nUser input contains VIDEO. Analyze the visual content thoroughly. Describe key actions, objects, and events visible in the footage.";
    }

    const chat = ai.chats.create({
      model: modelId,
      history: historyForChat,
      config: {
        systemInstruction: systemInstruction,
        tools: mode === 'nexus' || mode === 'scholar' || mode === 'analyst' ? [{ googleSearch: {} }] : [],
      },
    });

    const resultStream = await chat.sendMessageStream({
      message: messagePart 
    });

    for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        
        const text = c.text || "";
        const groundingMetadata = c.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
        
        onChunk(text, groundingMetadata);
    }
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

const handleVideoGeneration = async (prompt: string, onChunk: (text: string, metadata?: any, attachment?: Attachment) => void) => {
    try {
        onChunk("Compiling visual prompts...\n");
        
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        onChunk("Rendering frames (this may take a moment)...\n");

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
            onChunk("."); // Keep alive dots
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (videoUri) {
            onChunk("\nFinalizing stream...\n");
            
            // Securely fetch the video content using the API key
            const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
            if (!response.ok) throw new Error("Failed to download generated video");
            
            const blob = await response.blob();
            const videoUrl = URL.createObjectURL(blob);

            onChunk("\nVideo Generation Complete.", undefined, {
                previewUrl: videoUrl,
                mimeType: "video/mp4",
                isGenerated: true
            });
        } else {
            onChunk("\nError: No video URI returned.");
        }

    } catch (e) {
        console.error("Video Gen Error", e);
        onChunk(`\nVideo Generation Failed: ${(e as Error).message}`);
    }
};