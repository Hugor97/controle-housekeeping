"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { storageUsers, storageGroups, storageSubscriptions } from '@/lib/storage';
import { Usuario, Grupo } from '@/lib/types';
import { ClipboardList, Users, LogIn, UserPlus } from 'lucide-react';

// Email do administrador (altere para o seu email)
const ADMIN_EMAIL = 'admin@pendenciaspro.com';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');

  // Registro state
  const [registerNome, setRegisterNome] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const users = storageUsers.getAll();
      const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());

      if (user) {
        // Verifica se é colaborador de plano empresarial
        const todosUsuarios = storageUsers.getAll();
        const usuarioComPlanoEmpresarial = todosUsuarios.find(u => 
          u.planoEmpresarial?.emailsColaboradores.includes(loginEmail.toLowerCase())
        );

        if (usuarioComPlanoEmpresarial) {
          // Atualiza usuário para premium como colaborador
          storageUsers.update(user.id, {
            isPremium: true,
            emailPrincipal: usuarioComPlanoEmpresarial.email
          });
          
          const updatedUser = storageUsers.getById(user.id);
          if (updatedUser) {
            storageUsers.setCurrentUser(updatedUser);
          }
        } else {
          storageUsers.setCurrentUser(user);
        }
        
        router.push('/');
      } else {
        alert('Usuário não encontrado. Verifique o email ou cadastre-se.');
      }
      
      setIsLoading(false);
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Verifica se email já existe
      const users = storageUsers.getAll();
      const emailExiste = users.find(u => u.email.toLowerCase() === registerEmail.toLowerCase());
      
      if (emailExiste) {
        alert('Este email já está cadastrado. Faça login.');
        setIsLoading(false);
        return;
      }

      // Cria grupo padrão para o usuário
      const novoGrupo: Grupo = {
        id: Math.random().toString(36).substring(2, 9),
        nome: `Grupo de ${registerNome}`,
        criadoEm: new Date().toISOString(),
        membros: []
      };
      storageGroups.add(novoGrupo);

      // Verifica se é o administrador
      const isAdmin = registerEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      // Verifica se é colaborador de plano empresarial
      const usuarioComPlanoEmpresarial = users.find(u => 
        u.planoEmpresarial?.emailsColaboradores.includes(registerEmail.toLowerCase())
      );

      // Cria o usuário
      const novoUsuario: Usuario = {
        id: Math.random().toString(36).substring(2, 9),
        nome: registerNome,
        email: registerEmail,
        grupoIds: [novoGrupo.id],
        isPremium: isAdmin || !!usuarioComPlanoEmpresarial,
        isAdmin: isAdmin,
        criadoEm: new Date().toISOString(),
        emailPrincipal: usuarioComPlanoEmpresarial?.email
      };

      storageUsers.add(novoUsuario);

      // Se for admin, cria assinatura vitalícia
      if (isAdmin) {
        storageSubscriptions.save({
          userId: novoUsuario.id,
          isPremium: true,
          dataCompra: new Date().toISOString(),
          valor: 0,
          plano: 'vitalicio',
          dataExpiracao: undefined,
          tipo: 'individual'
        });
      }

      // Adiciona usuário ao grupo
      storageGroups.update(novoGrupo.id, {
        membros: [novoUsuario.id]
      });

      // Define como usuário atual
      storageUsers.setCurrentUser(novoUsuario);

      // Mensagem de boas-vindas
      if (isAdmin) {
        alert('Bem-vindo, Administrador! 👑\n\nVocê tem acesso Premium Vitalício e pode gerar vouchers para presentear outras pessoas.');
      } else if (usuarioComPlanoEmpresarial) {
        alert(`Bem-vindo! 🎉\n\nVocê foi adicionado como colaborador Premium pela empresa ${usuarioComPlanoEmpresarial.nome}.`);
      } else {
        alert(`Cadastro realizado com sucesso!\n\nCódigo do seu grupo: ${novoGrupo.id}\n\nCompartilhe este código para adicionar membros ao grupo.`);
      }

      router.push('/');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Pendências Pro</h1>
          </div>
          <p className="text-gray-600">Gerencie tarefas em grupo de forma eficiente</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Bem-vindo!</CardTitle>
            <CardDescription>Entre ou crie sua conta para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-nome">Nome</Label>
                    <Input
                      id="register-nome"
                      type="text"
                      placeholder="Seu nome"
                      value={registerNome}
                      onChange={(e) => setRegisterNome(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                    {registerEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                      <p className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
                        👑 Você será registrado como Administrador com Premium Vitalício
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          Versão gratuita com anúncios • Premium a partir de R$ 10,00
        </p>
      </div>
    </div>
  );
}
