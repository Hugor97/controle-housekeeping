"use client";

import { useState, useEffect } from 'react';
import { Task, RelatorioEficiencia } from '@/lib/types';
import { storageTasks } from '@/lib/storage';
import { Navbar } from '@/components/custom/navbar';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function RelatoriosPage() {
  const [relatorio, setRelatorio] = useState<RelatorioEficiencia | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const allTasks = storageTasks.getAll();
    setTasks(allTasks);

    // Calcular relatório
    const concluidas = allTasks.filter(t => t.status === 'concluida');
    const emAndamento = allTasks.filter(t => t.status === 'em-andamento');
    const pendentes = allTasks.filter(t => t.status === 'pendente');

    // Calcular tempo médio de conclusão
    let tempoTotal = 0;
    let countComTempo = 0;
    
    concluidas.forEach(task => {
      if (task.dataConclusao) {
        const inicio = new Date(task.dataInicio).getTime();
        const fim = new Date(task.dataConclusao).getTime();
        const dias = (fim - inicio) / (1000 * 60 * 60 * 24);
        tempoTotal += dias;
        countComTempo++;
      }
    });

    const tempoMedio = countComTempo > 0 ? tempoTotal / countComTempo : 0;

    const relatorioData: RelatorioEficiencia = {
      totalTarefas: allTasks.length,
      concluidas: concluidas.length,
      emAndamento: emAndamento.length,
      pendentes: pendentes.length,
      taxaConclusao: allTasks.length > 0 ? (concluidas.length / allTasks.length) * 100 : 0,
      tempoMedioConclusao: tempoMedio,
      tarefasPorPrioridade: {
        alta: allTasks.filter(t => t.prioridade === 'alta').length,
        media: allTasks.filter(t => t.prioridade === 'media').length,
        baixa: allTasks.filter(t => t.prioridade === 'baixa').length
      }
    };

    setRelatorio(relatorioData);
  }, []);

  if (!relatorio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Relatórios de Eficiência</h2>
          <p className="text-gray-600">Análise completa do seu desempenho</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Total de Tarefas</p>
                <p className="text-4xl font-bold">{relatorio.totalTarefas}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Taxa de Conclusão</p>
                <p className="text-4xl font-bold">{relatorio.taxaConclusao.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Tempo Médio</p>
                <p className="text-4xl font-bold">{relatorio.tempoMedioConclusao.toFixed(1)}</p>
                <p className="text-xs opacity-80">dias</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 opacity-80" />
              <div className="text-right">
                <p className="text-sm opacity-90">Em Andamento</p>
                <p className="text-4xl font-bold">{relatorio.emAndamento}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
              Distribuição por Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Concluídas</span>
                  <span className="text-gray-900 font-bold">{relatorio.concluidas}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${relatorio.totalTarefas > 0 ? (relatorio.concluidas / relatorio.totalTarefas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Em Andamento</span>
                  <span className="text-gray-900 font-bold">{relatorio.emAndamento}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${relatorio.totalTarefas > 0 ? (relatorio.emAndamento / relatorio.totalTarefas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Pendentes</span>
                  <span className="text-gray-900 font-bold">{relatorio.pendentes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${relatorio.totalTarefas > 0 ? (relatorio.pendentes / relatorio.totalTarefas) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Priority Distribution */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
              Distribuição por Prioridade
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Alta Prioridade</span>
                  <span className="text-gray-900 font-bold">{relatorio.tarefasPorPrioridade.alta}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${relatorio.totalTarefas > 0 ? (relatorio.tarefasPorPrioridade.alta / relatorio.totalTarefas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Média Prioridade</span>
                  <span className="text-gray-900 font-bold">{relatorio.tarefasPorPrioridade.media}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${relatorio.totalTarefas > 0 ? (relatorio.tarefasPorPrioridade.media / relatorio.totalTarefas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Baixa Prioridade</span>
                  <span className="text-gray-900 font-bold">{relatorio.tarefasPorPrioridade.baixa}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gray-500 h-3 rounded-full transition-all"
                    style={{ width: `${relatorio.totalTarefas > 0 ? (relatorio.tarefasPorPrioridade.baixa / relatorio.totalTarefas) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Insights e Recomendações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatorio.taxaConclusao >= 70 ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="font-semibold text-green-800 mb-1">✓ Excelente Desempenho!</p>
                <p className="text-sm text-green-700">
                  Sua taxa de conclusão está acima de 70%. Continue assim!
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="font-semibold text-yellow-800 mb-1">⚠ Atenção Necessária</p>
                <p className="text-sm text-yellow-700">
                  Sua taxa de conclusão está abaixo de 70%. Foque em finalizar tarefas pendentes.
                </p>
              </div>
            )}

            {relatorio.tempoMedioConclusao <= 7 ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-800 mb-1">⚡ Velocidade Ótima</p>
                <p className="text-sm text-blue-700">
                  Você está concluindo tarefas em média em {relatorio.tempoMedioConclusao.toFixed(1)} dias. Excelente!
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <p className="font-semibold text-orange-800 mb-1">🐌 Melhore a Velocidade</p>
                <p className="text-sm text-orange-700">
                  Tempo médio de {relatorio.tempoMedioConclusao.toFixed(1)} dias. Tente quebrar tarefas em partes menores.
                </p>
              </div>
            )}

            {relatorio.pendentes > relatorio.concluidas ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="font-semibold text-red-800 mb-1">🎯 Priorize Conclusões</p>
                <p className="text-sm text-red-700">
                  Você tem mais tarefas pendentes ({relatorio.pendentes}) do que concluídas ({relatorio.concluidas}).
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="font-semibold text-green-800 mb-1">🎉 Ótimo Equilíbrio!</p>
                <p className="text-sm text-green-700">
                  Você está mantendo um bom equilíbrio entre tarefas concluídas e pendentes.
                </p>
              </div>
            )}

            {relatorio.tarefasPorPrioridade.alta > 5 ? (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="font-semibold text-purple-800 mb-1">⚡ Muitas Prioridades Altas</p>
                <p className="text-sm text-purple-700">
                  {relatorio.tarefasPorPrioridade.alta} tarefas de alta prioridade. Foque nelas primeiro!
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-800 mb-1">✓ Prioridades Controladas</p>
                <p className="text-sm text-blue-700">
                  Suas prioridades estão bem distribuídas. Continue gerenciando bem!
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
