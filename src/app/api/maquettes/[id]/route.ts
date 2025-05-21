import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Récupérer une maquette avec ses cours
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Récupérer la maquette avec ses cours et leurs allocations horaires
  const { data, error } = await supabase
    .from('MaquettePedagogique')
    .select(`
      *,
      parcours:Parcours(
        id, 
        nom,
        departement:Departement(id, nom)
      ),
      cours:Cours(
        id,
        code,
        intitule,
        description,
        allocations:AllocationHoraire(
          id,
          nb_heures,
          nb_groupes,
          type_cours:TypeCours(id, nom)
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

// PUT - Mettre à jour une maquette
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const updateData = await request.json();
  
  const { data, error } = await supabase
    .from('MaquettePedagogique')
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

// DELETE - Supprimer une maquette
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Vérifier si des cours sont associés à cette maquette
  const { data: coursData } = await supabase
    .from('Cours')
    .select('id')
    .eq('maquette_id', params.id);
  
  if (coursData && coursData.length > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer cette maquette car des cours y sont associés" }, 
      { status: 400 }
    );
  }
  
  // Supprimer la maquette
  const { error } = await supabase
    .from('MaquettePedagogique')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 