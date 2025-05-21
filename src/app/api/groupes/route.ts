import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('groupe')
      .select(`
        *,
        parcours:parcours_id(id, nom),
        maquette:maquette_id(id, nom)
      `)
      .order('id');

    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des groupes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('groupe')
      .insert([
        { 
          nom: body.nom,
          effectif: body.effectif,
          parcours_id: body.parcours_id,
          maquette_id: body.maquette_id
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du groupe' },
      { status: 500 }
    );
  }
} 