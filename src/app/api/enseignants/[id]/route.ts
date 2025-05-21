import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/enseignants/[id]
 * Récupère les détails d'un enseignant spécifique
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    
    // Récupérer l'enseignant avec ses relations
    const { data, error } = await supabase
      .from('enseignant')
      .select(`
        *,
        departement:departement_id(*),
        enseignant_statut(
          *,
          statut:statut_id(*)
        ),
        intervention(
          *,
          cours(
            *,
            maquette_pedagogique(*),
            type_cours(*)
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération de l'enseignant ${id}:`, error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Enseignant non trouvé' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Erreur lors de la récupération de l\'enseignant' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exception lors de la récupération de l\'enseignant:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

/**
 * PUT /api/enseignants/[id]
 * Mettre à jour un enseignant
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Vérifier les champs obligatoires
    if (!body.nom || !body.prenom || !body.email || !body.departement_id) {
      return NextResponse.json({
        error: 'Le nom, prénom, email et département sont requis'
      }, { status: 400 });
    }
    
    // Mise à jour de l'enseignant
    const { data, error } = await supabase
      .from('enseignant')
      .update({
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        departement_id: body.departement_id
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Erreur lors de la mise à jour de l'enseignant ${id}:`, error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'enseignant' }, { status: 500 });
    }
    
    // Mise à jour du statut si fourni
    if (body.statut_id) {
      // Vérifier s'il existe déjà un statut actif
      const { data: existingStatut, error: findError } = await supabase
        .from('enseignant_statut')
        .select('*')
        .eq('enseignant_id', id)
        .is('date_fin', null)
        .single();
      
      if (findError && findError.code !== 'PGRST116') {
        console.error(`Erreur lors de la recherche du statut pour l'enseignant ${id}:`, findError);
      }
      
      if (existingStatut) {
        // Si le statut est différent, fermer l'ancien et en créer un nouveau
        if (existingStatut.statut_id !== body.statut_id) {
          // Fermer le statut existant
          await supabase
            .from('enseignant_statut')
            .update({ date_fin: new Date().toISOString().split('T')[0] })
            .eq('id', existingStatut.id);
          
          // Créer un nouveau statut
          await supabase
            .from('enseignant_statut')
            .insert({
              enseignant_id: id,
              statut_id: body.statut_id,
              date_debut: new Date().toISOString().split('T')[0]
            });
        }
      } else {
        // Créer un nouveau statut
        await supabase
          .from('enseignant_statut')
          .insert({
            enseignant_id: id,
            statut_id: body.statut_id,
            date_debut: new Date().toISOString().split('T')[0]
          });
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Exception lors de la mise à jour de l\'enseignant:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

/**
 * DELETE /api/enseignants/[id]
 * Supprimer un enseignant
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = params.id;
    
    // Supprimer l'enseignant
    const { error } = await supabase
      .from('enseignant')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erreur lors de la suppression de l'enseignant ${id}:`, error);
      
      if (error.code === '23503') {
        return NextResponse.json({ 
          error: 'Impossible de supprimer cet enseignant car il est référencé par d\'autres données'
        }, { status: 409 });
      }
      
      return NextResponse.json({ error: 'Erreur lors de la suppression de l\'enseignant' }, { status: 500 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Exception lors de la suppression de l\'enseignant:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
} 