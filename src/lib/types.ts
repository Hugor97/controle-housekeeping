export type TaskStatus = 'pendente' | 'em-andamento' | 'concluida';

export interface Task {
  id: string;
  titulo: string;
  descricao: string;
  status: TaskStatus;
  dataInicio: string;
  dataConclusao?: string;
  prioridade: 'baixa' | 'media' | 'alta';
  criadoEm: string;
  atribuidoPara?: string; // ID do usuário responsável
  criadoPor: string; // ID do usuário que criou
  grupoId: string; // ID do grupo ao qual a tarefa pertence
}

export interface RelatorioEficiencia {
  totalTarefas: number;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
  taxaConclusao: number;
  tempoMedioConclusao: number;
  tarefasPorPrioridade: {
    alta: number;
    media: number;
    baixa: number;
  };
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  grupoIds: string[]; // Array de IDs dos grupos que o usuário pertence
  isPremium: boolean;
  isAdmin: boolean;
  criadoEm: string;
  planoEmpresarial?: PlanoEmpresarial; // Dados do plano empresarial se for dono
  emailPrincipal?: string; // Email do dono da conta empresarial (se for colaborador)
}

export interface Grupo {
  id: string;
  nome: string;
  criadoEm: string;
  membros: string[]; // IDs dos usuários
}

export type PlanoDuracao = 'vitalicio' | '1mes' | '3meses' | '6meses' | '1ano';
export type TipoPlano = 'individual' | 'empresarial';

export interface PlanoPreco {
  duracao: PlanoDuracao;
  nome: string;
  preco: number;
  precoMensal?: number;
  economia?: string;
  destaque?: boolean;
  tipo: TipoPlano;
}

export interface Subscription {
  userId: string;
  isPremium: boolean;
  dataCompra?: string;
  valor?: number;
  plano?: PlanoDuracao;
  dataExpiracao?: string;
  voucherUsado?: string;
  tipo?: TipoPlano;
}

export interface Voucher {
  id: string;
  codigo: string;
  plano: PlanoDuracao;
  usado: boolean;
  usadoPor?: string;
  criadoEm: string;
  usadoEm?: string;
  tipo: TipoPlano;
}

export interface PlanoEmpresarial {
  emailsColaboradores: string[]; // Máximo 20
  dataCompra: string;
  plano: PlanoDuracao;
  dataExpiracao?: string;
}
