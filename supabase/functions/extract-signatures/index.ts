
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
    const district = formData.get('district') || '';
    const petitionType = formData.get('petition_type') || '';
    const party = formData.get('party') || '';
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file provided or invalid file');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    console.log(`Petition context: district=${district}, type=${petitionType}, party=${party}`);

    // Check file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed (10MB)`);
    }

    // Convert the file to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Prepare the prompt for OpenAI with more detailed instructions, including district information
    let districtContext = "";
    if (district) {
      districtContext = `This petition is for ${district} district. `;
      
      if (district.startsWith("AD-")) {
        districtContext += `It's for Assembly District ${district.replace("AD-", "")}. `;
      } else if (district.startsWith("CD-")) {
        districtContext += `It's for Congressional District ${district.replace("CD-", "")}. `;
      } else if (district.startsWith("SD-")) {
        districtContext += `It's for Senate District ${district.replace("SD-", "")}. `;
      } else if (district.startsWith("CC-")) {
        districtContext += `It's for City Council District ${district.replace("CC-", "")}. `;
      } else if (district === "CITYWIDE") {
        districtContext += `It's a citywide petition covering all five boroughs. `;
      }
    }
    
    let petitionContext = "";
    if (petitionType) {
      if (petitionType === "designating") {
        petitionContext = `This is a designating petition`;
      } else if (petitionType === "opportunity") {
        petitionContext = `This is an opportunity to ballot petition`;
      } else if (petitionType === "independent") {
        petitionContext = `This is an independent nominating petition`;
      }
      
      if (party && (petitionType === "designating" || petitionType === "opportunity")) {
        let partyName = "";
        switch (party) {
          case "DEM": partyName = "Democratic"; break;
          case "REP": partyName = "Republican"; break;
          case "CON": partyName = "Conservative"; break;
          case "WOR": partyName = "Working Families"; break;
          case "IND": partyName = "Independence"; break;
          default: partyName = party;
        }
        
        petitionContext += ` for the ${partyName} party`;
      }
      
      petitionContext += ". ";
    }
    
    const prompt = `${petitionContext}${districtContext}This is a petition page with signatures. Please extract all signatures visible in this document with high accuracy.

For each signature you find:
1. Extract the FULL NAME of the signer exactly as written
2. Extract the COMPLETE ADDRESS including apartment numbers, street, city, state, and ZIP
3. Determine the coordinates (x, y, width, height) of the signature box

Important guidelines:
- If a signature or address is partially illegible, extract as much as you can clearly read
- Make sure names include first and last names when visible
- Include apartment/unit numbers in addresses when present
- If address includes borough information (Staten Island, Brooklyn, etc.), be sure to include it
- If you see a street address with a number, always include the house/building number
- For ZIP codes, include all 5 digits when visible
- Pay close attention to the borough/county information in addresses
- Be thorough and extract every signature on the page, even if partially visible
- Focus on extracting exactly what's written, not interpreting or correcting it

Return the data in the following JSON format:
{
  "signatures": [
    {
      "name": "Full Name",
      "address": "Complete Address with Street, City, State, ZIP",
      "image_region": {
        "x": [x-coordinate],
        "y": [y-coordinate],
        "width": [width],
        "height": [height]
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
    
    // Call OpenAI API with enhanced system prompt
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
            content: "You are an AI assistant specialized in extracting signature information from petition pages with extreme accuracy and thoroughness. Your expertise includes understanding the political context and requirements for different types of petitions (designating, opportunity to ballot, independent nominating) across various districts in New York. You carefully identify signatures, extract complete names and addresses with proper borough information, and provide precise coordinates on the image. In New York City, pay special attention to the five boroughs (Manhattan, Brooklyn, Queens, Bronx, Staten Island) and their neighborhoods. Always perform multiple verification passes to ensure accuracy. Always respond with properly formatted JSON matching the requested structure exactly."
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
        temperature: 0.2, // Lower temperature for more consistent, accurate results
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
    
    // Add page number and confidence scores to each signature
    const signatures = extractedData.signatures || [];
    signatures.forEach(sig => {
      sig.page_number = parseInt(pageNumber.toString());
      // Default high confidence, but we can adjust this later based on AI uncertainty language
      sig.confidence = content.toLowerCase().includes(`uncertain`) || 
                       content.toLowerCase().includes(`unclear`) || 
                       content.toLowerCase().includes(`difficult to read`) ? 
                       0.7 : 0.95;
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
