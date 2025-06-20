# Inventory

This application is currently only compatible with windows.

## Getting Started

- Run `npm i`
- Create *.env.production* and *.env.development* files
- Create a *publish.sh* file
- Run the following commands:
  - `chmod +x publish.sh`
  - `npm run db:init`
  - `npm run db:start`
  - `npm run tauri dev`

## Testing
Make sure you run `npm run dev:test` to host the test client.
- `npm run test:e2e` Run E2E tests in the CLI
- `npm run test:e2e:ui` Run E2E tests in the playwright UI
- `npm run test:unit` Run unit tests
- `npm run test` Run all tests
