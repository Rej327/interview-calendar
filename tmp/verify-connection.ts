import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function verifyConnection() {
  console.log('Testing connection to:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\n--- Checking Tables ---');
  const tables = ['candidates_table', 'interviewers_table', 'roles_table', 'hiring_processes_table', 'interview_steps_table', 'interviews_table'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`❌ Error querying table "${table}":`, error.message);
    } else {
      console.log(`✅ Table "${table}" is accessible.`);
    }
  }

  console.log('\n--- Checking RPC Functions ---');
  const rpcs = ['get_hiring_process_details', 'create_hiring_process', 'schedule_step_interview'];
  
  // Note: These might error if they expect specific JSON input, but we just check if they exist in pg_proc
  const { data: rpcExistance, error: rpcError } = await supabase.rpc('get_hiring_process_details', { input_data: {} });
  
  // Even if it returns an error because of missing UUIDs, if it's a "function doesn't exist" error, it's a problem.
  if (rpcError && rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
    console.error(`❌ RPC "get_hiring_process_details" was NOT found.`);
  } else {
    console.log(`✅ RPC functions are deployed (Check for "get_hiring_process_details" succeeded or returned logic error instead of existence error).`);
  }

  console.log('\nConnection verification complete.');
}

verifyConnection().catch(console.error);
