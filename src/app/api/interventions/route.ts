import { NextResponse } from 'next/server';

export async function GET() {
  const interventions = [
    { id: 1, enseignant: 'Jean Dupont', cours: 'Développement Web', date: '2023-10-12', duree: 4, maquette: 'BUT Informatique' },
    { id: 2, enseignant: 'Sophie Martin', cours: 'Comptabilité', date: '2023-10-13', duree: 2, maquette: 'BUT GEA' },
    { id: 3, enseignant: 'Pierre Dubois', cours: 'Marketing', date: '2023-10-14', duree: 3, maquette: 'BUT TC' }
  ];
  return NextResponse.json({ interventions });
}