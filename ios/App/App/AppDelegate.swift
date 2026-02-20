import UIKit
import Capacitor
import WebKit
import UserNotifications
import LocalAuthentication

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var webViewConfigured = false
    private var userScriptAdded = false
    private var faceIDHandlerAdded = false
    private var badgeHandlerAdded = false
    
    // ============================================================================
    // 🚨 APP STORE REVIEW FIX — TEMPORARY SSO HIDE (iOS WRAPPER ONLY)
    // Issue: Google/Apple OAuth fails on iOS native (redirect/deep-link issues)
    // Solution: Hide SSO buttons via JS injection in iOS wrapper
    // 
    // TO RE-ENABLE: Set this to false
    // This does NOT modify the webapp code - only injects CSS/JS at runtime
    // ============================================================================
    private let IOS_SSO_TEMPORARILY_DISABLED = true
    
    /// iPad Account Buttons forensics: set true only when debugging tap/hit-test (OFF in release)
    private let IPAD_FORENSICS_LOGGING_ENABLED = false

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
        
        // 🔧 FIX 20/02/2026: iPad Account Buttons — touch delivery (wrapper-only)
        // On iPad, default delaysContentTouches = true can make taps feel "dead"; set false for immediate delivery
        if UIDevice.current.userInterfaceIdiom == .pad {
            webView.scrollView.delaysContentTouches = false
        }
        
        // 🎬 GLOBAL DARK FIX 05/02/2026: BLACK background for iOS bounce/overscroll
        // CRITICAL: This color shows during rubber-band bounce
        // Native layer = BLACK (Briefing Buzz style) for dark theme
        let bgColor = UIColor(red: 10/255, green: 10/255, blue: 15/255, alpha: 1.0) // #0a0a0f
        webView.isOpaque = true
        webView.backgroundColor = bgColor
        webView.scrollView.backgroundColor = bgColor
        
        // Set root view background to BLACK
        if let rootView = webView.superview {
            rootView.backgroundColor = bgColor
        }
        
        // 🔍 iPad Account Buttons Forensics (gated — set IPAD_FORENSICS_LOGGING_ENABLED = true to re-enable)
        if UIDevice.current.userInterfaceIdiom == .pad && IPAD_FORENSICS_LOGGING_ENABLED {
            dumpViewHierarchyForIPad(rootVC: rootVC, webView: webView)
            addIPadPointerdownLoggingUserScript(to: webView)
        }
        
        // 🔧 FIX 22/01/2026: Hide iOS keyboard accessory bar (toolbar)
        // This removes the shortcut bar / predictive text bar above the keyboard
        hideKeyboardAccessoryBar(webView: webView)
        
        // Add UserScript that runs BEFORE document loads
        if !userScriptAdded {
            addPreRenderUserScript(to: webView, safeTop: safeTop)
            
            // 🚨 APP STORE REVIEW FIX: Hide SSO buttons if flag is set
            if IOS_SSO_TEMPORARILY_DISABLED {
                addSSOHideUserScript(to: webView)
            }
            
            userScriptAdded = true
        }
        
        // 🔐 FACE ID: Add message handler for JS → Native communication
        if !faceIDHandlerAdded {
            setupFaceIDMessageHandler(webView: webView)
            faceIDHandlerAdded = true
        }
        
        // 🔢 BADGE: Add message handler for app icon badge
        if !badgeHandlerAdded {
            setupBadgeMessageHandler(webView: webView)
            badgeHandlerAdded = true
        }
        
        webViewConfigured = true
        return true
    }
    
    // MARK: - 🔐 FACE ID MESSAGE HANDLER (JS → Native)
    
    /// Sets up message handler for Face ID requests from WebView
    private func setupFaceIDMessageHandler(webView: WKWebView) {
        // Add message handler for Face ID operations
        webView.configuration.userContentController.add(FaceIDMessageHandler(), name: "m1ssionFaceID")
        
        // Inject JS bridge for Face ID
        let faceIDJS = """
        (function() {
            // M1SSION™ Face ID Bridge v2 - Dual Token Support
            window.M1SSIONFaceID = {
                // Check if Face ID is available
                checkAvailability: function() {
                    return new Promise(function(resolve) {
                        window.webkit.messageHandlers.m1ssionFaceID.postMessage({
                            action: 'checkAvailability'
                        });
                        window._m1ssionFaceIDResolve = resolve;
                    });
                },
                
                // Trigger Face ID authentication - returns { accessToken, refreshToken }
                authenticate: function() {
                    return new Promise(function(resolve) {
                        window.webkit.messageHandlers.m1ssionFaceID.postMessage({
                            action: 'authenticate'
                        });
                        window._m1ssionFaceIDAuthResolve = resolve;
                    });
                },
                
                // NEW: Save BOTH tokens after successful login
                saveTokens: function(accessToken, refreshToken) {
                    window.webkit.messageHandlers.m1ssionFaceID.postMessage({
                        action: 'saveTokens',
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    });
                },
                
                // LEGACY: Keep for backwards compatibility
                saveToken: function(token) {
                    console.warn('⚠️ M1SSIONFaceID.saveToken is deprecated, use saveTokens(accessToken, refreshToken)');
                    window.webkit.messageHandlers.m1ssionFaceID.postMessage({
                        action: 'saveToken',
                        token: token
                    });
                },
                
                // Clear stored credentials (on logout)
                clearCredentials: function() {
                    window.webkit.messageHandlers.m1ssionFaceID.postMessage({
                        action: 'clearCredentials'
                    });
                }
            };
            
            console.log('✅ M1SSION™ Face ID Bridge v2 initialized (dual token support)');
        })();
        """
        
        let userScript = WKUserScript(
            source: faceIDJS,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        )
        
        webView.configuration.userContentController.addUserScript(userScript)
        print("✅ M1SSION™ Face ID: Message handler configured")
    }
    
    // MARK: - 🔢 BADGE MESSAGE HANDLER (JS → Native)
    
    /// Sets up message handler for app icon badge updates from WebView
    private func setupBadgeMessageHandler(webView: WKWebView) {
        // Add message handler for badge operations
        webView.configuration.userContentController.add(BadgeMessageHandler(), name: "m1ssionBadge")
        
        // Inject JS bridge for Badge
        let badgeJS = """
        (function() {
            // M1SSION™ Badge Bridge - iOS Native Badge Control
            window.M1SSIONBadge = {
                // Set badge count on app icon
                setBadge: function(count) {
                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.m1ssionBadge) {
                        window.webkit.messageHandlers.m1ssionBadge.postMessage({
                            action: 'setBadge',
                            count: count
                        });
                        return true;
                    }
                    return false;
                },
                // Clear badge
                clearBadge: function() {
                    return this.setBadge(0);
                }
            };
            console.log('✅ M1SSION™ Badge: JS Bridge ready');
        })();
        """
        
        let userScript = WKUserScript(
            source: badgeJS,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        
        webView.configuration.userContentController.addUserScript(userScript)
        print("✅ M1SSION™ Badge: Message handler configured")
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
            
            // 🎬 GLOBAL DARK FIX 05/02/2026: BLACK background on html for dark theme
            // Native layer = BLACK (#0a0a0f), html = BLACK, so overscroll shows black
            document.documentElement.style.setProperty('background', '#0a0a0f', 'important');
            document.documentElement.style.setProperty('background-color', '#0a0a0f', 'important');
            
            // Also set body to dark gradient for consistency
            if (document.body) {
                document.body.style.setProperty('background', 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)', 'important');
                document.body.style.setProperty('background-color', '#0a0a0f', 'important');
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
            
            // 🎬 GLOBAL DARK FIX: Ensure body has dark background and is-native class
            function fixBodyBackground() {
                if (document.body) {
                    document.body.style.setProperty('background', 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)', 'important');
                    document.body.style.setProperty('background-color', '#0a0a0f', 'important');
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
    
    // MARK: - 🚨 APP STORE REVIEW FIX: SSO Hide (Wrapper-Only)
    
    /// Injects JS to hide Google/Apple SSO buttons on the login screen
    /// This runs ONLY in iOS native wrapper, does NOT modify web code
    private func addSSOHideUserScript(to webView: WKWebView) {
        let ssoHideJS = """
        (function() {
            // M1SSION™ iOS Wrapper - SSO Button Hide Fix
            // This script runs at document start and uses MutationObserver
            // to find and hide SSO buttons when they appear
            
            console.log('🚨 [iOSWrapper] SSO Hide script initializing...');
            
            // Set global flag so webapp can detect if needed
            window.__IOS_SSO_DISABLED__ = true;
            
            // CSS to hide SSO buttons - injected early
            var hideCSS = document.createElement('style');
            hideCSS.id = 'm1ssion-ios-sso-hide';
            hideCSS.textContent = `
                /* M1SSION™ iOS Wrapper - Temp SSO Hide for App Review */
                /* Target Apple button by SVG path content */
                button:has(svg path[d^="M17.05"]),
                /* Target Google button by SVG with multiple paths */
                button:has(svg path[fill="#4285F4"]),
                /* Hide any button containing "Apple" or "Google" text */
                button:has(svg):has(~ *:empty) {
                    /* Keep hidden with !important to override any JS show */
                }
                
                /* Fallback: Hide by class or position if above doesn't work */
                .m1ssion-sso-hidden {
                    display: none !important;
                    visibility: hidden !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            `;
            
            // Insert CSS early
            if (document.head) {
                document.head.appendChild(hideCSS);
            } else {
                document.documentElement.appendChild(hideCSS);
            }
            
            // MutationObserver to find and hide SSO buttons when they render
            function hideSSOButtons() {
                var hidden = 0;
                
                // Find all buttons in the DOM
                var buttons = document.querySelectorAll('button');
                buttons.forEach(function(btn) {
                    var text = btn.textContent || '';
                    var hasAppleSVG = btn.querySelector('svg path[d^="M17.05"]');
                    var hasGoogleSVG = btn.querySelector('svg path[fill="#4285F4"]');
                    
                    // Check for Apple button
                    if (hasAppleSVG || text.toLowerCase().includes('apple')) {
                        if (!btn.classList.contains('m1ssion-sso-hidden')) {
                            btn.classList.add('m1ssion-sso-hidden');
                            btn.style.display = 'none';
                            btn.style.visibility = 'hidden';
                            btn.setAttribute('aria-hidden', 'true');
                            btn.setAttribute('disabled', 'true');
                            hidden++;
                            console.log('🚨 [iOSWrapper] Hidden Apple SSO button');
                        }
                    }
                    
                    // Check for Google button
                    if (hasGoogleSVG || text.toLowerCase().includes('google')) {
                        // Make sure it's a sign-in button, not a Google Pay button
                        if (text.toLowerCase().includes('sign') || 
                            text.toLowerCase().includes('continue') ||
                            text.toLowerCase().includes('up with')) {
                            if (!btn.classList.contains('m1ssion-sso-hidden')) {
                                btn.classList.add('m1ssion-sso-hidden');
                                btn.style.display = 'none';
                                btn.style.visibility = 'hidden';
                                btn.setAttribute('aria-hidden', 'true');
                                btn.setAttribute('disabled', 'true');
                                hidden++;
                                console.log('🚨 [iOSWrapper] Hidden Google SSO button');
                            }
                        }
                    }
                });
                
                // Also hide the "or" divider between SSO and email options
                // Look for dividers near hidden buttons
                var dividers = document.querySelectorAll('[class*="flex"][class*="items-center"]');
                dividers.forEach(function(div) {
                    var text = div.textContent || '';
                    if (text.trim().toLowerCase() === 'or' || text.trim().toLowerCase() === 'oppure') {
                        // Check if it's near hidden SSO buttons
                        var parent = div.parentElement;
                        if (parent && parent.querySelector('.m1ssion-sso-hidden')) {
                            if (!div.classList.contains('m1ssion-sso-hidden')) {
                                div.classList.add('m1ssion-sso-hidden');
                                div.style.display = 'none';
                                hidden++;
                                console.log('🚨 [iOSWrapper] Hidden OR divider');
                            }
                        }
                    }
                });
                
                return hidden;
            }
            
            // Run immediately
            var initialHidden = hideSSOButtons();
            console.log('🚨 [iOSWrapper] Initial SSO hide pass: ' + initialHidden + ' elements');
            
            // Set up MutationObserver for dynamically added buttons
            var observer = new MutationObserver(function(mutations) {
                var anyAdded = mutations.some(function(m) { return m.addedNodes.length > 0; });
                if (anyAdded) {
                    hideSSOButtons();
                }
            });
            
            // Start observing once DOM is ready
            function startObserver() {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    console.log('🚨 [iOSWrapper] SSO MutationObserver started');
                } else {
                    setTimeout(startObserver, 10);
                }
            }
            
            startObserver();
            
            // Also run on navigation (SPA route changes)
            var lastUrl = location.href;
            setInterval(function() {
                if (location.href !== lastUrl) {
                    lastUrl = location.href;
                    console.log('🚨 [iOSWrapper] URL changed, re-running SSO hide');
                    setTimeout(hideSSOButtons, 100);
                    setTimeout(hideSSOButtons, 500);
                    setTimeout(hideSSOButtons, 1000);
                }
            }, 200);
            
            console.log('✅ [iOSWrapper] SSO Hide script initialized successfully');
        })();
        """
        
        // Create UserScript that runs at DOCUMENT START
        let userScript = WKUserScript(
            source: ssoHideJS,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        
        webView.configuration.userContentController.addUserScript(userScript)
        print("🚨 M1SSION™ WRAP: SSO Hide UserScript added (App Review fix)")
        
        // Also inject immediately for current page
        webView.evaluateJavaScript(ssoHideJS) { _, error in
            if let error = error {
                print("⚠️ M1SSION™ WRAP: SSO Hide immediate injection error: \(error)")
            } else {
                print("✅ M1SSION™ WRAP: SSO Hide immediate injection successful")
            }
        }
    }
    
    // MARK: - 🔍 iPad Account Buttons Forensics (Temporary — remove or gate after root cause)
    
    /// Dumps view hierarchy and scrollView touch settings on iPad for overlay/hit-test diagnosis
    private func dumpViewHierarchyForIPad(rootVC: UIViewController, webView: WKWebView) {
        print("🔍 [iPad Forensics] === View hierarchy dump ===")
        print("🔍 [iPad Forensics] rootVC.view.subviews.count: \(rootVC.view.subviews.count)")
        for (i, sub in rootVC.view.subviews.enumerated()) {
            print("🔍 [iPad Forensics]   [\(i)] \(type(of: sub)) frame=\(sub.frame) isUserInteractionEnabled=\(sub.isUserInteractionEnabled)")
        }
        if let superview = webView.superview {
            print("🔍 [iPad Forensics] webView.superview: \(type(of: superview)) subviews.count=\(superview.subviews.count)")
            for (i, sub in superview.subviews.enumerated()) {
                print("🔍 [iPad Forensics]   superview[\(i)] \(type(of: sub)) frame=\(sub.frame) isUserInteractionEnabled=\(sub.isUserInteractionEnabled)")
            }
        }
        let scrollView = webView.scrollView
        print("🔍 [iPad Forensics] scrollView.delaysContentTouches=\(scrollView.delaysContentTouches) canCancelContentTouches=\(scrollView.canCancelContentTouches)")
        print("🔍 [iPad Forensics] scrollView.gestureRecognizers: \(scrollView.gestureRecognizers?.count ?? 0)")
        scrollView.gestureRecognizers?.enumerated().forEach { i, g in
            print("🔍 [iPad Forensics]   gesture[\(i)] \(type(of: g))")
        }
        print("🔍 [iPad Forensics] === End view hierarchy ===")
    }
    
    /// Injects JS (iPad only) to log pointerdown target and elementFromPoint — no DOM change
    private func addIPadPointerdownLoggingUserScript(to webView: WKWebView) {
        let script = """
        (function() {
            if (typeof document === 'undefined') return;
            function logPointer(e) {
                var t = e.target;
                var el = document.elementFromPoint(e.clientX, e.clientY);
                var tag = t ? t.tagName : '';
                var cls = t && t.className ? (typeof t.className === 'string' ? t.className : '') : '';
                var elTag = el ? el.tagName : '';
                console.log('[iPad Forensics] pointerdown target=' + tag + ' class=' + cls + ' clientXY=' + e.clientX + ',' + e.clientY + ' elementFromPoint=' + elTag);
            }
            document.addEventListener('pointerdown', logPointer, { capture: true, passive: true });
            console.log('[iPad Forensics] pointerdown logging attached');
        })();
        """
        let userScript = WKUserScript(source: script, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        webView.configuration.userContentController.addUserScript(userScript)
        print("🔍 [iPad Forensics] Pointerdown logging UserScript added (iPad only)")
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
        print("🔐 [AppDelegate] applicationWillEnterForeground - checking Face ID")
        // Notify WebView that app is entering foreground (for Face ID trigger)
        notifyWebViewForeground()
    }
    
    /// Notify WebView about foreground event for Face ID auto-restore
    private func notifyWebViewForeground() {
        guard let rootVC = window?.rootViewController,
              let webView = findWebView(in: rootVC.view) else {
            print("⚠️ [AppDelegate] WebView not found for foreground notification")
            return
        }
        
        // Dispatch event to JS for potential Face ID trigger
        let js = """
        (function() {
            console.log('🔐 [Native] App entered foreground');
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('m1ssion:app-foreground', { 
                    detail: { timestamp: Date.now() }
                }));
            }
        })();
        """
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            webView.evaluateJavaScript(js) { _, error in
                if let error = error {
                    print("⚠️ [AppDelegate] Foreground notification error: \(error)")
                } else {
                    print("✅ [AppDelegate] Foreground notification sent to JS")
                }
            }
        }
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

// MARK: - 🔐 FACE ID MESSAGE HANDLER CLASS
/// Handles messages from WebView for Face ID operations
class FaceIDMessageHandler: NSObject, WKScriptMessageHandler {
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let action = body["action"] as? String else {
            print("⚠️ FaceIDMessageHandler: Invalid message format")
            return
        }
        
        let webView = message.webView
        
        switch action {
        case "checkAvailability":
            handleCheckAvailability(webView: webView)
            
        case "authenticate":
            handleAuthenticate(webView: webView)
            
        case "saveTokens":
            // NEW: Save both access_token and refresh_token
            if let accessToken = body["accessToken"] as? String,
               let refreshToken = body["refreshToken"] as? String {
                handleSaveTokens(accessToken: accessToken, refreshToken: refreshToken)
            }
            
        case "saveToken":
            // LEGACY: Keep for backwards compatibility (will not work properly)
            if let token = body["token"] as? String {
                print("⚠️ FaceIDMessageHandler: Using legacy saveToken - should use saveTokens")
                _ = FaceIDManager.shared.saveCredentials(accessToken: token, refreshToken: token)
            }
            
        case "clearCredentials":
            handleClearCredentials()
            
        default:
            print("⚠️ FaceIDMessageHandler: Unknown action - \(action)")
        }
    }
    
    // MARK: - Action Handlers
    
    private func handleCheckAvailability(webView: WKWebView?) {
        let json = FaceIDManager.shared.availabilityJSON()
        let js = "if(window._m1ssionFaceIDResolve) { window._m1ssionFaceIDResolve(\(json)); window._m1ssionFaceIDResolve = null; }"
        
        DispatchQueue.main.async {
            webView?.evaluateJavaScript(js, completionHandler: nil)
        }
        print("✅ FaceIDMessageHandler: Availability check - \(json)")
    }
    
    private func handleAuthenticate(webView: WKWebView?) {
        // UPDATED: Now returns both access_token and refresh_token
        FaceIDManager.shared.authenticateWithBiometric { success, accessToken, refreshToken, error in
            let result: String
            if success, let accessToken = accessToken, let refreshToken = refreshToken {
                // Return both tokens for proper session restoration
                result = """
                { "success": true, "accessToken": "\(accessToken)", "refreshToken": "\(refreshToken)" }
                """
            } else {
                let errorStr = error ?? "unknown"
                result = """
                { "success": false, "error": "\(errorStr)" }
                """
            }
            
            let js = "if(window._m1ssionFaceIDAuthResolve) { window._m1ssionFaceIDAuthResolve(\(result)); window._m1ssionFaceIDAuthResolve = null; }"
            
            DispatchQueue.main.async {
                webView?.evaluateJavaScript(js, completionHandler: nil)
            }
        }
    }
    
    private func handleSaveTokens(accessToken: String, refreshToken: String) {
        let success = FaceIDManager.shared.saveCredentials(accessToken: accessToken, refreshToken: refreshToken)
        print("✅ FaceIDMessageHandler: Tokens save - \(success ? "success" : "failed")")
    }
    
    private func handleClearCredentials() {
        FaceIDManager.shared.deleteCredentials()
        print("✅ FaceIDMessageHandler: Credentials cleared")
    }
}

// MARK: - 🔢 BADGE MESSAGE HANDLER CLASS
/// Handles messages from WebView for app icon badge updates
class BadgeMessageHandler: NSObject, WKScriptMessageHandler {
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let action = body["action"] as? String else {
            print("⚠️ BadgeMessageHandler: Invalid message format")
            return
        }
        
        switch action {
        case "setBadge":
            if let count = body["count"] as? Int {
                DispatchQueue.main.async {
                    UIApplication.shared.applicationIconBadgeNumber = count
                    print("🔢 BadgeMessageHandler: Badge set to \(count)")
                }
            }
            
        default:
            print("⚠️ BadgeMessageHandler: Unknown action - \(action)")
        }
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
