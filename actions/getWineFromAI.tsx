'use server';
import OpenAI from 'openai';

export async function getWineFromAI(image: string) {
  if (!image) {
    throw new Error('Image is required');
  }

  if (!process.env.XAI_API_KEY || !process.env.APIFY_API_KEY) {
    throw new Error(
      'XAI_API_KEY or APIFY_API_KEY environment variable is not set'
    );
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });

    // const data = JSON.parse((await analyzeImage(image, openai)) ?? '');

    // if (!data) {
    //   throw new Error('Failed to parse wine data from image analysis');
    // }
    // console.log({ data });
  } catch (error) {
    console.error('Error calling XAI API:', error);
    throw new Error('Failed to get response from XAI API');
  }
}

const analyzeImage = async (image: string, openai: OpenAI) => {
  const mimeType = detectImageType(image);

  const sizeInBytes = (image.length * 3) / 4 - (image.includes('=') ? 1 : 0);
  if (sizeInBytes > 1 * 1024 * 1024) {
    throw new Error('Image exceeds 1 MB');
  }

  const response = await openai.chat.completions.create({
    model: 'grok-4',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${image}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: `Analyze this wine and return a JSON object with the properties name and year, price (kr) and rating.
            Use rating and price exclusively from www.vivino.com/SE/en.
            Example: "Château Sérilhan Saint-Estèphe 2017" would return {"name": "Château Sérilhan Saint-Estèphe", "year": "2017", "price": "500", "rating": "4.5"}`,
          },
        ],
      },
    ],

    //@ts-expect-error XAI-specific search parameters
    search_parameters: {
      mode: 'on',
    },
    response_format: { type: 'json_object' },
  });

  return response.choices[0].message.content;
};

const detectImageType = (base64String: string) => {
  if (/^iVBOR/.test(base64String)) return 'image/png';
  if (/^\/9j\//.test(base64String)) return 'image/jpeg';
  console.warn('Unknown image type, defaulting to JPEG');
  return 'image/jpeg';
};
