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

## [0.0.2] - 2024

### Added
- Padlock unlock animation to login button
- Vercel deployment configuration

### Changed
- Textarea styled to look like diary page
- Post button replaced with Sign button

### Fixed
- Padlock shackle rotation around correct attachment point
- Extension detection to handle async extension loading
- TypeScript definitions for window.nostr
- Added required error and not-found components for Next.js

### Refactored
- Simplified extension detection logic

### Changed (Development)
- Excluded applesauce directory from build processes and git

## [0.0.3] - 2024

### Added
- Visual character indicators with border and progress circle
- Progressive opacity to progress circle
- Animated transformation when character limit reached
- Button disabled when over 420 characters

### Fixed
- Progress circle shows only when above 60 characters
- Full opacity reached at 210 characters instead of 420
- Removed unnecessary transform-origin from SVG circle

## [0.0.4] - 2024

### Added
- Favicon and icon assets
- OpenGraph metadata with social preview image
- Twitter card metadata

### Changed
- Updated metadata description to include #DearNostr hashtag

## [0.0.5] - 2024

### Added
- Avatar in note detail view is now clickable to open note on nostr.eu

### Changed
- Updated metadata description to 'A public diary for yourself and others.'

