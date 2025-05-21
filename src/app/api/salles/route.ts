import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('salle')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des salles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('salle')
      .insert([
        { 
          nom: body.nom,
          capacite: body.capacite,
          type: body.type,
          batiment: body.batiment
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la salle' },
      { status: 500 }
    );
  }
} 