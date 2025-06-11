
export const loadGA4 = () => {
  // Check if GA4 is already loaded to prevent duplicate loading
  if (window.gtag) {
    console.log("GA4 already loaded");
    return;
  }

  const GA4_ID = "G-XXXXXXXXXX"; // Replace with actual M1SSION GA4 ID

  // Load the gtag script
  const script1 = document.createElement("script");
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  script1.async = true;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA4_ID}');
  `;
  document.head.appendChild(script2);

  console.log("GA4 loaded with consent");
};

// Function to remove GA4 if needed
export const removeGA4 = () => {
  // Remove GA4 scripts from head
  const scripts = document.head.querySelectorAll('script[src*="googletagmanager.com"]');
  scripts.forEach(script => script.remove());
  
  // Clear dataLayer
  if (window.dataLayer) {
    window.dataLayer = [];
  }
  
  // Remove gtag function
  if (window.gtag) {
    delete window.gtag;
  }
};
