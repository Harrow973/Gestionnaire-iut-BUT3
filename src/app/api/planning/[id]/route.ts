import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Récupérer une séance de planning par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data, error } = await supabase
    .from('Planning')
    .select(`
      *,
      salle:Salle(id, nom),
      intervention:Intervention(
        id,
        heures_attribuees,
        enseignant:Enseignant(id, nom, prenom),
        allocation_horaire:AllocationHoraire(
          id,
          nb_heures,
          type_cours:TypeCours(id, nom),
          cours:Cours(id, code, intitule)
        ),
        groupe:Groupe(id, nom, type)
      )
    `)
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

// PUT - Mettre à jour une séance de planning
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const updateData = await request.json();
  
  // Si la date, l'heure ou la salle changent, vérifier les conflits
  if (updateData.date || updateData.heure_debut || updateData.heure_fin || updateData.salle_id) {
    // Récupérer les données actuelles
    const { data: currentPlanning, error: currentError } = await supabase
      .from('Planning')
      .select('date, heure_debut, heure_fin, salle_id, intervention_id')
      .eq('id', params.id)
      .single();
    
    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 });
    }
    
    const planningCheck = {
      date: updateData.date || currentPlanning.date,
      heure_debut: updateData.heure_debut || currentPlanning.heure_debut,
      heure_fin: updateData.heure_fin || currentPlanning.heure_fin,
      salle_id: updateData.salle_id || currentPlanning.salle_id,
      intervention_id: currentPlanning.intervention_id
    };
    
    // Vérifier les conflits de salle
    const { data: salleConflicts, error: salleError } = await supabase
      .from('Planning')
      .select('*')
      .eq('salle_id', planningCheck.salle_id)
      .eq('date', planningCheck.date)
      .neq('id', params.id)
      .or(`heure_debut.lte.${planningCheck.heure_fin},heure_fin.gte.${planningCheck.heure_debut}`);
    
    if (salleError) {
      return NextResponse.json({ error: salleError.message }, { status: 500 });
    }
    
    if (salleConflicts && salleConflicts.length > 0) {
      return NextResponse.json(
        { error: "La salle est déjà occupée sur ce créneau horaire" }, 
        { status: 400 }
      );
    }
    
    // Vérifier les conflits d'enseignant
    const { data: interventionData } = await supabase
      .from('Intervention')
      .select('enseignant_id')
      .eq('id', currentPlanning.intervention_id)
      .single();
    
    const { data: enseignantConflicts, error: enseignantError } = await supabase
      .from('Planning')
      .select('*, intervention:Intervention(enseignant_id)')
      .eq('date', planningCheck.date)
      .eq('intervention.enseignant_id', interventionData.enseignant_id)
      .neq('id', params.id)
      .or(`heure_debut.lte.${planningCheck.heure_fin},heure_fin.gte.${planningCheck.heure_debut}`);
    
    if (enseignantError) {
      return NextResponse.json({ error: enseignantError.message }, { status: 500 });
    }
    
    if (enseignantConflicts && enseignantConflicts.length > 0) {
      return NextResponse.json(
        { error: "L'enseignant est déjà occupé sur ce créneau horaire" }, 
        { status: 400 }
      );
    }
  }
  
  // Mettre à jour la séance de planning
  const { data, error } = await supabase
    .from('Planning')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE - Supprimer une séance de planning
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { error } = await supabase
    .from('Planning')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 