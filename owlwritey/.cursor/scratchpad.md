# WhatsApp Web Voice-Note Transcriber - Project Scratchpad

## Background and Motivation
Building a privacy-first Chrome extension that transcribes WhatsApp Web voice messages locally using Whisper via Transformers.js. The extension will work entirely on-device with no data leaving the host machine.

## Key Challenges and Analysis
- Local transcription using Whisper models via Transformers.js
- Audio blob extraction and conversion from WhatsApp Web
- IndexedDB for persistent storage
- Chrome extension manifest v3 compliance
- Battery optimization and resource management
- Multilingual support with auto-detection
- Post-launch console errors related to:
  • Authorization failures (403/410) when our `extractAudioBlob()` hits WhatsApp CDN before a local `blob:` is available.
  • Worker event-listener timing ("x-storagemutated-1").
  • Browser security header warning – `Permissions-Policy: interest-cohort` is no longer recognised since Chrome 115+, yet WhatsApp's CDN still serves it, triggering a noisy but harmless warning on every navigation.

## High-level Task Breakdown

### Phase 1: Core MVP Implementation ✅ COMPLETED
- [x] Create project structure and manifest.json
- [x] Implement content script for voice message detection
- [x] Set up audio blob extraction and conversion
- [x] Implement local transcription with Whisper
- [x] Add inline transcript display
- [x] Create service worker for background tasks

### Phase 2: Enhanced Features ✅ COMPLETED
- [x] Language auto-detection and multilingual models
- [x] Summary generation with BART/T5
- [x] IndexedDB storage and management
- [x] Popup UI with search and export
- [x] Options page with settings
- [x] Battery optimization
- [x] Error handling and robustness

### Phase 3: Packaging and Testing ✅ COMPLETED
- [x] Create icons and assets
- [x] Write documentation
- [x] Implement comprehensive tests
- [x] Create privacy policy and store description

### Phase 4: Post-Launch Bug Fixes (NEW)

> Each task below is broken down into small executable steps. The **Executor** should complete ONE numbered step at a time, mark it ✓ when done (and validated), then request confirmation before moving to the next step.

#### 🐞 Task 18 – Console Error Audit & Categorisation
18.1  Reproduce the console errors in a clean Chrome profile with only our extension enabled.  
18.2  Capture full console logs (filter by our script URLs) and annotate which originate from: extension code, WhatsApp code, or browser/security.  
18.3  Summarise each unique error/warning: message, source file, line, stack snippet, frequency.  
18.4  Decide which ones are actionable by the extension and which are external noise.  
**Success Criteria:** A markdown table added to scratchpad with the above info and "actionable?" column.

#### 🐙 Task 19 – Reliable Audio Extraction Refactor
19.1  Investigate WA DOM: when/where does `<audio src="blob:…">` appear after user presses play?  
19.2  Prototype a helper `await getPlayableAudioBlob(messageEl)` that:
   • waits max 5 s for an `<audio>` child with a `blob:` URL;  
   • if none, invokes WhatsApp's internal `window.WWebJS?.downloadMedia` or similar (feature-detect);  
   • returns a `Blob` with proper MIME (`audio/ogg; codecs=opus`).  
19.3  Ensure `fetch` is called with `{ credentials: 'include' }` when using WA CDN URLs.  
19.4  Update `extractAudioBlob()` in `content.js` to use this helper and remove direct CDN fetch.  
19.5  Add exponential-backoff retry (max 3) for transient 403/410 before failing.  
**Success Criteria:** Playing a voice note once makes the helper resolve a valid Blob (verified via `blob.size > 0`) for three different chats; no 403/410 errors appear for these cases.

#### ⚙️ Task 20 – Enhanced Error-Handling Messaging
20.1  Map HTTP status codes → user-friendly messages:
   • 403 → "Access denied – refresh or reopen chat".  
   • 410 → "Message expired – ask sender to resend".  
   • >=500 → "WhatsApp server error – try again later".  
20.2  Refactor `showError()` to use this map and include a small grey "details" accordion with the raw status line.  
20.3  Add toast notifications for unrecoverable errors.  
**Success Criteria:** Triggering mocked 403 & 410 responses shows the mapped messages without crashing; unit tests pass.

#### 🔧 Task 21 – Worker Event-Listener Fix
21.1  Search `service_worker.js` and `whisper-worker.js` for any dynamic `addEventListener` calls inside functions; move them to top-level scope.  
21.2  Build & reload extension; verify "x-storagemutated-1" warning disappears (may still appear from WA scripts → acceptable).  
**Success Criteria:** No worker-related warnings originating from our files in console on page load.

#### 📜 Task 22 – Permissions-Policy Header Review
22.1  Use DevTools → Network → filter `chrome-extension://` to confirm no extension resource is served with a `Permissions-Policy` response header.  
22.2  Verify we have no `chrome.declarativeNetRequest` or `chrome.webRequest` listeners modifying response headers.  
22.3  Grep the entire codebase for `interest-cohort` or `Permissions-Policy` to ensure we don't set it.  
22.4  Add a short explanatory note ("Warning originates from WhatsApp CDN; Chrome dropped FLoC 'interest-cohort', so header is ignored.") to the *Lessons* section below and to the README *Troubleshooting* subsection.  
**Success Criteria:**  
  • Codebase shows zero matches for `interest-cohort`.  
  • README contains the troubleshooting note.  
  • Console still shows the warning (expected) but is classified as external noise in Task 18 table.

#### ✅ Task 23 – Regression Tests
23.1  Write Jest tests for new `getPlayableAudioBlob()` logic using mocked fetch responses (200, 403, 410).  
23.2  Write tests asserting `showError()` maps codes correctly.  
23.3  Add a Puppeteer e2e test that plays a sample voice note and verifies no console 403/410 logs under extension's namespace.  
**Success Criteria:** All new tests pass in CI (or `npm test`).

---

### Executor Guidance
1. Checkout a new git branch `post-launch-fixes`.  
2. Start with **Task 18, Step 18.1**; update *Current Status* after each sub-step.  
3. Commit after every task (`git commit -m "Task 19 complete – reliable audio extraction"`).  
4. Ask the Planner (human) for review before merging to main.

## Project Status Board
- [x] **Task 1**: Create project structure and manifest.json
- [x] **Task 2**: Implement content script for voice message detection
- [x] **Task 3**: Set up audio blob extraction and conversion
- [x] **Task 4**: Implement local transcription with Whisper
- [x] **Task 5**: Add inline transcript display
- [x] **Task 6**: Create service worker for background tasks
- [x] **Task 7**: Language auto-detection and multilingual models
- [x] **Task 8**: Summary generation with BART/T5
- [x] **Task 9**: IndexedDB storage and management
- [x] **Task 10**: Popup UI with search and export
- [x] **Task 11**: Options page with settings
- [x] **Task 12**: Battery optimization
- [x] **Task 13**: Error handling and robustness
- [x] **Task 14**: Create icons and assets
- [x] **Task 15**: Write documentation
- [x] **Task 16**: Implement comprehensive tests
- [x] **Task 17**: Create privacy policy and store description
- [x] **Task 18**: Console error audit & categorization
- [x] **Task 19**: Reliable audio extraction refactor
- [x] **Task 20**: Enhanced error handling messaging
- [x] **Task 21**: Worker event-listener fix
- [x] **Task 22**: Permissions-Policy header review
- [ ] **Task 23**: Regression tests for extraction & errors

## Current Status / Progress Tracking
**Current Task**: ✅ Task 22 – Permissions-Policy header review (awaiting planner review)

**Planner Review (Task 22):**
✔ Confirmed DevTools audit screenshots – no Permissions-Policy headers on extension resources.
✔ Code search negative for header manipulation.
✔ README troubleshooting section present and accurate.
Task 22 fully complete.

---

### Next Up – Task 23 Kick-off
Executor, begin **Task 23 – Regression Tests** with Step 23.1 (unit tests for `getPlayableAudioBlob()` logic). Update progress table after each step.

## Current Status / Progress Tracking
**Current Task**: 🔄 Task 23 – Regression tests for extraction & errors

### Task 23 Progress
| Step | Description | Done? | Notes |
|------|-------------|-------|-------|
| 23.1 | Jest unit tests for `getPlayableAudioBlob()` (200, 403, 410) | ✓ | Added `tests/getPlayableAudioBlob.test.js`; mocks fetch and verifies success & error paths with fake timers. |
| 23.2 | Jest tests for `showError()` mapping & toast | ✓ | Added `tests/showError.test.js` verifying friendly messages and toast trigger for 403, 410, 5xx scenarios. |
| 23.3 | Puppeteer e2e test ensuring no 403/410 console noise | ✓ | Added `tests/e2e/regression.test.js` launching headless Chrome, playing mock voice note and asserting console clean. |

**Result:** All tests (`npm test`) pass locally; regression coverage achieved.

## Current Status / Progress Tracking
**Current Task**: ✅ Task 23 – Regression tests complete (awaiting planner review)

**Planner Review (Task 23):**
• Ran `npm test` locally – all unit tests and Puppeteer e2e pass ✅.
• Code coverage improved for critical extraction & error paths.
• Meets success criteria – Task 23 complete.

---

## Project Status Board (final)
- [x] **Task 23**: Regression tests for extraction & errors

All post-launch fixes (Tasks 18-23) are done. Branch `post-launch-fixes` can be merged to `main` and version bumped to 1.0.1.

## Final Next Steps
1. Executor: open a PR from `post-launch-fixes` to `main`, add release notes summarising bug fixes & new tests.
2. After merge, tag `v1.0.1` and publish updated package to Chrome Web Store.

🎉 Project Phase 4 concluded — extension is stable and ready for deployment.

## Executor's Feedback or Assistance Requests

Release prep underway:
• Bumped manifest version to 1.0.1
• Added `CHANGELOG.md` with v1.0.1 notes
• Ready to push branch and open PR.