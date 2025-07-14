#!/bin/bash

# Make all iOS scripts executable
chmod +x scripts/fix-ios-uiscene.sh
chmod +x scripts/ios-debug-complete.sh  
chmod +x scripts/ios-emergency-reset.sh
chmod +x scripts/ios-build-and-test.sh

echo "✅ All iOS scripts are now executable!"
echo ""
echo "📋 AVAILABLE COMMANDS:"
echo "• ./scripts/ios-debug-complete.sh     - Diagnosi completa problemi"
echo "• ./scripts/fix-ios-uiscene.sh        - Risolve UIScene (CRITICO)"  
echo "• ./scripts/ios-build-and-test.sh     - Build + test completo"
echo "• ./scripts/ios-emergency-reset.sh    - Reset totale (ultima risorsa)"