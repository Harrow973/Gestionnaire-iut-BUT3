import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Générer un rapport de répartition des heures
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departementId = searchParams.get('departement_id');
    const parcoursId = searchParams.get('parcours_id');
    const anneeUniversitaire = searchParams.get('annee_universitaire');
    
    if (!anneeUniversitaire) {
      return NextResponse.json(
        { error: "L'année universitaire est requise" }, 
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Récupérer les départements concernés en utilisant le nom de table en snake_case
    let departementsQuery = supabase.from('departement').select('id, nom');
    if (departementId) {
      departementsQuery = departementsQuery.eq('id', departementId);
    }
    
    const { data: departements, error: deptError } = await departementsQuery;
    
    if (deptError) {
      console.error('Erreur lors de la récupération des départements:', deptError);
      return NextResponse.json({ error: deptError.message }, { status: 500 });
    }
    
    // Pour chaque département, récupérer les parcours
    const resultats = [];
    
    for (const departement of departements) {
      let parcoursQuery = supabase
        .from('parcours')
        .select('id, nom')
        .eq('departement_id', departement.id);
      
      if (parcoursId) {
        parcoursQuery = parcoursQuery.eq('id', parcoursId);
      }
      
      const { data: parcours, error: parcoursError } = await parcoursQuery;
      
      if (parcoursError) {
        console.error('Erreur lors de la récupération des parcours:', parcoursError);
        return NextResponse.json({ error: parcoursError.message }, { status: 500 });
      }
      
      // Pour chaque parcours, récupérer les maquettes
      const parcoursResultats = [];
      
      for (const p of parcours) {
        const { data: maquettes, error: maquettesError } = await supabase
          .from('maquette_pedagogique')
          .select('id, nom')
          .eq('parcours_id', p.id)
          .eq('annee', anneeUniversitaire);
        
        if (maquettesError) {
          console.error('Erreur lors de la récupération des maquettes:', maquettesError);
          return NextResponse.json({ error: maquettesError.message }, { status: 500 });
        }
        
        // Pour chaque maquette, récupérer les cours et leurs allocations
        const maquettesResultats = [];
        
        for (const m of maquettes) {
          const { data: cours, error: coursError } = await supabase
            .from('cours')
            .select(`
              id, 
              code, 
              nom,
              allocations:allocation_horaire(
                id,
                nb_heures,
                nb_groupes,
                type:type_cours_id(id, nom),
                interventions:intervention(
                  id,
                  heures,
                  enseignant:enseignant_id(id, nom, prenom)
                )
              )
            `)
            .eq('maquette_pedagogique_id', m.id);
          
          if (coursError) {
            console.error('Erreur lors de la récupération des cours:', coursError);
            return NextResponse.json({ error: coursError.message }, { status: 500 });
          }
          
          // Calculer les statistiques pour cette maquette
          const coursResultats = cours.map((c) => {
            // Pour chaque cours, calculer les heures totales, attribuées et restantes
            const allocationsStats = c.allocations.map((a: any) => {
              const heuresTheorique = a.nb_heures * a.nb_groupes;
              const heuresAttribuees = a.interventions.reduce(
                (sum: number, i: any) => sum + i.heures, 
                0
              );
              
              return {
                type: a.type.nom,
                heures_theorique: heuresTheorique,
                heures_attribuees: heuresAttribuees,
                heures_restantes: heuresTheorique - heuresAttribuees,
                enseignants: a.interventions.map((i: any) => ({
                  id: i.enseignant.id,
                  nom: i.enseignant.nom,
                  prenom: i.enseignant.prenom,
                  heures: i.heures
                }))
              };
            });
            
            return {
              id: c.id,
              code: c.code,
              intitule: c.nom,
              allocations: allocationsStats
            };
          });
          
          maquettesResultats.push({
            id: m.id,
            nom: m.nom,
            cours: coursResultats
          });
        }
        
        parcoursResultats.push({
          id: p.id,
          nom: p.nom,
          maquettes: maquettesResultats
        });
      }
      
      resultats.push({
        id: departement.id,
        nom: departement.nom,
        parcours: parcoursResultats
      });
    }
    
    return NextResponse.json(resultats);
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' },
      { status: 500 }
    );
  }
} 