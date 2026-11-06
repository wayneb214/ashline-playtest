# Albion House: Spymaster — App Store readiness

This is a setup checklist, not a submission. Nothing here registers the app, creates an App Store Connect record, starts a cloud build, or uploads a build.

The proposed bundle id is `io.github.wayneb214.albionhouse`. It is **not registered** with Apple. Do not ship, and do not point Codemagic at another app's id, until you register this one.

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
- `codemagic.yaml` at the repository root — manual `mac_mini_m2` workflow. It installs with `npm ci`, runs tests, packages the web game, syncs iOS, checks `CERTIFICATE_PRIVATE_KEY`, initializes the keychain, fetches the App Store signing files for this bundle id, installs them, bumps the build number, and builds an IPA.
- The web bundle is produced by `npm run package-web`. It copies `spy/` runtime files only. It leaves out the root Ashline game, `spy/review/`, and images the game never asks for.

The web playtest still lives at the existing GitHub Pages path `ashline-playtest/spy/`. That path is an infrastructure dependency. Do not rename the repository or that URL to make the iOS app.

## Codemagic setup

The workflow uses the same kind of signing as the other shipped app: a Codemagic App Store Connect API-key integration, and one distribution-certificate private key in the team variable group `code_signing`. An active Apple Developer membership is required. A local Mac is not required to run this workflow. This file does not promise any free build minutes.

Do not trigger the workflow until every item below is true. A successful run uploads to TestFlight.

1. Register the explicit App ID `io.github.wayneb214.albionhouse` on your Apple team. Do not reuse another app's id.
2. Create the App Store Connect record for that bundle id. Its name should be Albion House: Spymaster. Note the numeric Apple ID of that record.
3. In Codemagic, create a team integration named exactly `Albion House App Store Connect key` (an App Store Connect API key with access to this app). Do not select another app's integration.
4. Confirm the variable group `code_signing` contains `CERTIFICATE_PRIVATE_KEY` (the Apple Distribution certificate private key in PEM). The workflow stops with a setup error if it is missing. Do not put the key in git.
5. In the workflow variables, set `APP_STORE_APPLE_ID` to the number from step 2. The committed placeholder is `SET_AFTER_APP_STORE_CONNECT_RECORD`. The build refuses to continue while that placeholder, a blank value, or a non-numeric value is set, and it refuses a bundle id other than `io.github.wayneb214.albionhouse`.
6. Leave automatic builds off. Start `Albion House iOS → TestFlight` by hand.

## Owner decisions still open

- Home-screen truncation. The display name is the full `Albion House: Spymaster`. iOS may shorten it under the icon. If that looks wrong on a device, choose a shorter `CFBundleDisplayName` (`Albion House` or `Spymaster`).
- The in-game title roundel still draws a star over a stylised flag shield. The app icon does not. It is the bottle-green roundel and brass star from that mark, with the shield left out. Say if the in-game shield should change too.
- iPhone only (`TARGETED_DEVICE_FAMILY = 1`), portrait only. iPad is not a target.
- The rate-this-game control stays hidden until `APP_STORE_ID` in `spy/review.js` is set to this app's id. Leave it empty until the App Store record exists.

## Not verified here

A Mac and an Apple-signed device are required for the items below. They were not run.

- Xcode compile, signing, and the IPA itself
- Installing on an iPhone
- The tilt permission prompt, haptics, and the home-screen name as iOS draws them
- Safe areas on a notched phone (the CSS is the same as the web game; the web view flags are set so those insets can be non-zero)
- TestFlight processing
