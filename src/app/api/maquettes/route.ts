import { NextResponse } from 'next/server';

export async function GET() {
  const maquettes = [
    { id: 1, titre: 'BUT Informatique', annee: '2023-2024', departement: 'Informatique' },
    { id: 2, titre: 'BUT GEA', annee: '2023-2024', departement: 'GEA' },
    { id: 3, titre: 'BUT TC', annee: '2023-2024', departement: 'TC' }
  ];
  return NextResponse.json({ maquettes });
}