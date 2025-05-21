// Types pour les données de l'application

// Type pour les départements
export interface Departement {
  id: number;
  nom: string;
  code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Type pour les parcours
export interface Parcours {
  id: number;
  nom: string;
  code: string;
  departement_id: number;
  created_at?: string;
  updated_at?: string;
  departement?: Departement;
}

// Type pour les statuts d'enseignant
export interface StatutEnseignant {
  id: number;
  nom: string;
  heures_min: number;
  heures_max: number;
  created_at?: string;
  updated_at?: string;
}

// Type pour les enseignants
export interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  departement_id: number;
  created_at?: string;
  updated_at?: string;
  departement?: Departement;
  statut?: StatutEnseignant;
}

// Type pour les maquettes pédagogiques
export interface MaquettePedagogique {
  id: number;
  nom: string;
  annee: string;
  parcours_id: number;
  departement_id: number;
  created_at?: string;
  updated_at?: string;
  parcours?: Parcours;
  departement?: Departement;
}

// Type pour les types de cours
export interface TypeCours {
  id: number;
  nom: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Type pour les cours
export interface Cours {
  id: number;
  code: string;
  nom: string;
  description?: string;
  maquette_pedagogique_id: number;
  type_cours_id: number;
  created_at?: string;
  updated_at?: string;
  maquette_pedagogique?: MaquettePedagogique;
  type_cours?: TypeCours;
}

// Type pour les allocations horaires
export interface AllocationHoraire {
  id: number;
  cours_id: number;
  nb_heures: number;
  nb_groupes: number;
  created_at?: string;
  updated_at?: string;
  cours?: Cours;
}

// Type pour les groupes
export interface Groupe {
  id: number;
  nom: string;
  code?: string;
  effectif?: number;
  created_at?: string;
  updated_at?: string;
}

// Type pour les interventions
export interface Intervention {
  id: number;
  enseignant_id: number;
  cours_id: number;
  groupe_id?: number;
  heures: number;
  date?: string;
  annee: string;
  created_at?: string;
  updated_at?: string;
  enseignant?: Enseignant;
  cours?: Cours;
  groupe?: Groupe;
}

// Type pour les salles
export interface Salle {
  id: number;
  nom: string;
  capacite: number;
  batiment?: string;
  etage?: string;
  created_at?: string;
  updated_at?: string;
}

// Type pour le planning
export interface Planning {
  id: number;
  intervention_id: number;
  salle_id: number;
  date: string;
  debut: string;
  fin: string;
  created_at?: string;
  updated_at?: string;
  intervention?: Intervention;
  salle?: Salle;
}

// Type pour l'historique des interventions
export interface HistoriqueIntervention {
  id: number;
  intervention_id: number;
  statut: string;
  commentaire?: string;
  created_at?: string;
  updated_at?: string;
  intervention?: Intervention;
}

// Types pour les activités récentes
export interface Activity {
  id: number;
  text: string;
  time: string;
  link?: string;
}

// Type simplifié pour les interventions à venir
export interface UpcomingIntervention {
  id: number;
  titre: string;
  date: string;
  enseignant: string;
  salle: string;
  cours: string;
  departement: string;
  duree: number;
}

// Type pour les statistiques du dashboard
export interface DashboardStat {
  label: string;
  count: number;
  path: string;
  color: string;
  bgColor: string;
  change: string;
} 