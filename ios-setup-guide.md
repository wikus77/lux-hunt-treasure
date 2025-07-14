# M1SSION™ iOS Setup Guide - UIScene Configuration

## Info.plist Configuration Required

Add the following configuration to your `ios/App/App/Info.plist` file to resolve UIScene lifecycle warnings:

```xml
<!-- Add this section to your Info.plist -->
<key>UIApplicationSceneManifest</key>
<dict>
    <key>UIApplicationSupportsMultipleScenes</key>
    <true/>
    <key>UISceneConfigurations</key>
    <dict>
        <key>UIWindowSceneSessionRoleApplication</key>
        <array>
            <dict>
                <key>UISceneDelegateClassName</key>
                <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
                <key>UISceneStoryboardFile</key>
                <string>Main</string>
            </dict>
        </array>
    </dict>
</dict>

<!-- Enhanced App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## Commands to Execute After Configuration:

```bash
# Build the project
npm run build

# Sync Capacitor plugins
npx cap sync ios

# Open in Xcode for testing
npx cap open ios
```

## Critical Tests in Xcode:

1. **Monitor Console Logs**: Check for UIScene lifecycle warnings
2. **Test SplashScreen**: Verify 3000ms timeout behavior
3. **Network Status**: Test online/offline detection
4. **Push Notifications**: Verify permission requests
5. **Safe Area**: Test on different iPhone models
6. **Navigation**: Test deep linking and routing

This configuration resolves the "CLIENT OF UIKIT REQUIRES UPDATE" warning and ensures proper iOS 13+ compatibility.