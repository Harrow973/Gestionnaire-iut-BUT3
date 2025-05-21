'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity } from '@/types';
import { FaArrowRight, FaRegClock } from 'react-icons/fa';

interface RecentActivitiesProps {
  fallbackData?: Activity[];
  limit?: number;
}

export default function RecentActivities({ fallbackData, limit = 5 }: RecentActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>(fallbackData || []);
  const [loading, setLoading] = useState(!fallbackData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fallbackData) return;
    
    const fetchActivities = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/dashboard/recent-activities?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des activités:', err);
        setError('Impossible de charger les activités récentes');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [fallbackData, limit]);

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
          <div key={index} className="flex items-start animate-pulse">
            <div className="h-2 w-2 mt-2 rounded-full bg-gray-200 mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        <>
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 mr-3"></div>
              <div>
                {activity.link ? (
                  <Link href={activity.link} className="text-gray-700 hover:text-blue-600 transition-colors">
                    {activity.text}
                  </Link>
                ) : (
                  <p className="text-gray-700">{activity.text}</p>
                )}
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <FaRegClock className="mr-1" /> {activity.time}
                </p>
              </div>
            </div>
          ))}
          
          <Link 
            href="/activites" 
            className="text-blue-500 text-sm font-medium flex items-center hover:text-blue-600 transition-colors"
          >
            Voir toutes les activités
            <FaArrowRight className="ml-1 text-xs" />
          </Link>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">Aucune activité récente</p>
        </div>
      )}
    </div>
  );
} 