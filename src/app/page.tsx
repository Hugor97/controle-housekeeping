"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task, Usuario } from '@/lib/types';
import { storageTasks, storageUsers, storageSubscriptions } from '@/lib/storage';
import { Navbar } from '@/components/custom/navbar';
import { TaskCard } from '@/components/custom/task-card';
import { AddTaskDialog } from '@/components/custom/add-task-dialog';
import { AdBanner } from '@/components/custom/ad-banner';
import { PremiumDialog } from '@/components/custom/premium-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Clock, CheckCircle2, Crown } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'todas' | Task['status']>('todas');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  useEffect(() => {
    const user = storageUsers.getCurrentUser();
    
    if (!user) {
      router.push('/auth');
      return;
    }

    setCurrentUser(user);
    setIsPremium(user.isPremium);
    
    // Carrega tarefas dos grupos do usuário
    const groupTasks = storageTasks.getByUserGroups(user.grupoIds);
    setTasks(groupTasks);
  }, [router]);

  const handleAddTask = (task: Task) => {
    if (!currentUser) return;
    
    const newTask = {
      ...task,
      criadoPor: currentUser.id
    };
    
    storageTasks.add(newTask);
    const groupTasks = storageTasks.getByUserGroups(currentUser.grupoIds);
    setTasks(groupTasks);
  };

  const handleDeleteTask = (id: string) => {
    storageTasks.delete(id);
    if (currentUser) {
      const groupTasks = storageTasks.getByUserGroups(currentUser.grupoIds);
      setTasks(groupTasks);
    }
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    const updates: Partial<Task> = { status };
    
    if (status === 'concluida') {
      updates.dataConclusao = new Date().toISOString();
    } else {
      updates.dataConclusao = undefined;
    }
    
    storageTasks.update(id, updates);
    if (currentUser) {
      const groupTasks = storageTasks.getByUserGroups(currentUser.grupoIds);
      setTasks(groupTasks);
    }
  };

  const filteredTasks = filter === 'todas' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const stats = {
    total: tasks.length,
    pendentes: tasks.filter(t => t.status === 'pendente').length,
    emAndamento: tasks.filter(t => t.status === 'em-andamento').length,
    concluidas: tasks.filter(t => t.status === 'concluida').length
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Navbar />
      
      {/* Ad Banner - apenas para usuários free */}
      {!isPremium && (
        <AdBanner onUpgrade={() => setShowPremiumDialog(true)} />
      )}
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-800">Minhas Tarefas</h2>
              {isPremium && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold">Premium</span>
                </div>
              )}
            </div>
            <p className="text-gray-600">
              Olá, {currentUser.nome}! Gerencie suas pendências de forma eficiente
            </p>
          </div>
          <AddTaskDialog onAdd={handleAddTask} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-800">{stats.emAndamento}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Concluídas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.concluidas}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tabs Filter */}
        <Tabs defaultValue="todas" className="w-full" onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white shadow-md">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
            <TabsTrigger value="concluida">Concluídas</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-gray-500">
                  {filter === 'todas' 
                    ? 'Adicione sua primeira tarefa para começar!'
                    : `Não há tarefas ${filter === 'pendente' ? 'pendentes' : filter === 'em-andamento' ? 'em andamento' : 'concluídas'} no momento.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Ad Banner inferior - apenas para usuários free */}
        {!isPremium && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">
              💡 Remova anúncios e tenha acesso a recursos premium por apenas R$ 10,00
            </p>
            <button
              onClick={() => setShowPremiumDialog(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
            >
              Assinar Premium
            </button>
          </div>
        )}
      </main>

      {/* Premium Dialog */}
      <PremiumDialog 
        open={showPremiumDialog} 
        onOpenChange={setShowPremiumDialog}
      />
    </div>
  );
}
