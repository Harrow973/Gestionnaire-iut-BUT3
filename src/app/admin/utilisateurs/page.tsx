'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FaUserShield, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaArrowLeft, 
  FaCheck, 
  FaTimes,
  FaSort
} from 'react-icons/fa';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  isActive: boolean;
  lastLogin: string;
}

export default function UserManagement() {
  // Mock data for users
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'Admin Système',
      email: 'admin@iut.fr',
      role: 'admin',
      department: 'Informatique',
      isActive: true,
      lastLogin: '2023-05-28 14:30:22'
    },
    {
      id: 2,
      name: 'Jean Dupont',
      email: 'jean.dupont@iut.fr',
      role: 'admin',
      department: 'R&T',
      isActive: true,
      lastLogin: '2023-05-27 09:15:43'
    },
    {
      id: 3,
      name: 'Marie Durand',
      email: 'marie.durand@iut.fr',
      role: 'manager',
      department: 'GEA',
      isActive: true,
      lastLogin: '2023-05-26 11:22:18'
    },
    {
      id: 4,
      name: 'Thomas Martin',
      email: 'thomas.martin@iut.fr',
      role: 'user',
      department: 'TC',
      isActive: false,
      lastLogin: '2023-05-10 08:45:00'
    },
    {
      id: 5,
      name: 'Sophie Bernard',
      email: 'sophie.bernard@iut.fr',
      role: 'manager',
      department: 'MMI',
      isActive: true,
      lastLogin: '2023-05-28 10:05:37'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof User>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortField === 'isActive') {
      return sortDirection === 'asc' 
        ? (a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1)
        : (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1);
    }
    
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const deleteUser = (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleNewUser = () => {
    // For demo purposes, just create a new user with placeholder data
    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: 'Nouvel Utilisateur',
      email: 'nouveau@iut.fr',
      role: 'user',
      department: 'Non assigné',
      isActive: true,
      lastLogin: 'Jamais'
    };
    
    setUsers([...users, newUser]);
    setSelectedUser(newUser);
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));
    closeModal();
  };

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    user: 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 transition-colors">
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des utilisateurs
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleNewUser}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <FaPlus className="h-4 w-4" />
            <span>Nouvel utilisateur</span>
          </button>
        </div>
      </div>

      {/* User table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    {sortField === 'id' && (
                      <FaSort className={`h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Nom</span>
                    {sortField === 'name' && (
                      <FaSort className={`h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {sortField === 'email' && (
                      <FaSort className={`h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Rôle</span>
                    {sortField === 'role' && (
                      <FaSort className={`h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Département</span>
                    {sortField === 'department' && (
                      <FaSort className={`h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('isActive')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Statut</span>
                    {sortField === 'isActive' && (
                      <FaSort className={`h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastLogin')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Dernière connexion</span>
                    {sortField === 'lastLogin' && (
                      <FaSort className={`h-3 w-3 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role]}`}>
                      {user.role === 'admin' ? 'Administrateur' : user.role === 'manager' ? 'Gestionnaire' : 'Utilisateur'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {user.isActive ? (
                        <span className="flex items-center"><FaCheck className="mr-1 h-3 w-3" /> Actif</span>
                      ) : (
                        <span className="flex items-center"><FaTimes className="mr-1 h-3 w-3" /> Inactif</span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add User Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedUser.id ? 'Modifier' : 'Ajouter'} un utilisateur
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  id="role"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as 'admin' | 'manager' | 'user'})}
                >
                  <option value="admin">Administrateur</option>
                  <option value="manager">Gestionnaire</option>
                  <option value="user">Utilisateur</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Département</label>
                <select
                  id="department"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedUser.department}
                  onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                >
                  <option value="Informatique">Informatique</option>
                  <option value="R&T">R&T</option>
                  <option value="GEA">GEA</option>
                  <option value="TC">TC</option>
                  <option value="MMI">MMI</option>
                  <option value="Non assigné">Non assigné</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={selectedUser.isActive}
                  onChange={(e) => setSelectedUser({...selectedUser, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Compte actif</label>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
              <button
                type="button"
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={closeModal}
              >
                Annuler
              </button>
              <button
                type="button"
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleSaveUser}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 