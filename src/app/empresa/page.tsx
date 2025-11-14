"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storageUsers } from '@/lib/storage';
import { Usuario } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, UserPlus, Trash2, Mail, Crown, Users, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EmpresaPage() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [novoEmail, setNovoEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = storageUsers.getCurrentUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Verifica se tem plano empresarial
    if (!user.planoEmpresarial) {
      router.push('/');
      return;
    }
    
    setCurrentUser(user);
  }, [router]);

  const handleAdicionarColaborador = () => {
    if (!currentUser || !currentUser.planoEmpresarial) return;
    
    if (!novoEmail.trim() || !novoEmail.includes('@')) {
      alert('Digite um email válido.');
      return;
    }

    const emailsAtuais = currentUser.planoEmpresarial.emailsColaboradores;
    
    if (emailsAtuais.length >= 20) {
      alert('Limite máximo de 20 colaboradores atingido.');
      return;
    }

    if (emailsAtuais.includes(novoEmail.toLowerCase())) {
      alert('Este email já está cadastrado.');
      return;
    }

    if (novoEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      alert('Você não pode adicionar seu próprio email como colaborador.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const novosEmails = [...emailsAtuais, novoEmail.toLowerCase()];
      
      storageUsers.update(currentUser.id, {
        planoEmpresarial: {
          ...currentUser.planoEmpresarial!,
          emailsColaboradores: novosEmails
        }
      });

      // Atualiza estado local
      const updatedUser = storageUsers.getById(currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        storageUsers.setCurrentUser(updatedUser);
      }

      setNovoEmail('');
      setIsLoading(false);
      alert('Colaborador adicionado com sucesso! 🎉');
    }, 500);
  };

  const handleRemoverColaborador = (email: string) => {
    if (!currentUser || !currentUser.planoEmpresarial) return;

    if (!confirm(`Deseja realmente remover ${email}?`)) return;

    setIsLoading(true);

    setTimeout(() => {
      const novosEmails = currentUser.planoEmpresarial!.emailsColaboradores.filter(
        e => e !== email
      );
      
      storageUsers.update(currentUser.id, {
        planoEmpresarial: {
          ...currentUser.planoEmpresarial!,
          emailsColaboradores: novosEmails
        }
      });

      // Atualiza estado local
      const updatedUser = storageUsers.getById(currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        storageUsers.setCurrentUser(updatedUser);
      }

      setIsLoading(false);
      alert('Colaborador removido com sucesso.');
    }, 500);
  };

  if (!currentUser || !currentUser.planoEmpresarial) {
    return null;
  }

  const planoEmpresarial = currentUser.planoEmpresarial;
  const vagasDisponiveis = 20 - planoEmpresarial.emailsColaboradores.length;
  const dataExpiracao = planoEmpresarial.dataExpiracao 
    ? new Date(planoEmpresarial.dataExpiracao).toLocaleDateString('pt-BR')
    : 'Vitalício';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestão Empresarial</h1>
              <p className="text-gray-600">Gerencie seus colaboradores Premium</p>
            </div>
          </div>
          <Button onClick={() => router.push('/')} variant="outline">
            Voltar
          </Button>
        </div>

        {/* Informações do Plano */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Seu Plano Empresarial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Colaboradores</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {planoEmpresarial.emailsColaboradores.length}/20
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Validade</p>
                  <p className="text-lg font-bold text-gray-800">{dataExpiracao}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                <UserPlus className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Vagas Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-800">{vagasDisponiveis}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adicionar Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Adicionar Colaborador
            </CardTitle>
            <CardDescription>
              Adicione até {vagasDisponiveis} colaboradores. Eles terão acesso Premium completo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="email">Email do Colaborador</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colaborador@empresa.com"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  disabled={isLoading || vagasDisponiveis === 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAdicionarColaborador();
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAdicionarColaborador}
                  disabled={isLoading || vagasDisponiveis === 0 || !novoEmail.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
            {vagasDisponiveis === 0 && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Limite de 20 colaboradores atingido. Remova um colaborador para adicionar outro.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Lista de Colaboradores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Colaboradores Ativos ({planoEmpresarial.emailsColaboradores.length})
            </CardTitle>
            <CardDescription>
              Gerencie os colaboradores com acesso Premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            {planoEmpresarial.emailsColaboradores.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhum colaborador adicionado ainda</p>
                <p className="text-gray-400 text-sm mt-2">
                  Adicione emails de colaboradores para dar acesso Premium
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {planoEmpresarial.emailsColaboradores.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{email}</p>
                        <p className="text-sm text-gray-500">Acesso Premium Ativo</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoverColaborador(email)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> Quando um colaborador fizer login com um dos emails cadastrados,
            ele automaticamente terá acesso Premium vinculado à sua conta empresarial.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
