# Changelog

## [1.0.1] - 2025-06-18
### Fixed
- Suppress noisy Permissions-Policy `interest-cohort` warning (documented, confirmed external).
- Resolved 403/410 fetch errors via reliable audio extraction helper using credentialed fetch and exponential backoff.
- Eliminated worker listener timing warning by ensuring top-level event registration.
- Enhanced user-facing error messages with friendly mapping and collapsible details.

### Added
- Toast notifications for unrecoverable errors.
- Unit tests for `getPlayableAudioBlob` and `showError` mapping.
- Puppeteer regression test ensuring clean console (no 403/410) when playing voice note.

### Changed
- Bumped extension version to 1.0.1 in `manifest.json`. 