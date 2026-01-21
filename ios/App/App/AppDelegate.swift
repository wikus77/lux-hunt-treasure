import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var safeAreaFixApplied = false
    private var safeAreaFixTimer: Timer?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
        // WRAP FIX: Configure WebView to prevent double safe-area
        
        // Start polling for WebView (Capacitor creates it asynchronously)
        startSafeAreaFixPolling()
        
        return true
    }
    
    // MARK: - M1SSION™ Safe-Area Fix (WRAP-ONLY)
    
    /// Polls for WebView creation and applies fix when found
    private func startSafeAreaFixPolling() {
        safeAreaFixTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] timer in
            guard let self = self else { timer.invalidate(); return }
            
            if self.applySafeAreaFix() {
                timer.invalidate()
                self.safeAreaFixTimer = nil
                print("✅ M1SSION™ WRAP: Safe-area fix applied successfully")
            }
        }
        
        // Safety timeout after 5 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) { [weak self] in
            self?.safeAreaFixTimer?.invalidate()
            self?.safeAreaFixTimer = nil
        }
    }
    
    /// Applies safe-area fix to WebView. Returns true if successful.
    @discardableResult
    private func applySafeAreaFix() -> Bool {
        guard !safeAreaFixApplied else { return true }
        guard let rootVC = window?.rootViewController else { return false }
        
        // Configure ViewController for edge-to-edge content
        rootVC.edgesForExtendedLayout = .all
        rootVC.extendedLayoutIncludesOpaqueBars = true
        
        // Find and configure the Capacitor WebView
        if let webView = findWebView(in: rootVC.view) {
            // CRITICAL: Disable automatic content inset adjustment
            // This lets the CSS handle safe-area via env(safe-area-inset-top)
            webView.scrollView.contentInsetAdjustmentBehavior = .never
            
            // Reset any existing insets
            webView.scrollView.contentInset = .zero
            webView.scrollView.scrollIndicatorInsets = .zero
            
            // Ensure WebView fills entire screen
            webView.frame = rootVC.view.bounds
            webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            
            // Force opaque background to prevent flicker
            webView.isOpaque = true
            webView.backgroundColor = UIColor(red: 0, green: 0.03, blue: 0.08, alpha: 1) // M1SSION dark blue
            webView.scrollView.backgroundColor = webView.backgroundColor
            
            // M1SSION™ WRAP FIX: Inject CSS to mark Capacitor environment
            // This adds data-capacitor attribute to html element so CSS can detect native context
            injectCapacitorMarker(webView: webView)
            
            safeAreaFixApplied = true
            return true
        }
        
        return false
    }
    
    /// Injects a marker and CSS override into the DOM for Capacitor environment
    private func injectCapacitorMarker(webView: WKWebView) {
        let safeTop = Int(window?.safeAreaInsets.top ?? 47)
        
        // Add data attribute, CSS class, and CSS override for safe-area handling
        let js = """
        (function() {
            // Mark document as running in Capacitor iOS
            document.documentElement.setAttribute('data-capacitor', 'ios');
            document.documentElement.classList.add('capacitor-ios');
            
            // Set CSS variable with actual safe area value
            document.documentElement.style.setProperty('--capacitor-safe-area-top', '\(safeTop)px');
            document.documentElement.style.setProperty('--sat', '\(safeTop)px');
            
            // Inject CSS override for Capacitor iOS
            var styleId = 'm1ssion-capacitor-override';
            if (!document.getElementById(styleId)) {
                var style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    /* M1SSION™ Capacitor iOS Safe-Area Override */
                    .capacitor-ios .unified-header-wrapper {
                        padding-top: calc(env(safe-area-inset-top, \(safeTop)px) + 12px) !important;
                    }
                    
                    /* Ensure header has correct top padding in Capacitor */
                    .capacitor-ios [style*="position: fixed"][style*="top: 0"] {
                        padding-top: env(safe-area-inset-top, \(safeTop)px) !important;
                    }
                `;
                document.head.appendChild(style);
                console.log('✅ M1SSION™ WRAP: Capacitor iOS CSS override injected');
            }
            
            console.log('✅ M1SSION™ WRAP: Capacitor iOS marker injected, safe-area-top:', \(safeTop) + 'px');
        })();
        """
        
        webView.evaluateJavaScript(js) { _, error in
            if let error = error {
                print("⚠️ M1SSION™ WRAP: JS injection error: \\(error)")
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
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
        
        // M1SSION™: Re-apply safe-area fix in case Capacitor reset it
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.safeAreaFixApplied = false // Force re-apply
            self?.applySafeAreaFix()
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
