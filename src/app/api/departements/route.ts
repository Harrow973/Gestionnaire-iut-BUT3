import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/departements
 * Récupère tous les départements
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('departement')
      .select('*')
      .order('nom');
    
    if (error) {
      console.error('Erreur lors de la récupération des départements:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des départements' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exception lors de la récupération des départements:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

/**
 * POST /api/departements
 * Crée un nouveau département
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation des données requises
    if (!body.nom || !body.code) {
      return NextResponse.json({ error: 'Le nom et le code du département sont requis' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('departement')
      .insert([{
        nom: body.nom,
        code: body.code,
        description: body.description || null
      }])
      .select();
    
    if (error) {
      console.error('Erreur lors de la création du département:', error);
      return NextResponse.json({ error: 'Erreur lors de la création du département' }, { status: 500 });
    }
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Exception lors de la création du département:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
} 