import pkg from 'pg';
const { Client } = pkg;
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'elearn',
  password: 'admin',
  port: 5433,
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT user_id, name, xp FROM users LIMIT 5');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();
