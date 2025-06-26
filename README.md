# Inventory
This application is currently only compatible with windows.

## Installation
- Download the zip file from https://github.com/Midwest-Diesel/inventory-desktop/releases
- On the computer, create a folder called *MWD* in the C: drive and drag the installer into there
- Launch the installer
- Set the install location *C:\MWD* when prompted

## Getting Started
- `npm install`
- Create *.env.production* and *.env.development* files
- Create a *publish.sh* file
- Run the following commands:
  - `chmod +x publish.sh`
  - `npm run db:init`
  - `npm run db:start`
  - `npm run tauri dev`

## Publish Changes
- Change version inside of *src-tauri/tauri.conf.json*
- `npm run publish`
- Commit and push

## Testing
Make sure you run `npm run dev:test` to host the test client.
- `npm run test:e2e` Run E2E tests in the CLI
- `npm run test:e2e:ui` Run E2E tests in the playwright UI
- `npm run test:unit` Run unit tests
- `npm run test` Run all tests
