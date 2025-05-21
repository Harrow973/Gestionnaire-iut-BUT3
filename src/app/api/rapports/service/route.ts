import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Générer un rapport de service pour un ou tous les enseignants
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enseignantId = searchParams.get('enseignant_id');
    const departementId = searchParams.get('departement_id');
    const anneeUniversitaire = searchParams.get('annee_universitaire');
    
    if (!anneeUniversitaire) {
      return NextResponse.json(
        { error: "L'année universitaire est requise" }, 
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Construire la requête de base en utilisant les noms de tables en snake_case
    let query = supabase
      .from('enseignant')
      .select(`
        id,
        nom,
        prenom,
        departement:departement_id(id, nom),
        statuts:enseignant_statut(
          statut:statut_id(
            id, 
            nom,
            heures_min,
            heures_max
          ),
          date_fin
        ),
        interventions:intervention(
          id,
          heures,
          semestre,
          annee,
          cours:cours_id(
            id,
            code,
            nom,
            type:type_cours_id(id, nom),
            maquette:maquette_pedagogique_id(
              id,
              nom,
              parcours:parcours_id(id, nom)
            )
          )
        )
      `);
    
    // Filtrer par enseignant si spécifié
    if (enseignantId) {
      query = query.eq('id', enseignantId);
    }
    
    // Filtrer par département si spécifié
    if (departementId) {
      query = query.eq('departement_id', departementId);
    }
    
    // Exécuter la requête
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Transformer les données pour le rapport
    const rapport = data.map((enseignant) => {
      // Filtrer les interventions pour l'année universitaire spécifiée
      const interventionsAnnee = enseignant.interventions
        .filter((i: any) => i.annee === anneeUniversitaire);
      
      // Calculer le total des heures
      const totalHeures = interventionsAnnee.reduce(
        (sum: number, i: any) => sum + i.heures, 
        0
      );
      
      // Récupérer le statut actuel (sans date de fin)
      const statutActuel = enseignant.statuts
        .find((s: any) => s.date_fin === null)?.statut || null;
      
      // Regrouper les interventions par type de cours
      const heuresParType = interventionsAnnee.reduce((acc: any, i: any) => {
        const typeNom = i.cours.type.nom;
        if (!acc[typeNom]) {
          acc[typeNom] = 0;
        }
        acc[typeNom] += i.heures;
        return acc;
      }, {});
      
      // Calculer le différentiel par rapport au service statutaire
      let differentiel = 0;
      if (statutActuel) {
        differentiel = totalHeures - statutActuel.heures_min;
      }
      
      return {
        enseignant: {
          id: enseignant.id,
          nom: enseignant.nom,
          prenom: enseignant.prenom,
          departement: enseignant.departement.nom,
        },
        statut: statutActuel ? {
          nom: statutActuel.nom,
          heures_min: statutActuel.heures_min,
          heures_max: statutActuel.heures_max,
        } : null,
        service: {
          total_heures: totalHeures,
          differentiel: differentiel,
          heures_par_type: heuresParType,
        },
        interventions: interventionsAnnee.map((i: any) => ({
          id: i.id,
          heures: i.heures,
          semestre: i.semestre,
          type_cours: i.cours.type.nom,
          cours: {
            code: i.cours.code,
            intitule: i.cours.nom,
          },
          maquette: i.cours.maquette.nom,
          parcours: i.cours.maquette.parcours.nom,
        })),
      };
    });
    
    return NextResponse.json(rapport);
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' },
      { status: 500 }
    );
  }
} 