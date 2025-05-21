import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Erreur: Les variables d\'environnement Supabase ne sont pas définies.');
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 