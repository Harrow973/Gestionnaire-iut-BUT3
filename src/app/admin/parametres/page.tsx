'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FaCog, 
  FaArrowLeft, 
  FaSave, 
  FaServer, 
  FaEnvelope, 
  FaLock, 
  FaDatabase,
  FaCalendarAlt,
  FaGlobe,
  FaExclamationTriangle,
  FaCircleNotch
} from 'react-icons/fa';

export default function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Sample system settings
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Gestionnaire IUT',
      logoUrl: '/Logo_IUT.png',
      maintenanceMode: false,
      debugMode: false,
      defaultLanguage: 'fr'
    },
    email: {
      smtpServer: 'smtp.iut.fr',
      smtpPort: 587,
      smtpUser: 'no-reply@iut.fr',
      smtpPassword: '************',
      senderName: 'Gestionnaire IUT',
      senderEmail: 'no-reply@iut.fr'
    },
    security: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChars: true,
      twoFactorAuth: false
    },
    academic: {
      currentAcademicYear: '2023-2024',
      semesterStart: '2023-09-01',
      semesterEnd: '2024-06-30',
      defaultWeeklyHours: 35
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '03:00',
      backupRetention: 30,
      backupLocation: '/backups'
    }
  });
  
  const handleInputChange = (category: string, field: string, value: string | boolean | number) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [field]: value
      }
    });
  };
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 transition-colors">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Paramètres du système
          </h1>
        </div>
        <div>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSaving ? (
              <>
                <FaCircleNotch className="h-4 w-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <FaSave className="h-4 w-4" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-green-50 text-green-800 px-4 py-3 rounded-md flex items-center space-x-2 animate-fade-in-out">
          <FaCircleNotch className="h-4 w-4" />
          <span>Paramètres enregistrés avec succès.</span>
        </div>
      )}
      
      <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-md flex items-center space-x-2">
        <FaExclamationTriangle className="h-4 w-4" />
        <span>Attention: Modifier ces paramètres peut affecter le fonctionnement de l'application.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center space-x-2">
            <FaCog className="text-blue-600" />
            <h2 className="font-semibold text-blue-800">Paramètres généraux</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Nom du site</label>
              <input 
                type="text" 
                id="siteName"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={settings.general.siteName}
                onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700">Langue par défaut</label>
              <select 
                id="defaultLanguage"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={settings.general.defaultLanguage}
                onChange={(e) => handleInputChange('general', 'defaultLanguage', e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="maintenanceMode"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.general.maintenanceMode}
                onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">Mode maintenance</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="debugMode"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={settings.general.debugMode}
                onChange={(e) => handleInputChange('general', 'debugMode', e.target.checked)}
              />
              <label htmlFor="debugMode" className="text-sm font-medium text-gray-700">Mode debug</label>
            </div>
          </div>
        </div>
        
        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center space-x-2">
            <FaEnvelope className="text-indigo-600" />
            <h2 className="font-semibold text-indigo-800">Paramètres email</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700">Serveur SMTP</label>
              <input 
                type="text" 
                id="smtpServer"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={settings.email.smtpServer}
                onChange={(e) => handleInputChange('email', 'smtpServer', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">Port SMTP</label>
              <input 
                type="number" 
                id="smtpPort"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={settings.email.smtpPort}
                onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700">Email d'expédition</label>
              <input 
                type="email" 
                id="senderEmail"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={settings.email.senderEmail}
                onChange={(e) => handleInputChange('email', 'senderEmail', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">Mot de passe SMTP</label>
              <input 
                type="password" 
                id="smtpPassword"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={settings.email.smtpPassword}
                onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center space-x-2">
            <FaLock className="text-red-600" />
            <h2 className="font-semibold text-red-800">Paramètres de sécurité</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">Délai d'expiration de la session (minutes)</label>
              <input 
                type="number" 
                id="sessionTimeout"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">Tentatives de connexion max</label>
              <input 
                type="number" 
                id="maxLoginAttempts"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">Longueur minimale du mot de passe</label>
              <input 
                type="number" 
                id="passwordMinLength"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="twoFactorAuth"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
              />
              <label htmlFor="twoFactorAuth" className="text-sm font-medium text-gray-700">Activer l'authentification à deux facteurs</label>
            </div>
          </div>
        </div>
        
        {/* Academic Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-green-50 border-b border-green-100 flex items-center space-x-2">
            <FaCalendarAlt className="text-green-600" />
            <h2 className="font-semibold text-green-800">Paramètres académiques</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label htmlFor="currentAcademicYear" className="block text-sm font-medium text-gray-700">Année académique en cours</label>
              <input 
                type="text" 
                id="currentAcademicYear"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={settings.academic.currentAcademicYear}
                onChange={(e) => handleInputChange('academic', 'currentAcademicYear', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="semesterStart" className="block text-sm font-medium text-gray-700">Début du semestre</label>
              <input 
                type="date" 
                id="semesterStart"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={settings.academic.semesterStart}
                onChange={(e) => handleInputChange('academic', 'semesterStart', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="semesterEnd" className="block text-sm font-medium text-gray-700">Fin du semestre</label>
              <input 
                type="date" 
                id="semesterEnd"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={settings.academic.semesterEnd}
                onChange={(e) => handleInputChange('academic', 'semesterEnd', e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="defaultWeeklyHours" className="block text-sm font-medium text-gray-700">Heures hebdomadaires par défaut</label>
              <input 
                type="number" 
                id="defaultWeeklyHours"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                value={settings.academic.defaultWeeklyHours}
                onChange={(e) => handleInputChange('academic', 'defaultWeeklyHours', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Backup Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center space-x-2">
          <FaDatabase className="text-gray-600" />
          <h2 className="font-semibold text-gray-800">Paramètres de sauvegarde</h2>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="autoBackup"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={settings.backup.autoBackup}
              onChange={(e) => handleInputChange('backup', 'autoBackup', e.target.checked)}
            />
            <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700">Sauvegarde automatique</label>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700">Fréquence de sauvegarde</label>
            <select 
              id="backupFrequency"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={settings.backup.backupFrequency}
              onChange={(e) => handleInputChange('backup', 'backupFrequency', e.target.value)}
              disabled={!settings.backup.autoBackup}
            >
              <option value="hourly">Toutes les heures</option>
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="backupTime" className="block text-sm font-medium text-gray-700">Heure de sauvegarde</label>
            <input 
              type="time" 
              id="backupTime"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={settings.backup.backupTime}
              onChange={(e) => handleInputChange('backup', 'backupTime', e.target.value)}
              disabled={!settings.backup.autoBackup}
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="backupRetention" className="block text-sm font-medium text-gray-700">Durée de conservation (jours)</label>
            <input 
              type="number" 
              id="backupRetention"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={settings.backup.backupRetention}
              onChange={(e) => handleInputChange('backup', 'backupRetention', parseInt(e.target.value) || 0)}
              disabled={!settings.backup.autoBackup}
            />
          </div>
          
          <div className="mt-4">
            <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center space-x-2">
              <FaServer className="h-4 w-4" />
              <span>Lancer une sauvegarde manuelle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 