#!/bin/bash
# ============================================================
# GREEN YATRA INDIA — Native Folder Setup Script
# Run this once from inside the mobile/ directory:
#   cd mobile
#   bash setup_native.sh
# ============================================================

set -e

echo ""
echo "🌿 Green Yatra India — Native Folder Setup"
echo "==========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check if android/ already exists
if [ -d "android" ]; then
  echo "⚠️  android/ folder already exists. Skipping generation."
  echo "   Delete it first if you want to regenerate: rm -rf android ios"
else
  echo ""
  echo "📱 Generating native folders..."
  echo "   This may take 2-3 minutes on first run (downloads React Native)..."
  echo ""

  # Go up one level, init, copy back
  cd ..
  npx react-native@0.73.0 init GreenYatraIndia --version 0.73.0 --skip-install

  echo ""
  echo "📋 Copying android/ and ios/ into mobile/..."
  cp -r GreenYatraIndia/android mobile/android
  cp -r GreenYatraIndia/ios     mobile/ios

  # Clean up temp project
  rm -rf GreenYatraIndia

  cd mobile

  echo "✅ Native folders created!"
fi

# Fix app display name in Android
if [ -f "android/app/src/main/res/values/strings.xml" ]; then
  sed -i.bak 's/<string name="app_name">.*<\/string>/<string name="app_name">Green Yatra India<\/string>/' \
    android/app/src/main/res/values/strings.xml
  echo "✅ Android app name set to 'Green Yatra India'"
fi

# Set Android SDK path if not set
if [ ! -f "android/local.properties" ]; then
  if [ "$(uname)" == "Darwin" ]; then
    SDK_PATH="$HOME/Library/Android/sdk"
  else
    SDK_PATH="$HOME/Android/Sdk"
  fi

  if [ -d "$SDK_PATH" ]; then
    echo "sdk.dir=$SDK_PATH" > android/local.properties
    echo "✅ Android SDK path set: $SDK_PATH"
  else
    echo "⚠️  Could not find Android SDK automatically."
    echo "   Copy android-template/local.properties.example to android/local.properties"
    echo "   and update the sdk.dir path."
    cp android-template/local.properties.example android/local.properties
  fi
fi

# Install JS dependencies
echo ""
echo "📦 Installing JavaScript dependencies..."
npm install
echo "✅ JS dependencies installed"

# iOS setup (Mac only)
if [ "$(uname)" == "Darwin" ]; then
  echo ""
  echo "🍎 Mac detected — setting up iOS..."

  if command -v pod &> /dev/null; then
    cd ios
    pod install
    cd ..
    echo "✅ iOS pods installed"
  else
    echo "⚠️  CocoaPods not found. Install with: sudo gem install cocoapods"
    echo "   Then run: cd ios && pod install"
  fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add Firebase config files (optional, for push notifications):"
echo "     - android/app/google-services.json"
echo "     - ios/GreenYatraIndia/GoogleService-Info.plist"
echo ""
echo "  2. Start the app:"
echo "     npx react-native start          (Terminal 1 — Metro bundler)"
echo "     npx react-native run-android    (Terminal 2 — Android)"
echo "     npx react-native run-ios        (Terminal 2 — iOS, Mac only)"
echo ""
