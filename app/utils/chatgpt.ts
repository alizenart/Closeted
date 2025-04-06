import { ClothingAnalysis } from './firebase';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function analyzeClothingImage(imageUrl: string): Promise<ClothingAnalysis> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set. Please check your .env file.');
    }

    console.log('Starting image analysis with API key:', OPENAI_API_KEY.substring(0, 5) + '...');

    // Convert image to base64
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    // Prepare the message for ChatGPT
    const messages = [
      {
        role: "system",
        content: "You are a fashion expert. Analyze the clothing in the image and describe the outerwear, top, bottom, and shoes. Be specific but concise."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this outfit and describe the outerwear, top, bottom, and shoes. For each piece, specify the color."
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ];

    // Call ChatGPT API
    const apiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: messages,
        max_tokens: 300
      })
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error('OpenAI API error details:', errorData);
      throw new Error(`OpenAI API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    const analysis = data.choices[0].message.content;

    // Parse the analysis into structured data
    const clothingAnalysis: ClothingAnalysis = {
      outerwear: extractClothingItem(analysis, 'outerwear'),
      top: extractClothingItem(analysis, 'top'),
      bottom: extractClothingItem(analysis, 'bottom'),
      shoes: extractClothingItem(analysis, 'shoes')
    };

    return clothingAnalysis;
  } catch (error) {
    console.error('Error analyzing clothing image:', error);
    throw error;
  }
}

function extractClothingItem(analysis: string, itemType: string): string {
  const regex = new RegExp(`${itemType}:\\s*([^\\n]+)`, 'i');
  const match = analysis.match(regex);
  return match ? match[1].trim() : '';
}