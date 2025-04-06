import { ClothingAnalysis } from './firebase';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function analyzeClothingImage(imageUrl: string): Promise<ClothingAnalysis> {
  try {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is missing. Please check your .env file.');
      throw new Error('OpenAI API key is not set. Please check your .env file.');
    }

    console.log('Starting image analysis with API key:', OPENAI_API_KEY.substring(0, 5) + '...');
    console.log('Image URL:', imageUrl);

    // Convert image to base64
    console.log('Converting image to base64...');
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('Failed to fetch image:', response.status, response.statusText);
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log('Image converted to base64 successfully');

    // Prepare the message for ChatGPT
    const messages = [
      {
        role: "system",
        content: "You are a fashion expert. Analyze the clothing in the image and describe the outerwear, top, bottom, and shoes. Be specific but concise. If an item is not present, leave it blank."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this outfit and describe the outerwear, top, bottom, and shoes. For each piece, specify the color and style. If an item is not present, leave it blank."
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

    console.log('Sending request to OpenAI API...');
    // Call ChatGPT API
    const apiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
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
    console.log('OpenAI API response:', data);

    const analysis = data.choices[0].message.content;
    console.log('Raw analysis:', analysis);

    // Parse the analysis into structured data
    const clothingAnalysis: ClothingAnalysis = {
      outerwear: extractClothingItem(analysis, 'outerwear'),
      top: extractClothingItem(analysis, 'top'),
      bottom: extractClothingItem(analysis, 'bottom'),
      shoes: extractClothingItem(analysis, 'shoes')
    };

    console.log('Parsed clothing analysis:', clothingAnalysis);
    return clothingAnalysis;
  } catch (error) {
    console.error('Error analyzing clothing image:', error);
    // Return empty analysis instead of throwing error
    return {
      outerwear: '',
      top: '',
      bottom: '',
      shoes: ''
    };
  }
}

function extractClothingItem(analysis: string, itemType: string): string {
  const regex = new RegExp(`${itemType}:\\s*([^\\n]+)`, 'i');
  const match = analysis.match(regex);
  return match ? match[1].trim() : '';
}