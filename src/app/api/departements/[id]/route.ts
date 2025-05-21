import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Récupérer un département par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from('Departement')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

// PUT - Mettre à jour un département
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const updateData = await request.json();
  
  const { data, error } = await supabase
    .from('Departement')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE - Supprimer un département
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { error } = await supabase
    .from('Departement')
    .delete()
    .eq('id', params.id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 