import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mdmmrtcoljztrrcezkyx.supabase.co'
const supabaseAnonKey = 'sb_publishable_gV5IHOerYl-K7cUu6wsGeA_oHUL0ZHY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
