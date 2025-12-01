import { s as supabase } from './index.B1pZJRDR.js';
import './three-vendor.wwSanNQ8.js';
import './react-vendor.CAU3V3le.js';
import './ui-vendor.DoN6OTIp.js';
import './supabase-vendor.CghLtY7N.js';
import './animation-vendor.Bezovbgp.js';
import './map-vendor.Dz2XYzxS.js';
import './stripe-vendor.BaJG9Xy1.js';
import './router-vendor.opNAzTki.js';

async function getFcmToken() {
  try {
    console.log("[M1SSION FCM] Starting token generation...");
    if (!("Notification" in window)) {
      throw new Error("Notifications not supported");
    }
    console.log("[M1SSION FCM] Requesting notification permission...");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[M1SSION FCM] Permission denied:", permission);
      return {
        token: null,
        error: `Permission ${permission}`,
        success: false
      };
    }
    console.log("[M1SSION FCM] Permission granted");
    if ("serviceWorker" in navigator) {
      console.log("[M1SSION FCM] Registering service worker...");
      const existingReg = await navigator.serviceWorker.getRegistration("/");
      if (existingReg) {
        console.log("[M1SSION FCM] Using existing SW registration");
      } else {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/"
        });
        console.log("[M1SSION FCM] SW registered successfully");
      }
      await navigator.serviceWorker.ready;
    }
    if (!window.firebase) {
      console.log("[M1SSION FCM] Loading Firebase compat...");
      await Promise.all([
        loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"),
        loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js")
      ]);
      await loadScript("/firebase-init.js");
      console.log("[M1SSION FCM] Firebase compat loaded");
    }
    if (!window.firebase.apps.length && window.__FIREBASE_CFG__) {
      window.firebase.initializeApp(window.__FIREBASE_CFG__);
      console.log("[M1SSION FCM] Firebase app initialized");
    }
    if (!window.firebase.messaging.isSupported()) {
      throw new Error("FCM not supported in this browser");
    }
    const messaging = window.firebase.messaging();
    const swRegistration = await navigator.serviceWorker.ready;
    console.log("[M1SSION FCM] Requesting FCM token...");
    const token = await messaging.getToken({
      vapidKey: window.__FIREBASE_CFG__?.vapidKey,
      serviceWorkerRegistration: swRegistration
    });
    if (!token) {
      throw new Error("No token received from FCM");
    }
    console.log("[M1SSION FCM] Token generated successfully:", token.substring(0, 20) + "...");
    return {
      token,
      error: null,
      success: true
    };
  } catch (error) {
    console.error("[M1SSION FCM] Token generation failed:", error);
    if (error.code === "messaging/invalid-vapid-key" || error.name === "InvalidCharacterError") {
      console.error("[M1SSION FCM] VAPID key is not valid base64url format");
      return {
        token: null,
        error: "Invalid VAPID key format (not base64url)",
        success: false
      };
    }
    return {
      token: null,
      error: error.message || "Unknown error",
      success: false
    };
  }
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function testFcmFlow() {
  try {
    console.log("🔔 M1SSION™ FCM Test Started");
    console.log("1. Generating FCM token...");
    const result = await getFcmToken();
    if (!result.success) {
      console.error("❌ Token generation failed:", result.error);
      return { success: false, error: result.error };
    }
    console.log("✅ Token generated:", result.token?.substring(0, 30) + "...");
    const { data: { user } } = await supabase.auth.getUser();
    if (user && result.token) {
      console.log("2. Saving token to database...");
      const { error } = await supabase.from("push_tokens").upsert({
        user_id: user.id,
        token: result.token,
        ua: navigator.userAgent
      });
      if (error) {
        console.error("❌ Database save failed:", error);
      } else {
        console.log("✅ Token saved to database");
      }
    }
    console.log("3. Testing push notification...");
    const pushResult = await supabase.functions.invoke("send-push", {
      body: {
        token: result.token,
        title: "M1SSION™ Test",
        body: "FCM implementation working correctly!",
        data: { test: true }
      }
    });
    if (pushResult.error) {
      console.error("❌ Push test failed:", pushResult.error);
      return { success: false, error: pushResult.error.message };
    }
    console.log("✅ Push notification sent successfully");
    console.log("🎉 M1SSION™ FCM Test Completed Successfully");
    return {
      success: true,
      token: result.token,
      pushResponse: pushResult.data
    };
  } catch (error) {
    console.error("❌ FCM Test failed:", error);
    return { success: false, error: error.message };
  }
}
if (typeof window !== "undefined") {
  window.testFcmFlow = testFcmFlow;
  console.log("🔧 FCM Test available as: window.testFcmFlow()");
}

export { testFcmFlow };
