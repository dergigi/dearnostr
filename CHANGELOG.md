# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2024

### Added
- Initial Dear Nostr MVP with authentication, posting, and feed
- `/feed` route for testing
- Debug logs to Feed component
- `t` tag for hashtag without including it in post body
- nostr.band to default relays
- README with setup instructions

### Changed
- Updated Dear Nostr prefix to include comma and newline

### Fixed
- Configured Next.js to allow images from robohash.org
- Resolved infinite loading spinner on feed page
- Fixed hashtag filter to use lowercase to match post tags
- Removed duplicate Window.nostr type declaration
- Only show feed after successful post
- Corrected parameter order for pool.publish
- Prevented prefix deletion and fixed backspace bug in PostForm
- Removed pool.add() call - RelayPool creates relays lazily via pool.relay()
- Used official npm applesauce packages instead of local file references

### Refactored
- Removed headlines from main page

### Changed (Development)
- Set up ESLint and fixed linting issues
- Added cursor rules from boris project

