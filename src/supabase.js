import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://npwkuvgepmoxrzkpyxxf.supabase.co"
const supabaseAnonKey = "sb_publishable_drvVOFLJthmQbeHpdeeSAw_x4Sj5AdY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);