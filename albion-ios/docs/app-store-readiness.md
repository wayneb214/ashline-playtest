# Albion House: Spymaster — App Store readiness

This is a setup checklist. It does not start a cloud build or upload a build.

The bundle id `io.github.wayneb214.albionhouse` is registered. The App Store Connect Apple ID for this app is `6832206818`. Do not point Codemagic at another app's id.

## What the app actually does

Albion House is a single-player story. It is bundled inside the app and plays with no network.

- Saves, settings, endings and the "have we asked for a rating" flag stay in on-device `localStorage` under `albion-*` keys. Old saves that still use the earlier officer ids are rewritten on load. The keys themselves are not renamed.
- Sound stays silent until the first tap, the same as the web game. Reduced motion follows the system setting and the in-game switch.
- The layout is portrait. The web view is edge to edge (`viewport-fit=cover`, `ios.contentInset: never`) so the existing safe-area padding is not applied twice.
- Cutscenes can ask for device tilt. That is the only permission string, `NSMotionUsageDescription`. There is no camera, microphone, photo library, location, contacts, Bluetooth, or tracking prompt, because the game does not use those.
- The privacy manifest says the app does not track and does not collect data. Nothing in the game is sent to a server.
- `ITSAppUsesNonExemptEncryption` is false because the app does not add its own encryption. It only uses the ordinary iOS web view.
- Haptics use the system vibration API when the player has haptics on. There is no Game Center and no review prompt until an App Store id is filled in, and that id is empty on purpose.

## What is already in the repo

- `albion-ios/` — Capacitor 8, Node 22, Swift Package Manager. No CocoaPods.
- `codemagic.yaml` at the repository root. Codemagic reads that filename only from the root, so the file is not inside `albion-ios/`. The workflow sets `working_directory: albion-ios`, then installs with `npm ci`, runs tests, packages the web game, syncs iOS, checks `CERTIFICATE_PRIVATE_KEY`, initializes the keychain, fetches the App Store signing files for this bundle id, installs them, bumps the build number, and builds the IPA. The IPA is written to `albion-ios/build/ios/ipa/` (an absolute path). The artifact pattern is `albion-ios/build/ios/ipa/*.ipa`, which is relative to the repository root, where Codemagic looks for artifacts.
- The web bundle is produced by `npm run package-web`. It copies `spy/` runtime files only. It leaves out the root Ashline game, `spy/review/`, and images the game never asks for.

The web playtest still lives at the existing GitHub Pages path `ashline-playtest/spy/`. That path is an infrastructure dependency. Do not rename the repository or that URL to make the iOS app.

## Codemagic setup

The workflow uses the same kind of signing as the other shipped app: a Codemagic App Store Connect API-key integration, and one distribution-certificate private key in the team variable group `code_signing`. An active Apple Developer membership is required. A local Mac is not required to run this workflow. This file does not promise any free build minutes.

Do not trigger the workflow until the items below are true. A successful run uploads to TestFlight.

The bundle id and the App Store Connect record already exist. `APP_STORE_APPLE_ID` in `codemagic.yaml` is `6832206818`. Leave that value as it is. The build refuses to continue if the variable is changed.

1. In Codemagic, open the application for this repository (`wayneb214/ashline-playtest`), the whole repository, not a subdirectory.
2. Set the configuration to the repository-root file `codemagic.yaml`. Codemagic does not discover a YAML file inside `albion-ios/`. If a settings field asks for a configuration path, enter `codemagic.yaml`. Do not enter `albion-ios/codemagic.yaml`.
3. Create a team integration named exactly `Albion House App Store Connect key`. It is an App Store Connect API key with access to this app. Select that integration for this application. Do not select another app's key.
4. Confirm the variable group `code_signing` contains `CERTIFICATE_PRIVATE_KEY` (the Apple Distribution certificate private key in PEM). The workflow stops with a setup error if it is missing. Do not put the key in git.
5. Do not override `BUNDLE_ID` or `APP_STORE_APPLE_ID` in the Codemagic UI. They are `io.github.wayneb214.albionhouse` and `6832206818`.
6. Leave automatic builds off. When the items above are done, start `Albion House iOS → TestFlight` by hand.

## Owner decisions still open

- Home-screen truncation. The display name is the full `Albion House: Spymaster`. iOS may shorten it under the icon. If that looks wrong on a device, choose a shorter `CFBundleDisplayName` (`Albion House` or `Spymaster`).
- The in-game title roundel still draws a star over a stylised flag shield. The app icon does not. It is the bottle-green roundel and brass star from that mark, with the shield left out. Say if the in-game shield should change too.
- iPhone only (`TARGETED_DEVICE_FAMILY = 1`), portrait only. iPad is not a target.
- The rate-this-game control stays hidden. `APP_STORE_ID` in `spy/review.js` is still empty. The App Store Connect number for a later change, if you want that button, is `6832206818`.

## Not verified here

A Mac and an Apple-signed device are required for the items below. They were not run.

- Xcode compile, signing, and the IPA itself
- Installing on an iPhone
- The tilt permission prompt, haptics, and the home-screen name as iOS draws them
- Safe areas on a notched phone (the CSS is the same as the web game; the web view flags are set so those insets can be non-zero)
- TestFlight processing
