const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

let supabaseUrl = '';
let supabaseAnonKey = '';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = value;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseAnonKey = value;
    }
  }
} catch (e) {
  console.error("Could not read .env.local file:", e.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: node create-admin.js <email> <password>");
  process.exit(1);
}

async function createAdmin() {
  console.log(`Registering admin email: ${email}`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("\nSuccess!");
    console.log("Admin account created in Supabase Auth.");
    console.log("User email:", data.user?.email);
    console.log("\nPlease confirm your email address in Supabase Auth console if email confirmation is enabled, or disable email confirmation in your Supabase Auth provider settings.");
  }
}

createAdmin();
