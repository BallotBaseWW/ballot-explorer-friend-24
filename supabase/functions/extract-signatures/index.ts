
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

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    // Check file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed (10MB)`);
    }

    // Convert the file to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
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
    }
  ]
}`;

    console.log('Calling OpenAI API...');
    
    // Safe conversion of Uint8Array to base64 to avoid stack issues
    let base64String = '';
    const CHUNK_SIZE = 1024; // Process in smaller chunks to avoid stack overflow
    
    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      const chunk = bytes.slice(i, Math.min(i + CHUNK_SIZE, bytes.length));
      base64String += String.fromCharCode.apply(null, chunk);
    }
    
    const safeBase64 = btoa(base64String);
    console.log(`Base64 encoding complete. Length: ${safeBase64.length}`);
    
    // Call OpenAI API
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
            role: "system",
            content: "You are an AI assistant specialized in extracting signature information from petition pages. Your task is to identify signatures, extract names and addresses, and provide their coordinates on the image. Always respond with properly formatted JSON."
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${safeBase64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" }
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
    let content = data.choices[0].message.content;
    console.log('Raw content from OpenAI:', content);
    
    let extractedData;
    try {
      // With response_format: { type: "json_object" }, the response should already be JSON
      if (typeof content === 'string') {
        extractedData = JSON.parse(content);
      } else {
        extractedData = content;
      }
      console.log('JSON parsed successfully');
    } catch (e) {
      console.error('Error parsing JSON from OpenAI response:', e);
      
      // Return a specific error to the client
      if (content.includes("unable to extract") || 
          content.includes("I'm unable") || 
          content.includes("cannot provide")) {
        // AI refused to process the document
        return new Response(
          JSON.stringify({ 
            error: "AI could not extract signatures from this document", 
            details: "The image might not contain clear signatures or the AI couldn't recognize them.",
            signatures: []
          }),
          { 
            status: 422, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
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
      JSON.stringify({ 
        error: error.message,
        signatures: [] 
      }),
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
