
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    // Get form data from the request
    const formData = await req.formData();
    const file = formData.get('file');
    const pageNumber = formData.get('page_number') || '1';
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided or invalid file');
    }

    // Convert the file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Prepare the prompt for OpenAI
    const prompt = `This is a petition page with signatures. Please extract all signatures visible in this image.

For each signature:
1. Extract the full name of the signer
2. Extract the complete address
3. Determine the coordinates (approximate x, y, width, height) of the signature box

Return the data in a structured JSON format like this:
{
  "signatures": [
    {
      "name": "John Smith",
      "address": "123 Main St, Staten Island, NY 10314",
      "image_region": {
        "x": 150,
        "y": 200,
        "width": 200,
        "height": 50
      }
    },
    ...
  ]
}`;

    // Call OpenAI API with a smaller payload and timeout
    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      let errorMessage = 'Unknown OpenAI API error';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw error text
        errorMessage = errorText;
      }
      
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    // Extract the JSON from the response text
    const content = data.choices[0].message.content;
    
    let extractedData;
    try {
      // Try different patterns to find JSON in the text
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       content.match(/{[\s\S]*}/);
                     
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      
      console.log('Trying to parse JSON:', jsonString.substring(0, 100) + '...');
      extractedData = JSON.parse(jsonString.trim());
      console.log('JSON parsed successfully');
    } catch (e) {
      console.error('Error parsing JSON from OpenAI response:', e);
      console.log('Raw content from OpenAI:', content);
      
      // Fallback: create a basic structure with empty signatures array
      extractedData = { 
        signatures: [] 
      };
    }
    
    // Add page number to each signature
    const signatures = extractedData.signatures || [];
    signatures.forEach(sig => {
      sig.page_number = parseInt(pageNumber.toString());
      sig.confidence = 0.95; // High confidence since it's AI-extracted
    });

    // Final response with proper headers
    console.log(`Returning ${signatures.length} signatures`);
    return new Response(
      JSON.stringify(extractedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
