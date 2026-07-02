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
const oldPassword = process.argv[3];
const newPassword = process.argv[4] || 'deba2006';

if (!email || !oldPassword) {
  console.log("Usage: node change-password.js <email> <old_password> [new_password]");
  process.exit(1);
}

async function changePassword() {
  console.log(`Attempting to sign in user: ${email}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: oldPassword,
  });

  if (signInError) {
    console.error("Login failed:", signInError.message);
    process.exit(1);
  }

  console.log("Login successful. Updating password...");
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("Failed to update password:", updateError.message);
  } else {
    console.log("\nSuccess!");
    console.log("Password updated successfully.");
    console.log("New password is set to:", newPassword);
  }
}

changePassword();
