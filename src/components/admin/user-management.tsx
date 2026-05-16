'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  station?: string;
  region?: string;
  isActive: boolean;
  createdAt: string;
}

interface UserManagementProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function UserManagement({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onToggleActive,
}: UserManagementProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const roles = Array.from(new Set(users.map((u) => u.role)));

  const filtered = users.filter((item) => {
    const matchesSearch = item.email.toLowerCase().includes(search.toLowerCase()) ||
                         item.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || item.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 flex-1 sm:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={onAddUser} className="gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.region && <div>{user.region}</div>}
                    {user.station && <div className="text-xs text-gray-500">{user.station}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(user.id)}
                      className="text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(user.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
