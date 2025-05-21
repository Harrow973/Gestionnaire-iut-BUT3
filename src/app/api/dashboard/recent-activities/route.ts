import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { formatRelativeTime } from '@/lib/utils';

/**
 * GET /api/dashboard/recent-activities
 * Récupère les activités récentes pour le dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 5;
    
    // Récupérer l'historique des interventions
    const { data: historyData, error: historyError } = await supabase
      .from('historique_intervention')
      .select(`
        id,
        created_at,
        statut,
        commentaire,
        intervention:intervention_id(
          id,
          cours:cours_id(id, code, nom)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (historyError) {
      console.error('Erreur lors de la récupération de l\'historique:', historyError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des activités récentes' }, { status: 500 });
    }
    
    // Formater les données pour le composant RecentActivities
    const formattedData = historyData.map((item) => {
      let text = '';
      let link = '';
      
      // Déterminer le texte et le lien en fonction du statut
      switch (item.statut.toLowerCase()) {
        case 'créée':
          text = `Nouvelle intervention créée pour ${item.intervention.cours.code}`;
          link = `/interventions/${item.intervention.id}`;
          break;
        case 'modifiée':
          text = `Intervention ${item.intervention.cours.code} modifiée`;
          link = `/interventions/${item.intervention.id}`;
          break;
        case 'annulée':
          text = `Intervention ${item.intervention.cours.code} annulée`;
          link = `/interventions/${item.intervention.id}`;
          break;
        case 'validée':
          text = `Intervention ${item.intervention.cours.code} validée`;
          link = `/interventions/${item.intervention.id}`;
          break;
        default:
          text = item.commentaire || `Activité sur ${item.intervention.cours.code}`;
          link = `/interventions/${item.intervention.id}`;
      }
      
      return {
        id: item.id,
        text,
        time: formatRelativeTime(item.created_at),
        link
      };
    });
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Exception lors de la récupération des activités récentes:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
} 