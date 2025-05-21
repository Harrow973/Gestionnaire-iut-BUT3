import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Récupérer un cours par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Récupérer le cours avec ses allocations horaires et ses groupes
  const { data, error } = await supabase
    .from('Cours')
    .select(`
      *,
      maquette:MaquettePedagogique(
        id, 
        nom,
        parcours:Parcours(
          id,
          nom,
          departement:Departement(id, nom)
        )
      ),
      allocations:AllocationHoraire(
        id,
        nb_heures,
        nb_groupes,
        type_cours:TypeCours(id, nom),
        groupes:Groupe(
          id,
          nom,
          type
        )
      )
    `)
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

// PUT - Mettre à jour un cours
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { cours, allocations } = await request.json();
  
  // Mettre à jour le cours
  const { data, error } = await supabase
    .from('Cours')
    .update({ 
      ...cours, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', params.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Si des allocations sont fournies, les mettre à jour ou en créer de nouvelles
  if (allocations) {
    for (const allocation of allocations) {
      if (allocation.id) {
        // Mettre à jour l'allocation existante
        const { error: updateError } = await supabase
          .from('AllocationHoraire')
          .update({ 
            nb_heures: allocation.nb_heures,
            nb_groupes: allocation.nb_groupes,
            updated_at: new Date().toISOString()
          })
          .eq('id', allocation.id);
        
        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      } else {
        // Créer une nouvelle allocation
        const { error: insertError } = await supabase
          .from('AllocationHoraire')
          .insert({
            ...allocation,
            cours_id: params.id
          });
        
        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
      }
    }
  }
  
  return NextResponse.json(data);
}

// DELETE - Supprimer un cours
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Vérifier si des interventions sont associées à ce cours
  const { data: allocations } = await supabase
    .from('AllocationHoraire')
    .select('id')
    .eq('cours_id', params.id);
  
  if (allocations && allocations.length > 0) {
    // Récupérer les IDs des allocations
    const allocationIds = allocations.map(a => a.id);
    
    // Vérifier s'il y a des interventions liées à ces allocations
    const { data: interventions } = await supabase
      .from('Intervention')
      .select('id')
      .in('allocation_horaire_id', allocationIds);
    
    if (interventions && interventions.length > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer ce cours car des interventions y sont associées" }, 
        { status: 400 }
      );
    }
    
    // Supprimer les groupes liés aux allocations
    await supabase
      .from('Groupe')
      .delete()
      .in('allocation_horaire_id', allocationIds);
    
    // Supprimer les allocations
    await supabase
      .from('AllocationHoraire')
      .delete()
      .eq('cours_id', params.id);
  }
  
  // Supprimer le cours
  const { error } = await supabase
    .from('Cours')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 