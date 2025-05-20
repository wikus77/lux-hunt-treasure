
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type GeocodingResponse = {
  lat?: string;
  lon?: string;
  display_name?: string;
  error?: string;
};

serve(async (req) => {
  // Enable CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  }
  
  try {
    const { address, city } = await req.json();
    
    if (!address || !city) {
      return new Response(
        JSON.stringify({ error: "Address and city are required" }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }

    const searchQuery = encodeURIComponent(`${address}, ${city}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1`;
    
    // Add a delay to respect Nominatim's usage policy
    // Add appropriate user-agent as per Nominatim usage policy
    const response = await fetch(url, {
      headers: {
        "User-Agent": "M1SSION Prize Manager (https://m1ssion.app/)",
      }
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Geocoding service error" }),
        { 
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: "No results found for this address" }),
        { 
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      );
    }
    
    const result = {
      lat: data[0].lat,
      lon: data[0].lon,
      display_name: data[0].display_name
    };
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
  }
});
