"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/custom/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storageUsers, storageGroups } from '@/lib/storage';
import { Usuario, Grupo } from '@/lib/types';
import { Users, Copy, Check, UserPlus, Crown, Plus, LogOut } from 'lucide-react';

export default function GrupoPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>('');
  const [membros, setMembros] = useState<Usuario[]>([]);
  const [copied, setCopied] = useState(false);
  const [novoGrupoNome, setNovoGrupoNome] = useState('');
  const [codigoEntrar, setCodigoEntrar] = useState('');
  const [showCriarGrupo, setShowCriarGrupo] = useState(false);
  const [showEntrarGrupo, setShowEntrarGrupo] = useState(false);

  useEffect(() => {
    const user = storageUsers.getCurrentUser();
    
    if (!user) {
      router.push('/auth');
      return;
    }

    setCurrentUser(user);
    carregarGrupos(user);
  }, [router]);

  const carregarGrupos = (user: Usuario) => {
    const userGroups = storageGroups.getByUser(user.id);
    setGrupos(userGroups);
    
    if (userGroups.length > 0 && !grupoSelecionado) {
      setGrupoSelecionado(userGroups[0].id);
      carregarMembros(userGroups[0].id);
    }
  };

  const carregarMembros = (grupoId: string) => {
    const groupMembers = storageUsers.getByGroup(grupoId);
    setMembros(groupMembers);
  };

  const handleSelecionarGrupo = (grupoId: string) => {
    setGrupoSelecionado(grupoId);
    carregarMembros(grupoId);
  };

  const handleCriarGrupo = () => {
    if (!currentUser || !novoGrupoNome.trim()) return;

    const novoGrupo: Grupo = {
      id: Date.now().toString(),
      nome: novoGrupoNome.trim(),
      criadoEm: new Date().toISOString(),
      membros: [currentUser.id]
    };

    storageGroups.add(novoGrupo);
    
    // Adiciona o grupo ao usuário
    const novosGrupoIds = [...currentUser.grupoIds, novoGrupo.id];
    storageUsers.update(currentUser.id, { grupoIds: novosGrupoIds });
    
    const userAtualizado = { ...currentUser, grupoIds: novosGrupoIds };
    setCurrentUser(userAtualizado);
    
    carregarGrupos(userAtualizado);
    setGrupoSelecionado(novoGrupo.id);
    setNovoGrupoNome('');
    setShowCriarGrupo(false);
  };

  const handleEntrarGrupo = () => {
    if (!currentUser || !codigoEntrar.trim()) return;

    const grupo = storageGroups.getById(codigoEntrar.trim());
    
    if (!grupo) {
      alert('Código de grupo inválido!');
      return;
    }

    if (currentUser.grupoIds.includes(grupo.id)) {
      alert('Você já está neste grupo!');
      return;
    }

    // Adiciona o usuário ao grupo
    storageGroups.addMember(grupo.id, currentUser.id);
    
    // Adiciona o grupo ao usuário
    const novosGrupoIds = [...currentUser.grupoIds, grupo.id];
    storageUsers.update(currentUser.id, { grupoIds: novosGrupoIds });
    
    const userAtualizado = { ...currentUser, grupoIds: novosGrupoIds };
    setCurrentUser(userAtualizado);
    
    carregarGrupos(userAtualizado);
    setGrupoSelecionado(grupo.id);
    setCodigoEntrar('');
    setShowEntrarGrupo(false);
  };

  const handleCopyCode = () => {
    if (grupoSelecionado) {
      navigator.clipboard.writeText(grupoSelecionado);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const grupoAtual = grupos.find(g => g.id === grupoSelecionado);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Meus Grupos</h2>
            <p className="text-gray-600">Gerencie seus grupos e membros</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Grupos */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Grupos ({grupos.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {grupos.map((grupo) => (
                    <button
                      key={grupo.id}
                      onClick={() => handleSelecionarGrupo(grupo.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        grupoSelecionado === grupo.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">{grupo.nome}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {storageUsers.getByGroup(grupo.id).length} membros
                      </p>
                    </button>
                  ))}

                  <div className="pt-3 space-y-2">
                    <Button
                      onClick={() => setShowCriarGrupo(!showCriarGrupo)}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Novo Grupo
                    </Button>

                    <Button
                      onClick={() => setShowEntrarGrupo(!showEntrarGrupo)}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Entrar em Grupo
                    </Button>
                  </div>

                  {/* Formulário Criar Grupo */}
                  {showCriarGrupo && (
                    <div className="pt-3 border-t space-y-3">
                      <Label htmlFor="novoGrupo">Nome do Grupo</Label>
                      <Input
                        id="novoGrupo"
                        value={novoGrupoNome}
                        onChange={(e) => setNovoGrupoNome(e.target.value)}
                        placeholder="Ex: Equipe Marketing"
                      />
                      <Button
                        onClick={handleCriarGrupo}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                      >
                        Criar Grupo
                      </Button>
                    </div>
                  )}

                  {/* Formulário Entrar em Grupo */}
                  {showEntrarGrupo && (
                    <div className="pt-3 border-t space-y-3">
                      <Label htmlFor="codigoGrupo">Código do Grupo</Label>
                      <Input
                        id="codigoGrupo"
                        value={codigoEntrar}
                        onChange={(e) => setCodigoEntrar(e.target.value)}
                        placeholder="Cole o código aqui"
                      />
                      <Button
                        onClick={handleEntrarGrupo}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        Entrar no Grupo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detalhes do Grupo Selecionado */}
            <div className="lg:col-span-2">
              {grupoAtual ? (
                <>
                  {/* Informações do Grupo */}
                  <Card className="mb-6 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        {grupoAtual.nome}
                      </CardTitle>
                      <CardDescription>
                        Criado em {new Date(grupoAtual.criadoEm).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Código do Grupo:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-lg font-semibold text-gray-800">
                            {grupoAtual.id}
                          </code>
                          <Button
                            onClick={handleCopyCode}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Compartilhe este código para convidar pessoas
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de Membros */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-blue-500" />
                        Membros ({membros.length})
                      </CardTitle>
                      <CardDescription>
                        Todos os membros podem criar e gerenciar tarefas do grupo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {membros.map((membro) => (
                          <div
                            key={membro.id}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              membro.id === currentUser.id
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                                {membro.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                  {membro.nome}
                                  {membro.id === currentUser.id && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                      Você
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">{membro.email}</p>
                              </div>
                            </div>
                            
                            {membro.isPremium && (
                              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full flex items-center gap-1">
                                <Crown className="w-4 h-4 text-white" />
                                <span className="text-white text-xs font-semibold">Premium</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {membros.length === 1 && (
                        <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">Você é o único membro do grupo</p>
                          <p className="text-sm text-gray-500">
                            Compartilhe o código acima para convidar outras pessoas
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="py-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Nenhum grupo selecionado</p>
                    <p className="text-sm text-gray-500">
                      Crie um novo grupo ou entre em um existente
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
