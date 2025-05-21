'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/feedback/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { CheckCircle, XCircle, Loader2, Database, Table } from 'lucide-react';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      
      setResult(data);
      setStatus(data.connected ? 'success' : 'error');
    } catch (error) {
      console.error('Error testing connection:', error);
      setStatus('error');
      setResult({ 
        connected: false, 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Test de connexion à la base de données
            </CardTitle>
            <CardDescription>
              Vérifiez si votre application est correctement connectée à Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button 
                onClick={testConnection} 
                disabled={status === 'loading'}
                size="lg"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  'Tester la connexion'
                )}
              </Button>
            </div>

            {status === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Connexion réussie!</AlertTitle>
                <AlertDescription className="text-green-700">
                  La connexion à la base de données Supabase fonctionne correctement.
                </AlertDescription>
              </Alert>
            )}

            {status === 'error' && (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800">Erreur de connexion</AlertTitle>
                <AlertDescription className="text-red-700">
                  {result?.error || "Impossible de se connecter à la base de données."}
                </AlertDescription>
              </Alert>
            )}

            {result?.availableTables && result.availableTables.length > 0 && (
              <div className="mt-4 border rounded-md p-4 bg-slate-50">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Tables disponibles:
                </h3>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  {result.availableTables.map((table: string, index: number) => (
                    <li key={index} className="bg-white p-2 rounded border">
                      {table}
                    </li>
                  ))}
                </ul>
                <p className="text-xs mt-3 text-slate-500">
                  Note: Pour accéder à vos tables, utilisez les noms exacts tels qu'affichés ci-dessus dans vos requêtes.
                </p>
              </div>
            )}

            {result && status !== 'loading' && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <code className="text-xs bg-slate-200 px-1 rounded">JSON</code>
                  Détails de la réponse:
                </h3>
                <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 