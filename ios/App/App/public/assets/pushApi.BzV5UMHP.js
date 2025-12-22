import { s as supabase } from './index.BEQCqgv7.js';

const SAFE_HEADERS = {
  "Content-Type": "application/json",
  "X-M1-Dropper-Version": "v1",
  "X-Client-Info": "m1ssion-pwa"
};
async function invokePushFunction(fn, payload) {
  try {
    const { data, error } = await supabase.functions.invoke(fn, {
      body: payload,
      headers: SAFE_HEADERS
    });
    if (error) {
      throw new Error(error.message || `Error calling ${fn}`);
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export { invokePushFunction as i };
