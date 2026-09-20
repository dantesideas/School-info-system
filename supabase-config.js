// js/supabase-config.js

import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL =
  "https://aqrdzpvxfkatqwbfnbor.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_5tdz7OcEe_XXKa-yhSe3zw_v7FDw0ON";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);