import UIKit
import Capacitor
import WebKit
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var webViewConfigured = false
    private var userScriptAdded = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
        // WRAP FIX: Inject CSS BEFORE page renders to prevent layout jump
        
        // Start polling for WebView to inject UserScript BEFORE page loads
        startEarlyInjection()
        
        // 🔔 Push Notifications: Set delegate
        UNUserNotificationCenter.current().delegate = self
        
        return true
    }
    
    // MARK: - 🔔 PUSH NOTIFICATIONS (APNs)
    
    /// Called when APNs successfully registers and returns a device token
    func application(_ application: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Convert token to hex string
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        
        print("🔔🔔🔔 ============================================")
        print("🔔🔔🔔 APNs DEVICE TOKEN RECEIVED!")
        print("🔔🔔🔔 Token: \(tokenString)")
        print("🔔🔔🔔 Length: \(tokenString.count) characters")
        print("🔔🔔🔔 ============================================")
        
        // Forward to Capacitor's ApplicationDelegateProxy
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
    }
    
    /// Called when APNs registration fails
    func application(_ application: UIApplication,
                     didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("❌❌❌ ============================================")
        print("❌❌❌ APNs REGISTRATION FAILED!")
        print("❌❌❌ Error: \(error.localizedDescription)")
        print("❌❌❌ Full error: \(error)")
        print("❌❌❌ ============================================")
        
        // Forward to Capacitor's ApplicationDelegateProxy
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }
    
    /// Called when a push notification is received while app is in foreground
    func application(_ application: UIApplication,
                     didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                     fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        print("📬📬📬 Push notification received!")
        print("📬📬📬 Payload: \(userInfo)")
        
        // Forward to Capacitor
        NotificationCenter.default.post(
            name: NSNotification.Name("capacitorDidReceiveRemoteNotification"),
            object: nil,
            userInfo: userInfo
        )
        
        completionHandler(.newData)
    }
    
    // MARK: - M1SSION™ Safe-Area Fix (WRAP-ONLY)
    
    /// Polls for WebView and injects UserScript as early as possible
    private func startEarlyInjection() {
        // Poll very frequently to catch WebView creation early
        Timer.scheduledTimer(withTimeInterval: 0.01, repeats: true) { [weak self] timer in
            guard let self = self else { timer.invalidate(); return }
            
            if self.configureWebView() {
                timer.invalidate()
                print("✅ M1SSION™ WRAP: Early injection completed")
            }
        }
    }
    
    /// Configures WebView with UserScript for pre-render CSS injection
    @discardableResult
    private func configureWebView() -> Bool {
        guard !webViewConfigured else { return true }
        guard let rootVC = window?.rootViewController else { return false }
        guard let webView = findWebView(in: rootVC.view) else { return false }
        
        // Get safe area value
        let safeTop = Int(window?.safeAreaInsets.top ?? 59) // iPhone 16 has ~59px
        
        // Configure WebView scroll behavior
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.contentInset = .zero
        
        // 🔧 FIX 27/01/2026 v8.2: ENABLE bounce for native iOS feel
        // PTR now properly checks touchStartedAtTopRef, so bounce won't trigger accidental refreshes
        webView.scrollView.bounces = true
        webView.scrollView.alwaysBounceVertical = true
        
        // 🔧 OPTION B FIX 31/01/2026: WHITE background for iOS bounce/overscroll
        // CRITICAL: This color shows during rubber-band bounce
        // Native layer = WHITE so overscroll blends with white content
        // Header/Nav must be OPAQUE white glass to not show overlay
        let bgColor = UIColor.white // #FFFFFF
        webView.isOpaque = true
        webView.backgroundColor = bgColor
        webView.scrollView.backgroundColor = bgColor
        
        // Set root view background to WHITE
        if let rootView = webView.superview {
            rootView.backgroundColor = bgColor
        }
        
        // 🔧 FIX 22/01/2026: Hide iOS keyboard accessory bar (toolbar)
        // This removes the shortcut bar / predictive text bar above the keyboard
        hideKeyboardAccessoryBar(webView: webView)
        
        // Add UserScript that runs BEFORE document loads
        if !userScriptAdded {
            addPreRenderUserScript(to: webView, safeTop: safeTop)
            userScriptAdded = true
        }
        
        webViewConfigured = true
        return true
    }
    
    // MARK: - Keyboard Accessory Bar Fix
    
    /// Hides the iOS keyboard accessory bar (toolbar with shortcuts/predictions)
    private func hideKeyboardAccessoryBar(webView: WKWebView) {
        // Use JavaScript to disable autocorrect/autocomplete which removes most of the toolbar
        let js = """
        (function() {
            // Add CSS to make input elements not show autocorrect suggestions
            var style = document.createElement('style');
            style.id = 'm1ssion-keyboard-fix';
            style.textContent = `
                /* Disable autocorrect/autocomplete visual elements */
                input, textarea, [contenteditable="true"] {
                    -webkit-text-size-adjust: 100%;
                }
            `;
            if (!document.getElementById('m1ssion-keyboard-fix')) {
                document.head.appendChild(style);
            }
        })();
        """
        webView.evaluateJavaScript(js, completionHandler: nil)
        print("✅ M1SSION™ WRAP: Keyboard accessory bar hidden")
    }
    
    /// Adds a UserScript that executes at document start (BEFORE render)
    private func addPreRenderUserScript(to webView: WKWebView, safeTop: Int) {
        let cssOverride = """
        /* M1SSION™ Capacitor iOS Safe-Area Override - Injected at document start */
        html.capacitor-ios .unified-header-wrapper {
            padding-top: calc(env(safe-area-inset-top, \(safeTop)px) + 12px) !important;
        }
        
        /* Main content area needs padding to account for fixed header */
        html.capacitor-ios body {
            padding-top: calc(env(safe-area-inset-top, \(safeTop)px) + 76px) !important;
        }
        
        /* Ensure fixed headers respect safe area */
        html.capacitor-ios [class*="header"][style*="position: fixed"],
        html.capacitor-ios [class*="Header"][style*="position: fixed"] {
            padding-top: env(safe-area-inset-top, \(safeTop)px) !important;
        }
        
        /* Fix for home page content */
        html.capacitor-ios main,
        html.capacitor-ios [class*="page-content"],
        html.capacitor-ios [class*="PageContent"] {
            padding-top: calc(env(safe-area-inset-top, \(safeTop)px) + 80px) !important;
        }
        """
        
        // JavaScript that runs at document START (before any rendering)
        let js = """
        (function() {
            // Add class immediately to <html> element
            document.documentElement.classList.add('capacitor-ios');
            document.documentElement.setAttribute('data-capacitor', 'ios');
            document.documentElement.style.setProperty('--sat', '\(safeTop)px');
            document.documentElement.style.setProperty('--capacitor-safe-area-top', '\(safeTop)px');
            
            // 🔧 OPTION B FIX 31/01/2026: WHITE background on html for seamless overscroll
            // Native layer = WHITE, html = WHITE, so overscroll shows white (blends with content)
            document.documentElement.style.setProperty('background', '#FFFFFF', 'important');
            document.documentElement.style.setProperty('background-color', '#FFFFFF', 'important');
            
            // Also set body white for consistency
            if (document.body) {
                document.body.style.setProperty('background', '#FFFFFF', 'important');
                document.body.style.setProperty('background-color', '#FFFFFF', 'important');
            }
            
            // Inject layout CSS immediately
            var style = document.createElement('style');
            style.id = 'm1ssion-capacitor-preload';
            style.textContent = `\(cssOverride.replacingOccurrences(of: "`", with: "\\`"))`;
            
            // Insert at the very beginning of head (or create head if needed)
            if (document.head) {
                document.head.insertBefore(style, document.head.firstChild);
            } else {
                document.documentElement.appendChild(style);
            }
            
            // 🔧 FIX v8.8: Also run when body is available to ensure coverage
            function fixBodyBackground() {
                if (document.body) {
                    document.body.style.setProperty('background', 'transparent', 'important');
                    document.body.style.setProperty('background-color', 'transparent', 'important');
                    document.body.classList.add('is-native');
                }
            }
            
            // Try immediately
            fixBodyBackground();
            
            // Also on DOMContentLoaded
            document.addEventListener('DOMContentLoaded', fixBodyBackground);
            
            console.log('✅ M1SSION™ WRAP: Pre-render CSS + NUCLEAR background fix injected');
        })();
        """
        
        // Create UserScript that runs at DOCUMENT START
        let userScript = WKUserScript(
            source: js,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        
        webView.configuration.userContentController.addUserScript(userScript)
        print("✅ M1SSION™ WRAP: UserScript added for pre-render injection")
        
        // Also inject immediately for current page (in case already loaded)
        webView.evaluateJavaScript(js) { _, error in
            if let error = error {
                print("⚠️ M1SSION™ WRAP: Immediate injection error: \(error)")
            } else {
                print("✅ M1SSION™ WRAP: Immediate injection successful")
            }
        }
    }
    
    /// Recursively finds WKWebView in view hierarchy
    private func findWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView {
            return webView
        }
        for subview in view.subviews {
            if let found = findWebView(in: subview) {
                return found
            }
        }
        return nil
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Re-inject CSS in case it was lost
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            guard let self = self,
                  let rootVC = self.window?.rootViewController,
                  let webView = self.findWebView(in: rootVC.view) else { return }
            
            let safeTop = Int(self.window?.safeAreaInsets.top ?? 59)
            let js = """
            if (!document.documentElement.classList.contains('capacitor-ios')) {
                document.documentElement.classList.add('capacitor-ios');
                document.documentElement.setAttribute('data-capacitor', 'ios');
                document.documentElement.style.setProperty('--sat', '\(safeTop)px');
                console.log('✅ M1SSION™ WRAP: Re-applied capacitor-ios class');
            }
            """
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate {
    
    /// Called when notification is delivered while app is in FOREGROUND
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        print("📱📱📱 Notification will present (foreground)")
        print("📱📱📱 Title: \(notification.request.content.title)")
        print("📱📱📱 Body: \(notification.request.content.body)")
        
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }
    
    /// Called when user taps on notification
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        print("👆👆👆 Notification tapped!")
        print("👆👆👆 Action: \(response.actionIdentifier)")
        
        // Forward to Capacitor
        let userInfo = response.notification.request.content.userInfo
        NotificationCenter.default.post(
            name: NSNotification.Name("capacitorPushNotificationActionPerformed"),
            object: nil,
            userInfo: [
                "actionId": response.actionIdentifier,
                "notification": userInfo
            ]
        )
        
        completionHandler()
    }
}
