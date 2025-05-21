import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier les tables principales avec les noms exacts en snake_case
    const tables = [
      'departement',
      'parcours',
      'statut_enseignant',
      'enseignant',
      'enseignant_statut',
      'maquette_pedagogique',
      'cours',
      'type_cours',
      'allocation_horaire',
      'groupe',
      'intervention',
      'salle',
      'planning',
      'historique_intervention'
    ];
    
    // Tester chaque table
    const results = await Promise.all(
      tables.map(async (tableName) => {
        try {
          // Requête simplifiée qui vérifie juste si la table existe
          const { error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);
          
          // Récupérer le nombre d'enregistrements si la table existe
          let count = 0;
          if (!error) {
            const { data: countData } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
            
            count = countData?.length || 0;
          }
            
          return {
            tableName,
            exists: !error,
            count,
            error: error ? error.message : null
          };
        } catch (e) {
          return {
            tableName,
            exists: false,
            count: 0,
            error: e instanceof Error ? e.message : `Table ${tableName} non accessible`
          };
        }
      })
    );
    
    // Vérifier si au moins une table existe
    const hasExistingTables = results.some(result => result.exists);
    
    if (!hasExistingTables) {
      return NextResponse.json({ 
        connected: true,
        message: 'Connexion à Supabase réussie, mais aucune table trouvée',
        suggestion: 'Assurez-vous de créer les tables en exécutant le script SQL fourni.',
        tablesStatus: results
      });
    }
    
    // Connexion réussie et certaines tables trouvées
    return NextResponse.json({ 
      connected: true,
      message: 'Connexion à Supabase réussie!',
      tablesStatus: results,
      availableTables: results.filter(r => r.exists).map(r => r.tableName)
    });
    
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return NextResponse.json({ 
      connected: false, 
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    }, { status: 500 });
  }
} 