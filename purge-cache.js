const fetch = require('node-fetch');

const CF_API_TOKEN = "xmbY8lKzSlY5OeDAvHNJ9dohm54LuaW6OaGLfWSe";
const CF_ZONE_ID   = "4275e9417c87cb932acfbc10118556ac";

(async () => {
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ purge_everything: true })
    });
    const data = await res.json();
    console.log("✅ Cloudflare cache purged:", data);
  } catch (err) {
    console.error("❌ Error purging Cloudflare cache:", err);
  }
})();
