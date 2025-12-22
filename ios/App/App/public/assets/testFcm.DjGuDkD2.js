import { s as supabase } from './index.BEQCqgv7.js';
import './three-vendor.B3e0mz6d.js';
import './react-vendor.CAU3V3le.js';
import './ui-vendor.CkkPodTS.js';
import './supabase-vendor.Be5pfGoK.js';
import './animation-vendor.BBMfCuXy.js';
import './map-vendor.DP0KRNIP.js';
import './stripe-vendor.DYHkqekj.js';
import './router-vendor.opNAzTki.js';

async function getFcmToken() {
  try {
    if (!("Notification" in window)) {
      throw new Error("Notifications not supported");
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        token: null,
        error: `Permission ${permission}`,
        success: false
      };
    }
    if ("serviceWorker" in navigator) {
      const existingReg = await navigator.serviceWorker.getRegistration("/");
      if (existingReg) {
      } else {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/"
        });
      }
      await navigator.serviceWorker.ready;
    }
    if (!window.firebase) {
      await Promise.all([
        loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"),
        loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js")
      ]);
      await loadScript("/firebase-init.js");
    }
    if (!window.firebase.apps.length && window.__FIREBASE_CFG__) {
      window.firebase.initializeApp(window.__FIREBASE_CFG__);
    }
    if (!window.firebase.messaging.isSupported()) {
      throw new Error("FCM not supported in this browser");
    }
    const messaging = window.firebase.messaging();
    const swRegistration = await navigator.serviceWorker.ready;
    const token = await messaging.getToken({
      vapidKey: window.__FIREBASE_CFG__?.vapidKey,
      serviceWorkerRegistration: swRegistration
    });
    if (!token) {
      throw new Error("No token received from FCM");
    }
    return {
      token,
      error: null,
      success: true
    };
  } catch (error) {
    if (error.code === "messaging/invalid-vapid-key" || error.name === "InvalidCharacterError") {
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
    const result = await getFcmToken();
    if (!result.success) {
      return { success: false, error: result.error };
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user && result.token) {
      const { error } = await supabase.from("push_tokens").upsert({
        user_id: user.id,
        token: result.token,
        ua: navigator.userAgent
      });
      if (error) {
      } else {
      }
    }
    const pushResult = await supabase.functions.invoke("send-push", {
      body: {
        token: result.token,
        title: "M1SSION™ Test",
        body: "FCM implementation working correctly!",
        data: { test: true }
      }
    });
    if (pushResult.error) {
      return { success: false, error: pushResult.error.message };
    }
    return {
      success: true,
      token: result.token,
      pushResponse: pushResult.data
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
if (typeof window !== "undefined") {
  window.testFcmFlow = testFcmFlow;
}

export { testFcmFlow };
