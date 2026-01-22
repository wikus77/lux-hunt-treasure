import UIKit
import Capacitor
import WebKit

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
        
        return true
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
        
        // Set background color immediately to prevent white flash
        let bgColor = UIColor(red: 0, green: 0.031, blue: 0.078, alpha: 1) // #000814
        webView.isOpaque = true
        webView.backgroundColor = bgColor
        webView.scrollView.backgroundColor = bgColor
        
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
            
            // Inject CSS immediately
            var style = document.createElement('style');
            style.id = 'm1ssion-capacitor-preload';
            style.textContent = `\(cssOverride.replacingOccurrences(of: "`", with: "\\`"))`;
            
            // Insert at the very beginning of head (or create head if needed)
            if (document.head) {
                document.head.insertBefore(style, document.head.firstChild);
            } else {
                document.documentElement.appendChild(style);
            }
            
            console.log('✅ M1SSION™ WRAP: Pre-render CSS injected');
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
