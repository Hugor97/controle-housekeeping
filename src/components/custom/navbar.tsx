"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ClipboardList, BarChart3, Users, LogOut, Crown, Settings, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storageUsers } from '@/lib/storage';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPlanoEmpresarial, setHasPlanoEmpresarial] = useState(false);

  useEffect(() => {
    const user = storageUsers.getCurrentUser();
    if (user) {
      setIsPremium(user.isPremium);
      setIsAdmin(user.isAdmin);
      setHasPlanoEmpresarial(!!user.planoEmpresarial);
    }
  }, []);

  const handleLogout = () => {
    storageUsers.setCurrentUser(null);
    router.push('/auth');
  };

  const navItems = [
    { href: '/', label: 'Tarefas', icon: ClipboardList },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
    { href: '/grupo', label: 'Grupo', icon: Users },
  ];

  // Adiciona item de empresa se tiver plano empresarial
  if (hasPlanoEmpresarial) {
    navItems.push({ href: '/empresa', label: 'Empresa', icon: Building2 });
  }

  // Adiciona item de admin se for administrador
  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: Settings });
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg shadow-md">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-800">Pendências Pro</span>
              {isPremium && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-semibold">Premium</span>
                </div>
              )}
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
