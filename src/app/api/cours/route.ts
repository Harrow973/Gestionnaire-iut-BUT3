import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET - Récupérer tous les cours avec leur maquette et type
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Récupération des cours avec toutes leurs relations
    const { data, error } = await supabase
      .from('cours')
      .select(`
        *,
        maquette:maquette_pedagogique(*),
        type:type_cours(*)
      `)
      .order('nom');
    
    if (error) {
      console.error('Erreur lors de la récupération des cours:', error);
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

// POST - Créer un nouveau cours
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { cours, allocations } = await request.json();
    
    // Validation basique
    if (!cours.code || !cours.nom || !cours.maquette_pedagogique_id || !cours.type_cours_id) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }
    
    // Créer le cours
    const { data, error } = await supabase
      .from('cours')
      .insert(cours)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du cours:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Si des allocations horaires sont fournies, les créer
    if (allocations && allocations.length > 0) {
      const allocationsWithCoursId = allocations.map((allocation: any) => ({
        ...allocation,
        cours_id: data.id
      }));
      
      const { error: allocationsError } = await supabase
        .from('allocation_horaire')
        .insert(allocationsWithCoursId);
      
      if (allocationsError) {
        console.error('Erreur lors de la création des allocations horaires:', allocationsError);
        return NextResponse.json({ error: allocationsError.message }, { status: 500 });
      }
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