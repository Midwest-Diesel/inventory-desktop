# Inventory
This application is currently only compatible with windows.

## Installation
- Download the latest zip file from https://github.com/Midwest-Diesel/inventory-desktop/releases
- Create a folder called *MWD* in the C: drive and drag the installer into there
- Launch the installer
- Set the install location *C:\MWD* when prompted during the installation process

## Getting Started
- `git clone git@github.com:Midwest-Diesel/inventory-desktop.git`
- `npm install`
- Create *.env.production* and *.env.development* files
- Create a *publish.sh* file
- Run the following commands:
  - `chmod +x publish.sh`
  - `npm run tauri dev`
  - In a new terminal `npm run dev:test`

## Publish Changes
- Change version inside of *src-tauri/tauri.conf.json*
- `npm run publish`
- Commit and push

Sometimes it can take 5 min for the update to propagate to production, if you push multiple updates in close proximity.

## Testing
Make sure you run `npm run dev:test` to host the test client.
- `npm run test` Run all tests
- `npm run test:unit` Run unit tests
- `npm run test:integration` Run integration tests
- `npm run test:e2e` Run E2E tests in the CLI
- `npm run test:e2e:spec` Run specific E2E tests in the CLI (Ex: `npm run test:e2e:spec -- handwrittens`)
- `npm run test:e2e:ui` Run E2E tests in the playwright UI

## Other Things

### SCSS Bundling
`globals.scss` is importing the rest of the scss files from `./bundle.scss`. That file is updated by some scripts in the root directory, and runs whenever a scss file changes. Whenever you create/remove a scss file inside the styles directory, it will automatically create/remove an import statement inside the `bundle.scss` file.
