import { Mail, Shield, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { User as UserType } from '../../types';

interface UserFormProps {
  user?: UserType;
  onSubmit: (data: Partial<UserType>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isOpen }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ('assistant' as UserType['role']),
    authUserId: user?.authUserId || '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userData: Partial<UserType> = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      authUserId: formData.authUserId.trim(),
    };

    onSubmit(userData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="usuario@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Cargo *
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as UserType['role'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="assistant">Auxiliar</option>
              <option value="veterinarian">Veterinário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="auth-user-id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ID no Supabase Auth
            </label>
            <input
              id="auth-user-id"
              value={formData.authUserId}
              onChange={(e) =>
                setFormData({ ...formData, authUserId: e.target.value })
              }
              pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="UUID da conta criada no Supabase"
            />
            <p className="mt-2 text-sm text-gray-500">
              Crie a conta e gerencie a senha no Supabase Auth. O perfil só
              permite login após vincular o ID.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {user ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
