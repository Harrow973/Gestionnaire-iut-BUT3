import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { formatDate } from '@/lib/utils';

/**
 * GET /api/dashboard/upcoming-interventions
 * Récupère les interventions à venir pour le dashboard
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 5;
    
    // Obtenir la date d'aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    
    // Récupérer les interventions avec planification à venir
    const { data, error } = await supabase
      .from('planning')
      .select(`
        id,
        date,
        debut,
        fin,
        intervention:intervention_id(
          id,
          heures,
          enseignant:enseignant_id(id, nom, prenom),
          cours:cours_id(
            id,
            code,
            nom,
            maquette_pedagogique:maquette_pedagogique_id(
              departement:departement_id(code)
            )
          )
        ),
        salle:salle_id(id, nom, batiment)
      `)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('debut', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Erreur lors de la récupération des interventions à venir:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des interventions' }, { status: 500 });
    }
    
    // Formater les données pour le composant UpcomingInterventions
    const formattedData = data.map((item) => {
      const date = new Date(`${item.date}T${item.debut}`);
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      // Calculer la durée en heures
      const debut = new Date(`${item.date}T${item.debut}`);
      const fin = new Date(`${item.date}T${item.fin}`);
      const dureeMs = fin.getTime() - debut.getTime();
      const duree = Math.round((dureeMs / (1000 * 60 * 60)) * 10) / 10; // Arrondi à 1 décimale
      
      return {
        id: item.intervention.id,
        titre: item.intervention.cours.nom,
        date: date.toLocaleDateString('fr-FR', options),
        enseignant: `${item.intervention.enseignant.prenom} ${item.intervention.enseignant.nom}`,
        salle: item.salle ? `${item.salle.nom}${item.salle.batiment ? ` (${item.salle.batiment})` : ''}` : 'Non définie',
        cours: item.intervention.cours.code,
        departement: item.intervention.cours.maquette_pedagogique.departement.code,
        duree: duree
      };
    });
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Exception lors de la récupération des interventions à venir:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
} 