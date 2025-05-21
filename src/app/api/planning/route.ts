import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Récupérer toutes les séances de planning
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Récupération des données de planning avec toutes les relations
    const { data, error } = await supabase
      .from('planning')
      .select(`
        *,
        intervention(*),
        salle(*)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération du planning:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle séance de planning
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const newPlanning = await request.json();
    
    // Validation basique
    if (!newPlanning.intervention_id || !newPlanning.salle_id || !newPlanning.date || 
        !newPlanning.debut || !newPlanning.fin) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }
    
    // Vérifier les conflits de salle
    const { data: salleConflicts, error: salleError } = await supabase
      .from('planning')
      .select('*')
      .eq('salle_id', newPlanning.salle_id)
      .eq('date', newPlanning.date)
      .or(`debut.lte.${newPlanning.fin},fin.gte.${newPlanning.debut}`);
    
    if (salleError) {
      console.error('Erreur lors de la vérification des conflits de salle:', salleError);
      return NextResponse.json({ error: salleError.message }, { status: 500 });
    }
    
    if (salleConflicts && salleConflicts.length > 0) {
      return NextResponse.json(
        { error: "La salle est déjà occupée sur ce créneau horaire" }, 
        { status: 400 }
      );
    }
    
    // Vérifier les conflits d'enseignant
    const { data: interventionData, error: interventionError } = await supabase
      .from('intervention')
      .select('enseignant_id')
      .eq('id', newPlanning.intervention_id)
      .single();
    
    if (interventionError) {
      console.error('Erreur lors de la récupération de l\'intervention:', interventionError);
      return NextResponse.json({ error: interventionError.message }, { status: 500 });
    }
    
    const { data: enseignantConflicts, error: enseignantError } = await supabase
      .from('planning')
      .select('*, intervention!inner(enseignant_id)')
      .eq('date', newPlanning.date)
      .eq('intervention.enseignant_id', interventionData.enseignant_id)
      .or(`debut.lte.${newPlanning.fin},fin.gte.${newPlanning.debut}`);
    
    if (enseignantError) {
      console.error('Erreur lors de la vérification des conflits d\'enseignant:', enseignantError);
      return NextResponse.json({ error: enseignantError.message }, { status: 500 });
    }
    
    if (enseignantConflicts && enseignantConflicts.length > 0) {
      return NextResponse.json(
        { error: "L'enseignant est déjà occupé sur ce créneau horaire" }, 
        { status: 400 }
      );
    }
    
    // Créer la séance de planning
    const { data, error } = await supabase
      .from('planning')
      .insert(newPlanning)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de la séance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' },
      { status: 500 }
    );
  }
} 