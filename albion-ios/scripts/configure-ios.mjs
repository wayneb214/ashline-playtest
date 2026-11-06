#!/usr/bin/env node
/* Apply Albion House iOS settings the Capacitor template does not know about.
   Safe to run after every `cap sync ios`. Does not register the app or sign it. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "ios", "App", "App");
const plistPath = path.join(appDir, "Info.plist");
const pbxPath = path.join(root, "ios", "App", "App.xcodeproj", "project.pbxproj");
const iconSrc = path.join(root, "resources", "icon-1024.png");
const BUNDLE = "io.github.wayneb214.albionhouse";
const DISPLAY = "Albion House: Spymaster";

const MOTION = "Albion House uses the phone's tilt to shift the camera slightly during cutscenes. The game plays without it.";

function die(msg) { console.error(msg); process.exit(1); }

const INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CAPACITOR_DEBUG</key>
	<string>$(CAPACITOR_DEBUG)</string>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>${DISPLAY}</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>$(MARKETING_VERSION)</string>
	<key>CFBundleVersion</key>
	<string>$(CURRENT_PROJECT_VERSION)</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIApplicationSceneManifest</key>
	<dict>
		<key>UIApplicationSupportsMultipleScenes</key>
		<false/>
		<key>UISceneConfigurations</key>
		<dict>
			<key>UIWindowSceneSessionRoleApplication</key>
			<array>
				<dict>
					<key>UISceneConfigurationName</key>
					<string>Default Configuration</string>
					<key>UISceneDelegateClassName</key>
					<string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
					<key>UISceneStoryboardFile</key>
					<string>Main</string>
				</dict>
			</array>
		</dict>
	</dict>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIMainStoryboardFile</key>
	<string>Main</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<true/>
	<key>UIStatusBarStyle</key>
	<string>UIStatusBarStyleLightContent</string>
	<key>ITSAppUsesNonExemptEncryption</key>
	<false/>
	<key>NSMotionUsageDescription</key>
	<string>${MOTION}</string>
</dict>
</plist>
`;

function ensurePrivacyInProject(pbx) {
  if (pbx.includes("PrivacyInfo.xcprivacy")) return pbx;
  const fileRef = "A1B100010000000000000002";
  const build = "A1B100010000000000000001";
  pbx = pbx.replace(
    "/* End PBXBuildFile section */",
    `\t\t${build} /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = ${fileRef} /* PrivacyInfo.xcprivacy */; };\n/* End PBXBuildFile section */`
  );
  pbx = pbx.replace(
    "/* End PBXFileReference section */",
    `\t\t${fileRef} /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = PrivacyInfo.xcprivacy; sourceTree = "<group>"; };\n/* End PBXFileReference section */`
  );
  pbx = pbx.replace(
    "504EC3131FED79650016851F /* Info.plist */,",
    "504EC3131FED79650016851F /* Info.plist */,\n\t\t\t\tA1B100010000000000000002 /* PrivacyInfo.xcprivacy */,"
  );
  pbx = pbx.replace(
    "2FAD9763203C412B000D30F8 /* config.xml in Resources */,",
    "2FAD9763203C412B000D30F8 /* config.xml in Resources */,\n\t\t\t\tA1B100010000000000000001 /* PrivacyInfo.xcprivacy in Resources */,"
  );
  return pbx;
}

export function configureIos() {
  if (!fs.existsSync(plistPath)) die(`Missing ${plistPath}. Run npx cap add ios --packagemanager SPM from albion-ios first.`);
  if (fs.existsSync(path.join(root, "ios", "App", "Podfile"))) die("CocoaPods Podfile is present. This app uses Swift Package Manager only.");
  fs.writeFileSync(plistPath, INFO_PLIST);
  for (const banned of ["NSCameraUsageDescription", "NSMicrophoneUsageDescription", "NSPhotoLibraryUsageDescription", "NSLocationWhenInUseUsageDescription", "NSUserTrackingUsageDescription"]) {
    if (INFO_PLIST.includes(`<key>${banned}</key>`)) die(`Info.plist declares ${banned}, which this game does not use.`);
  }

  const privacy = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSPrivacyTracking</key>
	<false/>
	<key>NSPrivacyTrackingDomains</key>
	<array/>
	<key>NSPrivacyCollectedDataTypes</key>
	<array/>
	<key>NSPrivacyAccessedAPITypes</key>
	<array/>
</dict>
</plist>
`;
  fs.writeFileSync(path.join(appDir, "PrivacyInfo.xcprivacy"), privacy);

  if (!fs.existsSync(pbxPath)) die(`Missing ${pbxPath}`);
  let pbx = fs.readFileSync(pbxPath, "utf8");
  if (!pbx.includes(BUNDLE)) die(`Xcode project bundle id is not ${BUNDLE}. It is proposed and not registered; do not substitute another app's id.`);
  if (pbx.includes("countrysideescape") || pbx.includes("6827080076")) die("Xcode project contains another app's identity.");
  pbx = pbx.replace(/TARGETED_DEVICE_FAMILY = [^;]+;/g, "TARGETED_DEVICE_FAMILY = 1;");
  pbx = pbx.replace(/IPHONEOS_DEPLOYMENT_TARGET = [^;]+;/g, "IPHONEOS_DEPLOYMENT_TARGET = 15.0;");
  pbx = ensurePrivacyInProject(pbx);
  fs.writeFileSync(pbxPath, pbx);

  const iconSet = path.join(appDir, "Assets.xcassets", "AppIcon.appiconset");
  if (!fs.existsSync(iconSet)) die(`Missing ${iconSet}`);
  const contentsPath = path.join(iconSet, "Contents.json");
  const contents = JSON.parse(fs.readFileSync(contentsPath, "utf8"));
  const named = (contents.images || []).map((img) => img.filename).filter(Boolean);
  const destName = named[0] || "AppIcon-512@2x.png";
  if (!named.length) {
    contents.images = [{ filename: destName, idiom: "universal", platform: "ios", size: "1024x1024" }];
    fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2) + "\n");
  }
  if (!fs.existsSync(iconSrc)) die(`Missing ${iconSrc}`);
  for (const old of fs.readdirSync(iconSet)) {
    if (old !== "Contents.json" && old !== destName) fs.rmSync(path.join(iconSet, old));
  }
  fs.copyFileSync(iconSrc, path.join(iconSet, destName));
  console.log("iOS project configured for", DISPLAY, BUNDLE);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) configureIos();
