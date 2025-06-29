const { Client } = require("pg");
const fs = require("fs");

// Replace with your actual Supabase DB credentials
const client = new Client({
  host: "db.kfstdqxwmabfvpahdmmj.supabase.co",
  port: 5432,
  user: "postgres",
  password: "Vinay@supa1",
  database: "postgres",
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

async function runSchema() {
  try {
    await client.connect();
    console.log("Connected to Supabase DB.");

    const schema = fs.readFileSync("Schema.sql", "utf8");
    await client.query(schema);

    console.log("Schema executed successfully.");
  } catch (err) {
    console.error("Error running schema:", err);
  } finally {
    await client.end();
  }
}

runSchema();
