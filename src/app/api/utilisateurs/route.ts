import { NextResponse } from 'next/server';

export async function GET() {
  const utilisateurs = [
    { id: 1, nom: 'Admin', email: 'admin@iut.fr', role: 'administrateur' },
    { id: 2, nom: 'Jean Dupont', email: 'jean.dupont@iut.fr', role: 'enseignant' },
    { id: 3, nom: 'Marie Curie', email: 'marie.curie@iut.fr', role: 'chef de département' }
  ];
  return NextResponse.json({ utilisateurs });
}