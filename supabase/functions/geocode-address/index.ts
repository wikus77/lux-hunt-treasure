import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type GeocodingResponse = {
  lat?: string;
  lon?: string;
  display_name?: string;
  error?: string;
  statusCode?: number;
  errorType?: 'rate_limit' | 'not_found' | 'service_error' | 'network_error' | 'format_error';
  debug?: any;
  suggestions?: string[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*", // Allow all headers to ensure frontend requests work
};

// Enable debug mode for detailed logging
const DEBUG_MODE = true;

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

    // Format variations of the address to try
    const addressFormats = [
      // Format 1: Original format
      `${address}, ${city}, Italy`,
      // Format 2: Try with lowercase "via"
      address.toLowerCase().startsWith("via") 
        ? `${address}, ${city}, Italy` 
        : null,
      // Format 3: Try with "Via" (proper case) and space after Via
      address.toUpperCase().startsWith("VIA") 
        ? `Via ${address.substring(3).trim()}, ${city}, Italy` 
        : null,
      // Format 4: Just with city
      `${address}, ${city}`,
      // Format 5: Try with formatted street name (for Via Montenapoleone case)
      address.toUpperCase().includes("MONTENAPOLEONE")
        ? `Via Monte Napoleone ${address.split(/\s+/).pop()}, ${city}, Italy`
        : null
    ].filter(Boolean); // Remove null entries

    console.log(`Attempting geocoding with ${addressFormats.length} format variations`);
    
    // For debugging
    const debugInfo = {
      originalInput: { address, city },
      formatsAttempted: addressFormats,
      responses: []
    };

    // Try each format until we get a result
    for (const formatAddress of addressFormats) {
      const searchQuery = encodeURIComponent(formatAddress);
      const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1&addressdetails=1&accept-language=it`;
      
      console.log(`Attempting geocoding for: "${formatAddress}"`);
      console.log(`Nominatim URL: ${url}`);
      
      // Add a small delay to respect Nominatim's usage policy
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
        
        // Add this attempt to debug info
        if (DEBUG_MODE) {
          debugInfo.responses.push({
            format: formatAddress,
            url: url,
            status: response.status,
            error: `HTTP error: ${response.status} ${response.statusText}`
          });
        }
        
        // If this is the last format, return error
        if (formatAddress === addressFormats[addressFormats.length - 1]) {
          return new Response(
            JSON.stringify({ 
              error: `Geocoding service error: ${response.status} ${response.statusText}`,
              statusCode: response.status,
              errorType: errorType,
              debug: DEBUG_MODE ? debugInfo : undefined,
              suggestions: [
                "Prova con 'Via Monte Napoleone' invece di 'VIA MONTENAPOLEONE'",
                "Verifica che l'indirizzo esista su OpenStreetMap",
                "Inserisci le coordinate manualmente"
              ]
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
        
        // Otherwise continue to next format
        continue;
      }
      
      const data = await response.json();
      
      // Add this attempt to debug info
      if (DEBUG_MODE) {
        debugInfo.responses.push({
          format: formatAddress,
          url: url,
          status: response.status,
          resultCount: data?.length || 0,
          firstResult: data?.[0] || null
        });
      }
      
      console.log(`Nominatim results: ${data.length} locations found`);
      console.log("First result:", data[0] || "No results");
      
      if (!data || data.length === 0) {
        // This format didn't work, continue to the next one
        continue;
      }
      
      // Success - we found a result
      const result = {
        lat: data[0].lat,
        lon: data[0].lon,
        display_name: data[0].display_name,
        query: {
          original: formatAddress,
          formatted: true
        },
        debug: DEBUG_MODE ? debugInfo : undefined
      };
      
      console.log(`Geocoding success with format "${formatAddress}": ${result.lat}, ${result.lon}`);
      
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
    }
    
    // If we've tried all formats and none worked, return not found error
    return new Response(
      JSON.stringify({ 
        error: "No results found for this address after trying multiple formats",
        errorType: "not_found",
        debug: DEBUG_MODE ? debugInfo : undefined,
        suggestions: [
          "Prova a scrivere l'indirizzo con gli spazi corretti (es. 'Via Monte Napoleone')",
          "Verifica che il numero civico sia corretto",
          "Prova a specificare solo la via senza numero",
          "Usa le coordinate manuali"
        ]
      }),
      { 
        status: 404,
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
        errorType: "network_error",
        debug: DEBUG_MODE ? {
          errorStack: error.stack,
          errorMessage: error.message
        } : undefined
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
