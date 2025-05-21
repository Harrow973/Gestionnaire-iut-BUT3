import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('allocation_horaire')
      .select(`
        *,
        cours (id, nom),
        type_cours (id, nom)
      `)
      .order('id');

    if (error) {
      console.error('Error fetching time allocations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des allocations horaires' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('allocation_horaire')
      .insert([
        { 
          cours_id: body.cours_id,
          type_cours_id: body.type_cours_id,
          nb_heures: body.nb_heures
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating time allocation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'allocation horaire' },
      { status: 500 }
    );
  }
}