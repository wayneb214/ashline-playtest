import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { packageWeb, spyRoot, wwwRoot } from "../scripts/package-web.mjs";

const repo = path.resolve(spyRoot, "..");
const ios = path.resolve(spyRoot, "../albion-ios");

test("web bundle is Albion House only", () => {
  const { packed, excluded } = packageWeb();
  const rel = (p) => packed.includes(p);
  assert.ok(rel("index.html"));
  assert.ok(rel("spy.js"));
  assert.ok(rel("audio/voice/ash_problem.mp3"));
  assert.ok(rel("audio/voice/op_macrae_pos.mp3"));
  assert.ok(rel("audio/voice/op_hartley_freed.mp3"));
  assert.ok(rel("img/title.jpg"));
  assert.ok(rel("img/ash.jpg"));
  assert.ok(rel("img/cine/bath-0.jpg"));
  assert.ok(rel("img/cine/video/thames.mp4"));
  assert.ok(rel("img/h-rig.jpg"));
  assert.ok(rel("fonts/cormorant-600.woff2"));
  assert.ok(excluded.includes("img/v-bench.jpg"));
  assert.ok(excluded.includes("img/cine/tr-board.jpg"));
  for (const file of packed) {
    assert.ok(!file.startsWith("review/"), file);
    assert.ok(!file.endsWith(".md"), file);
    assert.ok(!file.includes(".."), file);
  }
  assert.equal(fs.existsSync(path.join(wwwRoot, "review")), false);
  const html = fs.readFileSync(path.join(wwwRoot, "index.html"), "utf8");
  assert.match(html, /<title>Albion House: Spymaster<\/title>/);
  assert.doesNotMatch(html, /British Secret Intelligence|Six Days as C/);
  const text = packed
    .filter((f) => /\.(html|js|css|webmanifest|svg)$/.test(f))
    .map((f) => fs.readFileSync(path.join(wwwRoot, f), "utf8"))
    .join("\n");
  assert.doesNotMatch(text, /Ashline|ashline-playtest\/(?!spy)/);
  assert.match(text, /ashline-playtest\/spy/);
  assert.doesNotMatch(text, /countrysideescape|6827080076/);
  const rootGame = fs.readFileSync(path.join(repo, "index.html"), "utf8");
  assert.match(rootGame, /ASHLINE/);
  assert.equal(packed.some((f) => f.includes("intro-1")), false);
});

test("legacy save ids still migrate and are not shown as the cast", () => {
  const src = fs.readFileSync(path.join(spyRoot, "spy.js"), "utf8");
  const start = src.indexOf("const OLD_IDS");
  const end = src.indexOf("function loadJSON");
  assert.ok(start > 0 && end > start);
  const migrate = new Function(`${src.slice(start, end)}\nreturn migrate;`)();
  const raw = JSON.stringify({
    mole: "kite",
    roster: ["lena", "mira", "ren"],
    note: "Lena Novak met Mira Sol. Ren Okafor and Kite waited. Nadia Kowalczyk. Priya Lockwood. Tobias Adeyemi."
  });
  const out = JSON.parse(migrate(raw));
  assert.equal(out.mole, "ash");
  assert.deepEqual(out.roster, ["macrae", "pryce", "hartley"]);
  assert.match(out.note, /Fiona Macrae/);
  assert.match(out.note, /Gareth Pryce/);
  assert.match(out.note, /Tom Hartley/);
  assert.match(out.note, /Ash waited/);
  assert.doesNotMatch(out.note, /\b(Kite|Lena|Mira|Ren|Nadia|Priya|Toby)\b/);
  assert.match(src, /albion-save-v1/);
  assert.doesNotMatch(src, /localStorage\.setItem\(\s*"ashline/);
});

test("icon art has no flag shield or Ashline mark", () => {
  const svg = fs.readFileSync(path.join(spyRoot, "icon.svg"), "utf8");
  assert.match(svg, /#1f3a2f/);
  assert.match(svg, /#c9a24a/);
  assert.doesNotMatch(svg, /clipPath|22305a|9c2a2a|Ashline|kite/i);
  const png = fs.readFileSync(path.join(ios, "resources", "icon-1024.png"));
  assert.equal(png.readUInt32BE(16), 1024);
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
});

test("Codemagic workflow is manual and is not the other app", () => {
  const yml = fs.readFileSync(path.join(repo, "codemagic.yaml"), "utf8");
  assert.match(yml, /instance_type: mac_mini_m2/);
  assert.match(yml, /node: 22/);
  assert.match(yml, /npm ci/);
  assert.match(yml, /npm test/);
  assert.match(yml, /npm run ios:sync/);
  assert.match(yml, /CERTIFICATE_PRIVATE_KEY/);
  assert.match(yml, /keychain initialize/);
  assert.match(yml, /fetch-signing-files "\$BUNDLE_ID"/);
  assert.match(yml, /--type IOS_APP_STORE/);
  assert.match(yml, /--strict-match-identifier/);
  assert.match(yml, /--create/);
  assert.match(yml, /keychain add-certificates/);
  assert.match(yml, /xcode-project use-profiles/);
  assert.match(yml, /CURRENT_PROJECT_VERSION/);
  assert.match(yml, /xcode-project build-ipa/);
  assert.match(yml, /BUNDLE_ID: io\.github\.wayneb214\.albionhouse/);
  assert.match(yml, /Albion House App Store Connect key/);
  assert.match(yml, /SET_AFTER_APP_STORE_CONNECT_RECORD/);
  assert.match(yml, /code_signing/);
  assert.doesNotMatch(yml, /triggering:/);
  assert.doesNotMatch(yml, /6827080076|countrysideescape|CET App Store/);
  assert.doesNotMatch(yml, /500 macOS|free tier/i);
  const cfg = JSON.parse(fs.readFileSync(path.join(ios, "capacitor.config.json"), "utf8"));
  assert.equal(cfg.appId, "io.github.wayneb214.albionhouse");
  assert.equal(cfg.appName, "Albion House: Spymaster");
  assert.equal(cfg.webDir, "www");
  assert.equal(cfg.ios.contentInset, "never");
  assert.equal(cfg.server, undefined);
});

test("iOS project is SPM, portrait, and only declares behaviour the game uses", () => {
  const plist = fs.readFileSync(path.join(ios, "ios/App/App/Info.plist"), "utf8");
  assert.match(plist, /Albion House: Spymaster/);
  assert.match(plist, /NSMotionUsageDescription/);
  assert.match(plist, /ITSAppUsesNonExemptEncryption/);
  assert.match(plist, /<false\/>/);
  assert.match(plist, /UIInterfaceOrientationPortrait/);
  assert.doesNotMatch(plist, /UIInterfaceOrientationLandscape/);
  for (const key of ["NSCameraUsageDescription", "NSMicrophoneUsageDescription", "NSPhotoLibraryUsageDescription", "NSLocationWhenInUseUsageDescription", "NSUserTrackingUsageDescription"]) {
    assert.equal(plist.includes(key), false, key);
  }
  const privacy = fs.readFileSync(path.join(ios, "ios/App/App/PrivacyInfo.xcprivacy"), "utf8");
  assert.match(privacy, /NSPrivacyTracking/);
  assert.ok(privacy.includes("<false/>"));
  assert.match(privacy, /NSPrivacyCollectedDataTypes/);
  assert.equal(privacy.includes("NSPrivacyCollectedDataType\n") || privacy.includes("NSPrivacyCollectedDataTypes"), true);
  assert.equal(privacy.includes("NSPrivacyCollectedDataType<"), false);
  assert.equal(fs.existsSync(path.join(ios, "ios/App/Podfile")), false);
  assert.equal(fs.existsSync(path.join(ios, "ios/App/CapApp-SPM/Package.swift")), true);
  const pbx = fs.readFileSync(path.join(ios, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
  assert.match(pbx, /io\.github\.wayneb214\.albionhouse/);
  assert.match(pbx, /TARGETED_DEVICE_FAMILY = 1;/);
  assert.match(pbx, /IPHONEOS_DEPLOYMENT_TARGET = 15\.0;/);
  assert.doesNotMatch(pbx, /CocoaPods|Pods\.xcodeproj/);
  const lock = fs.readFileSync(path.join(ios, "package-lock.json"), "utf8");
  assert.match(lock, /"@capacitor\/ios": "8\.6\.0"/);
  assert.match(lock, /"lockfileVersion": 3/);
});
