
# Cross-Platform Testing Guide

This directory contains automated tests for verifying the application works correctly across different platforms, browsers, and device sizes.

## Running the Tests

To run all tests:
```bash
npm test
```

To run tests on specific browser:
```bash
npm test -- --project=chromium
npm test -- --project=firefox
npm test -- --project=webkit
```

To run tests on mobile devices:
```bash
npm test -- --project=mobile-chrome
npm test -- --project=mobile-safari
```

To run tests on tablet devices:
```bash
npm test -- --project=tablet-chrome
npm test -- --project=tablet-safari
```

## Manual Testing Checklist

In addition to automated tests, perform these manual checks on real devices when possible:

### Desktop Testing
- [ ] Test on Windows (Chrome, Firefox, Edge)
- [ ] Test on macOS (Chrome, Safari, Firefox)
- [ ] Test on Linux (Chrome, Firefox)

### Mobile Testing
- [ ] Test on iOS (Safari)
- [ ] Test on Android (Chrome)

### Tablet Testing
- [ ] Test on iPad (Safari)
- [ ] Test on Android tablet (Chrome)

### Features to Test Manually
1. **Authentication**
   - [ ] Login
   - [ ] Registration
   - [ ] Password reset

2. **Map Functionality**
   - [ ] Markers placing
   - [ ] Search areas
   - [ ] Geolocation

3. **Notifications**
   - [ ] Push notifications permissions
   - [ ] Notification display

4. **Real Device Capabilities**
   - [ ] Camera access
   - [ ] Location services
   - [ ] Background processing

## Testing on Real Devices with Capacitor

For testing on real devices using Capacitor:

1. Build the web app:
```bash
npm run build
```

2. Sync with Capacitor:
```bash
npx cap sync
```

3. Run on iOS:
```bash
npx cap open ios
```

4. Run on Android:
```bash
npx cap open android
```
