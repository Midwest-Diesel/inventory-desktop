import { execSync } from 'child_process';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import { resetDb } from './resetDatabase';
dotenv.config({
  path: '.env.development'
});


const isContainerRunning = (): boolean => {
  try {
    const output = execSync('docker ps --filter "name=inventory-tests" --filter "status=running" -q');
    return output.toString().trim().length > 0;
  } catch {
    return false;
  }
};

const waitForPostgres = async ({ host = '', port = 0, user = '', password = '', database = '', timeoutMs = 15000, intervalMs = 500 }) => {
  const start = Date.now();
  // eslint-disable-next-line
  while (true) {
    try {
      const client = new pg.Client({ host, port, user, password, database });
      await client.connect();
      await client.end();
      return;
    } catch (error) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Postgres did not become ready in time: ${error}`);
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
};


export default async function globalSetup() {
  console.log('> Ensuring test DB container is running...');

  if (!isContainerRunning()) {
    execSync('docker-compose -p inventory-tests -f docker-compose.test.yml up -d', { stdio: 'inherit' });
  } else {
    console.log('> Container already running');
  }

  console.log('> Waiting for test DB to be ready...');
  const connection = {
    host: '127.0.0.1',
    port: 54329,
    user: 'postgres',
    password: 'postgres',
    database: 'inventory_testing'
  };
  await waitForPostgres(connection);
  const testClient = new pg.Client(connection);
  await testClient.connect();

  const knownTable = 'users';
  const { rows } = await testClient.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = $1
    ) AS has_table;
  `, [knownTable]);

  const schemaPath = './src/tests/db/schema.sql';
  const dataPath = './src/tests/db/data.sql';
  if (!rows[0]?.has_table) {
    console.log('> Schema not found, dumping schema...');

    execSync(
      `pg_dump --schema-only --no-comments --schema=public --no-owner --no-privileges --dbname="${process.env.DB_CONNECTION_STRING}" > ${schemaPath}`,
      { stdio: 'inherit', env: process.env }
    );

    console.log('> Schema loaded');
    console.log('> Dumping data...');

    const devClient = new pg.Client({
      connectionString: process.env.DB_CONNECTION_STRING
    });
    await devClient.connect();

    const { rows: tables } = await devClient.query(`
      SELECT relname AS table_name
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND relname NOT LIKE 'tmp_%';
    `);
    
    const viewNames: string[] = [];
    const excludedTables = [
      'key',
      'instances',
      'flow_state',
      'buckets',
      'audit_log_entries',
      'schema_migrations',
      'iceberg_tables',
      'vector_indexes',
      'migrations',
      'mfa_challenges',
      'hooks',
      'secrets',
      'one_time_tokens',
      'tenants',
      'iceberg_namespaces',
      'oauth_authorizations',
      'mfa_amr_claims',
      's3_multipart_uploads',
      'oauth_clients',
      's3_multipart_uploads_parts',
      'subscription',
      'http_request_queue',
      'saml_providers',
      'buckets_analytics',
      'extensions',
      '_http_response',
      'buckets_vectors',
      'sso_providers',
      'sso_domains',
      'objects',
      'oauth_consents',
      'identities',
      'saml_relay_states',
      'mfa_factors',
      'seed_files',
      'prefixes',
      'refresh_tokens',
      'sessions',
      'messages',
      'tabs'
    ];
    for (const { table_name } of tables) {
      if (table_name.startsWith('tmp_') || excludedTables.includes(table_name) || table_name.includes('messages_')) continue;
      const viewName = `tmp_${table_name}`;
      viewNames.push(viewName);

      const { rows: cols } = await devClient.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name <> 'id'
        ORDER BY ordinal_position
      `, [table_name]);
      if (cols.length === 0) continue;

      const { rows: idCol } = await devClient.query(`
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = 'id'
        LIMIT 1
      `, [table_name]);
      const hasId = idCol.length > 0;
      const orderBy = hasId ? `"id"` : `ctid`;

      const columnList = cols.map((c) => `"${c.column_name}"`).join(', ');
      await devClient.query(`DROP TABLE IF EXISTS "${viewName}" CASCADE;`);
      await devClient.query(`
        CREATE UNLOGGED TABLE "${viewName}" AS
        SELECT ${columnList}
        FROM "${table_name}"
        ORDER BY ${orderBy}
        LIMIT 100;
      `);
    }

    const tableArgs = viewNames.map((v) => `-t \\"${v}\\"`).join(' ');
    execSync(
      `pg_dump --data-only --schema=public --no-owner --no-privileges --disable-triggers --column-inserts ${tableArgs} --dbname="${process.env.DB_CONNECTION_STRING}" > ${dataPath}`,
      { stdio: 'inherit', env: process.env }
    );

    for (const viewName of viewNames) {
      await devClient.query(`DROP TABLE IF EXISTS "${viewName}" CASCADE`);
    }
    await devClient.end();
    
    console.log('> Data loaded');

    // Remove Supabase specific lines
    let schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    let dataSql = fs.readFileSync(dataPath, 'utf-8');
    schemaSql = schemaSql
      .split('\n')
      .filter((line) => !line.startsWith('\\restrict') && !line.startsWith('\\unrestrict') && !line.startsWith('SET transaction_timeout'))
      .join('\n')
      .replace('CREATE SCHEMA public', 'CREATE SCHEMA IF NOT EXISTS public')
      .replace(/SET TIME ZONE '.*?';/g, `SET TIME ZONE 'UTC';`)
      .replace(/GMT[+-]\d{4} \(.*?\)/g, '');

    dataSql = dataSql
      .split('\n')
      .filter((line) => !line.startsWith('\\restrict') && !line.startsWith('\\unrestrict') && !line.startsWith('SET transaction_timeout'))
      .join('\n')
      .replace('CREATE SCHEMA public', 'CREATE SCHEMA IF NOT EXISTS public')
      .replace(/SET TIME ZONE '.*?';/g, `SET TIME ZONE 'UTC';`)
      .replace(/GMT[+-]\d{4} \(.*?\)/g, '')
      .replace(/tmp_/g, '');

    fs.writeFileSync(schemaPath, schemaSql);
    fs.writeFileSync(dataPath, dataSql);


    const schema = fs.readFileSync('src/tests/db/schema.sql', 'utf-8');
    await testClient.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await testClient.query(`DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
          CREATE ROLE service_role;
        END IF;
      END$$;
    `);
    await testClient.query(schema);
  } else {
    console.log('> Schema already exists, skipping db initialization');
  }


  await testClient.end();
  await resetDb();
  console.log('> Test DB ready');
}
