
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type GeocodingResponse = {
  lat?: string;
  lon?: string;
  display_name?: string;
  error?: string;
  statusCode?: number;
  errorType?: 'rate_limit' | 'not_found' | 'service_error' | 'network_error';
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*", // Allow all headers to ensure frontend requests work
};

serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  
  try {
    const { address, city } = await req.json();
    
    if (!address || !city) {
      return new Response(
        JSON.stringify({ 
          error: "Address and city are required",
          errorType: "validation_error"
        }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Try with more specific formatting
    const formattedAddress = `${address}, ${city}, Italy`;
    const searchQuery = encodeURIComponent(formattedAddress);
    const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1&addressdetails=1&accept-language=it`;
    
    console.log(`Attempting geocoding for: "${formattedAddress}"`);
    console.log(`Nominatim URL: ${url}`);
    
    // Add a delay to respect Nominatim's usage policy
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add more detailed user agent
    const response = await fetch(url, {
      headers: {
        "User-Agent": "M1SSION Prize Manager (https://m1ssion.app/)",
        "Accept-Language": "it,en;q=0.8"
      }
    });
    
    console.log(`Nominatim response status: ${response.status}`);
    
    if (!response.ok) {
      let errorType = 'service_error';
      if (response.status === 429) {
        errorType = 'rate_limit';
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Geocoding service error: ${response.status} ${response.statusText}`,
          statusCode: response.status,
          errorType: errorType,
        }),
        { 
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    const data = await response.json();
    console.log(`Nominatim results: ${data.length} locations found`);
    console.log("First result:", data[0] || "No results");
    
    if (!data || data.length === 0) {
      // Try again with just address and city without country
      console.log("No results found with country, trying without country specification");
      const simpleQuery = encodeURIComponent(`${address}, ${city}`);
      const simpleUrl = `https://nominatim.openstreetmap.org/search?q=${simpleQuery}&format=json&limit=1`;
      
      // Add a delay to respect Nominatim's usage policy
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const simpleResponse = await fetch(simpleUrl, {
        headers: {
          "User-Agent": "M1SSION Prize Manager (https://m1ssion.app/)",
        }
      });
      
      if (!simpleResponse.ok) {
        return new Response(
          JSON.stringify({ 
            error: "No results found for this address after multiple attempts",
            errorType: "not_found"
          }),
          { 
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
      
      const simpleData = await simpleResponse.json();
      
      if (!simpleData || simpleData.length === 0) {
        // Still no results
        return new Response(
          JSON.stringify({ 
            error: "No results found for this address",
            errorType: "not_found"
          }),
          { 
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
      
      // Return the results from the simple query
      const simpleResult = {
        lat: simpleData[0].lat,
        lon: simpleData[0].lon,
        display_name: simpleData[0].display_name,
        query: {
          original: `${address}, ${city}`,
          simplified: true
        }
      };
      
      console.log(`Geocoding success with simplified query: ${simpleResult.lat}, ${simpleResult.lon}`);
      
      return new Response(
        JSON.stringify(simpleResult),
        { 
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    const result = {
      lat: data[0].lat,
      lon: data[0].lon,
      display_name: data[0].display_name,
      query: {
        original: formattedAddress,
        simplified: false
      }
    };
    
    console.log(`Geocoding success: ${result.lat}, ${result.lon}`);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
    
  } catch (error) {
    console.error(`Geocoding uncaught error: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        errorType: "network_error"
      }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json", 
          ...corsHeaders
        }
      }
    );
  }
});
