"use client";

import { Task } from '@/lib/types';
import { Calendar, Clock, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

export function TaskCard({ task, onDelete, onStatusChange }: TaskCardProps) {
  const statusColors = {
    'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'em-andamento': 'bg-blue-100 text-blue-800 border-blue-300',
    'concluida': 'bg-green-100 text-green-800 border-green-300'
  };

  const prioridadeColors = {
    'baixa': 'bg-gray-100 text-gray-700',
    'media': 'bg-orange-100 text-orange-700',
    'alta': 'bg-red-100 text-red-700'
  };

  const statusLabels = {
    'pendente': 'Pendente',
    'em-andamento': 'Em Andamento',
    'concluida': 'Concluída'
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800 mb-1">{task.titulo}</h3>
          <p className="text-gray-600 text-sm">{task.descricao}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={statusColors[task.status]}>
          {statusLabels[task.status]}
        </Badge>
        <Badge className={prioridadeColors[task.prioridade]}>
          {task.prioridade.charAt(0).toUpperCase() + task.prioridade.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Início: {new Date(task.dataInicio).toLocaleDateString('pt-BR')}</span>
        </div>
        {task.dataConclusao && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span>Conclusão: {new Date(task.dataConclusao).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={task.status === 'pendente' ? 'default' : 'outline'}
          onClick={() => onStatusChange(task.id, 'pendente')}
          className="flex-1 text-xs"
        >
          Pendente
        </Button>
        <Button
          size="sm"
          variant={task.status === 'em-andamento' ? 'default' : 'outline'}
          onClick={() => onStatusChange(task.id, 'em-andamento')}
          className="flex-1 text-xs"
        >
          Em Andamento
        </Button>
        <Button
          size="sm"
          variant={task.status === 'concluida' ? 'default' : 'outline'}
          onClick={() => onStatusChange(task.id, 'concluida')}
          className="flex-1 text-xs"
        >
          Concluída
        </Button>
      </div>
    </Card>
  );
}
