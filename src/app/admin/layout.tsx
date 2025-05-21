import { ReactNode } from 'react';
import Link from "next/link";
import { FaUser, FaUserShield, FaUniversity, FaBook, FaCalendarAlt, FaTools, FaDatabase, FaUserGraduate } from "react-icons/fa";

interface AdminLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: 'Administration - Gestionnaire IUT',
  description: 'Interface d\'administration du gestionnaire de maquette pédagogique IUT'
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Liens de navigation pour l'administration
  const adminLinks = [
    { title: "Tableau de bord", href: "/admin", icon: <FaTools className="mr-2" /> },
    { title: "Départements", href: "/admin/departements", icon: <FaUniversity className="mr-2" /> },
    { title: "Enseignants", href: "/admin/enseignants", icon: <FaUserGraduate className="mr-2" /> },
    { title: "Maquettes", href: "/admin/maquettes", icon: <FaBook className="mr-2" /> },
    { title: "Interventions", href: "/admin/interventions", icon: <FaCalendarAlt className="mr-2" /> },
    { title: "Base de données", href: "/admin/database", icon: <FaDatabase className="mr-2" /> },
    { title: "Utilisateurs", href: "/admin/utilisateurs", icon: <FaUser className="mr-2" /> },
  ];

  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
            <Link href="/admin" className="flex items-center">
              <FaUserShield className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-semibold text-gray-800">Administration</span>
            </Link>
          </div>
          <div className="flex-grow flex flex-col py-4">
            <nav className="flex-1 px-2 space-y-1">
              {adminLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                >
                  {link.icon}
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link href="/" className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <FaUser className="text-gray-400 group-hover:text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Retour à l'accueil
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center">
              <FaUserShield className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-semibold text-gray-800">Administration</span>
            </Link>
            {/* Mobile menu button - would be implemented with useState */}
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}