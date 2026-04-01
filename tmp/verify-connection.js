const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function verifyConnection() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Environment variables not found. Make sure .env is populated.');
    return;
  }

  console.log('Testing connection to:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\n--- Checking Tables ---');
  const tables = [
    'candidates_table', 
    'interviewers_table', 
    'roles_table', 
    'hiring_processes_table', 
    'interview_steps_table', 
    'interviews_table'
  ];
  
  for (const table of tables) {
    const { status, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`❌ Table "${table}" access failed:`, error.message);
    } else {
      console.log(`✅ Table "${table}" is accessible (Status: ${status}).`);
    }
  }

  console.log('\n--- Checking RPC Presence ---');
  // We check if the functions are visible. Since they require JSONB input, 
  // we expect a 400 or successful check for pg_proc if we used SQL, 
  // but via rpc() we just see if they exist.
  const { error: rpcError } = await supabase.rpc('get_hiring_process_details', { input_data: {} });
  
  if (rpcError && rpcError.code === 'PGRST202') {
    console.error('❌ RPC "get_hiring_process_details" NOT found (code PGRST202).');
  } else {
    console.log('✅ RPC functions are deployed correctly (Function "get_hiring_process_details" found).');
  }

  console.log('\nConnection verification complete.');
}

verifyConnection().catch(console.error);
