'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaCalendarCheck, FaCalendarDay, FaChalkboardTeacher, FaMapMarkerAlt } from "react-icons/fa";
import { UpcomingIntervention } from "@/types";

interface UpcomingInterventionsProps {
  limit?: number;
  fallbackData?: UpcomingIntervention[];
}

export default function UpcomingInterventions({ limit = 5, fallbackData }: UpcomingInterventionsProps) {
  const [interventions, setInterventions] = useState<UpcomingIntervention[]>(fallbackData || []);
  const [loading, setLoading] = useState(!fallbackData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterventions = async () => {
      if (fallbackData) return; // Ne pas fetcher si des données de fallback sont fournies
      setLoading(true);
      
      try {
        const response = await fetch(`/api/dashboard/upcoming-interventions?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setInterventions(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des interventions:", err);
        setError("Impossible de charger les interventions à venir");
        setLoading(false);
      }
    };

    fetchInterventions();
  }, [limit, fallbackData]);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="bg-white border border-gray-100 rounded-lg p-4 animate-pulse">
            <div className="flex justify-between items-start mb-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 w-16 bg-blue-100 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interventions.length > 0 ? (
        <>
          <div className="grid gap-4">
            {interventions.map((intervention) => (
              <Link 
                key={intervention.id}
                href={`/interventions/${intervention.id}`}
                className="block bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {intervention.titre}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {intervention.departement} - {intervention.cours}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FaCalendarDay className="mr-2 text-gray-400" />
                    {intervention.date} ({intervention.duree}h)
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaChalkboardTeacher className="mr-2 text-gray-400" />
                    {intervention.enseignant}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    Salle {intervention.salle}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <Link 
            href="/interventions" 
            className="text-blue-500 text-sm font-medium flex items-center hover:text-blue-600 transition-colors"
          >
            Voir toutes les interventions
            <FaCalendarCheck className="ml-1" />
          </Link>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <FaCalendarCheck className="mx-auto text-3xl text-gray-400 mb-2" />
          <p className="text-gray-600">Aucune intervention à venir</p>
          <Link 
            href="/interventions/nouvelle"
            className="inline-block mt-3 text-blue-500 hover:text-blue-600 transition-colors"
          >
            Planifier une intervention
          </Link>
        </div>
      )}
    </div>
  );
} 