import { NextResponse } from 'next/server';

export async function GET() {
  const statistiques = {
    totalDepartements: 3,
    totalEnseignants: 15,
    totalMaquettes: 6,
    totalInterventions: 127,
    totalUtilisateurs: 25
  };
  return NextResponse.json(statistiques);
}