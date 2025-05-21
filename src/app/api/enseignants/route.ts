import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/enseignants
 * Récupère tous les enseignants
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departementId = searchParams.get('departement_id');
    
    let query = supabase
      .from('enseignant')
      .select(`
        *,
        departement:departement_id(id, nom, code),
        enseignant_statut(
          statut:statut_id(id, nom, heures_min, heures_max)
        )
      `)
      .order('nom');
    
    // Filtrer par département si spécifié
    if (departementId) {
      query = query.eq('departement_id', departementId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des enseignants' }, { status: 500 });
    }
    
    // Transformer les données pour obtenir un format plus propre
    const formattedData = data.map(enseignant => {
      const statut = enseignant.enseignant_statut?.[0]?.statut || null;
      const { enseignant_statut, ...rest } = enseignant;
      
      return {
        ...rest,
        statut
      };
    });
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Exception lors de la récupération des enseignants:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

/**
 * POST /api/enseignants
 * Crée un nouvel enseignant
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation des données requises
    if (!body.nom || !body.prenom || !body.email || !body.departement_id) {
      return NextResponse.json({
        error: 'Le nom, prénom, email et département sont requis'
      }, { status: 400 });
    }
    
    // 1. Insérer l'enseignant
    const { data: enseignantData, error: enseignantError } = await supabase
      .from('enseignant')
      .insert({
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        departement_id: body.departement_id
      })
      .select()
      .single();
    
    if (enseignantError) {
      console.error('Erreur lors de la création de l\'enseignant:', enseignantError);
      return NextResponse.json({ error: 'Erreur lors de la création de l\'enseignant' }, { status: 500 });
    }
    
    // 2. Si un statut est fourni, créer le lien enseignant-statut
    if (body.statut_id) {
      const { error: statutError } = await supabase
        .from('enseignant_statut')
        .insert({
          enseignant_id: enseignantData.id,
          statut_id: body.statut_id,
          date_debut: new Date().toISOString().split('T')[0]
        });
      
      if (statutError) {
        console.error('Erreur lors de l\'association du statut:', statutError);
        // On continue même si l'association a échoué, l'enseignant a été créé
      }
    }
    
    return NextResponse.json(enseignantData, { status: 201 });
  } catch (error) {
    console.error('Exception lors de la création de l\'enseignant:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
} 