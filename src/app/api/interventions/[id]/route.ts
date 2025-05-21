import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Récupérer une intervention par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data, error } = await supabase
    .from('Intervention')
    .select(`
      *,
      enseignant:Enseignant(
        id, 
        nom,
        prenom,
        email
      ),
      allocation_horaire:AllocationHoraire(
        id,
        nb_heures,
        type_cours:TypeCours(id, nom),
        cours:Cours(
          id,
          code,
          intitule,
          maquette:MaquettePedagogique(
            id,
            nom,
            parcours:Parcours(
              id,
              nom,
              departement:Departement(id, nom)
            )
          )
        )
      ),
      groupe:Groupe(
        id,
        nom,
        type
      ),
      planning:Planning(
        id,
        date,
        heure_debut,
        heure_fin,
        salle:Salle(id, nom)
      )
    `)
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

// PUT - Mettre à jour une intervention
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const updateData = await request.json();
  
  // Si les heures sont modifiées, vérifier le quota
  if (updateData.heures_attribuees) {
    // Récupérer l'intervention actuelle
    const { data: currentIntervention, error: currentError } = await supabase
      .from('Intervention')
      .select('enseignant_id, heures_attribuees, annee_universitaire')
      .eq('id', params.id)
      .single();
    
    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 });
    }
    
    // Vérifier le statut et les heures max de l'enseignant
    const { data: enseignantData, error: enseignantError } = await supabase
      .from('Enseignant')
      .select(`
        id,
        statuts:EnseignantStatut(
          statut:StatutEnseignant(
            id, 
            nom, 
            heures_max
          )
        )
      `)
      .eq('id', currentIntervention.enseignant_id)
      .is('statuts.date_fin', null)
      .single();
    
    if (enseignantError) {
      return NextResponse.json({ error: enseignantError.message }, { status: 500 });
    }
    
    // Calculer les heures actuelles de l'enseignant (sans cette intervention)
    const { data: heuresData, error: heuresError } = await supabase
      .from('Intervention')
      .select('heures_attribuees')
      .eq('enseignant_id', currentIntervention.enseignant_id)
      .eq('annee_universitaire', currentIntervention.annee_universitaire)
      .neq('id', params.id);
    
    if (heuresError) {
      return NextResponse.json({ error: heuresError.message }, { status: 500 });
    }
    
    const heuresActuelles = heuresData.reduce((sum, item) => sum + item.heures_attribuees, 0);
    const heuresMax = enseignantData.statuts?.[0]?.statut?.heures_max || 0;
    
    // Vérifier si la modification dépasse les heures max
    if (heuresMax > 0 && (heuresActuelles + updateData.heures_attribuees) > heuresMax) {
      return NextResponse.json(
        { 
          error: `Cet enseignant a déjà ${heuresActuelles}h attribuées et ne peut pas dépasser ${heuresMax}h` 
        }, 
        { status: 400 }
      );
    }
  }
  
  // Mettre à jour l'intervention
  const { data, error } = await supabase
    .from('Intervention')
    .update({ 
      ...updateData, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', params.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE - Supprimer une intervention
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Supprimer d'abord les séances de planning associées
  await supabase
    .from('Planning')
    .delete()
    .eq('intervention_id', params.id);
  
  // Ensuite supprimer l'intervention
  const { error } = await supabase
    .from('Intervention')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 