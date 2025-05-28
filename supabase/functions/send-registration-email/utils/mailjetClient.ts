
// Mailjet client initialization utility

import mailjet from "npm:node-mailjet@6.0.0";

export interface MailjetClientResult {
  client?: any;
  error?: string;
  statusCode?: number;
}

export const initializeMailjetClient = (): MailjetClientResult => {
  // Get Mailjet API keys from environment variables
  const MJ_APIKEY_PUBLIC = Deno.env.get("MJ_APIKEY_PUBLIC");
  const MJ_APIKEY_PRIVATE = Deno.env.get("MJ_APIKEY_PRIVATE");
  
  if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE) {
    console.error("Mailjet API keys not found in environment variables");
    return {
      error: "API keys Mailjet non configurate",
      statusCode: 500
    };
  }

  // Initialize Mailjet client with API keys from environment variables
  try {
    const mailjetClient = mailjet.apiConnect(
      MJ_APIKEY_PUBLIC,
      MJ_APIKEY_PRIVATE
    );
    console.log("Mailjet client initialized successfully");
    return { client: mailjetClient };
  } catch (mjInitError) {
    console.error("Error initializing Mailjet client:", mjInitError);
    return {
      error: "Errore nell'inizializzazione del client Mailjet",
      statusCode: 500
    };
  }
};
