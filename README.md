# Inventory
This application is currently only compatible with windows.

## Installation
- Download the latest zip file from https://github.com/Midwest-Diesel/inventory-desktop/releases
- Create a folder called *MWD* in the C: drive and drag the installer into there
- Launch the installer
- Set the install location *C:\MWD* when prompted during the installation process

# Development

## Getting Started
- `git clone git@github.com:Midwest-Diesel/inventory-desktop.git`
- `npm install`
- Create *.env.production* and *.env.development* files
- Create *publish.sh* and *publish.staging.sh* files
- Run the following commands:
  - `chmod +x publish.sh`
  - `chmod +x publish.staging.sh`
  - `npm run tauri dev`
  - In a new terminal `npm run dev:test`

## Publish Changes
- Publish to staging:
  - Change version inside of *src-tauri/tauri.staging.conf.json*
  - `npm run publish:staging`
  - Commit and push
- Publish to production:
  - Change version inside of *src-tauri/tauri.conf.json*
  - `npm run publish`
  - Commit and push

Sometimes it can take around 5 min for the update to propagate.

## Linting
- `npm run lint` Run all linters
- `npm run lint:ts` Run eslint
- `npm run lint:scss` Run stylelint

## Testing
Make sure you run `npm run dev:test` to host the test client.
- `npm run test` Run all tests
- `npm run test:unit` Run unit tests
- `npm run test:integration` Run integration tests
- `npm run test:integration:spec` Run specific integration tests *(Ex: `npm run test:integration:spec -- handwrittens`)*
- `npm run test:e2e` Run E2E tests in the CLI
- `npm run test:e2e:spec` Run specific E2E tests in the CLI
- `npm run test:e2e:ui` Run E2E tests in the playwright UI

When running either integration or E2E tests, a new Docker container will start up for the test DB.
You can edit the initial data being inserted into the DB by modifying the `/src/tests/db/init.sql` file.
The DB schema is not automatically synced with prod. You will have to run `npm run db:reset:test` on the server whenever you make a change to the DB schema in prod.

## SCSS Bundling

Any time you make a change to the file system under `src/styles`, it will automatically update the bundle.scss file. This behavior can be configured in the scss-bundling.config.json file located in root.
