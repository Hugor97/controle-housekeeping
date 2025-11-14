import { PlanoPreco, PlanoDuracao } from './types';

// Planos Individuais
export const PLANOS_INDIVIDUAIS: PlanoPreco[] = [
  {
    duracao: '1mes',
    nome: 'Mensal',
    preco: 10.00,
    precoMensal: 10.00,
    tipo: 'individual',
  },
  {
    duracao: '3meses',
    nome: 'Trimestral',
    preco: 27.00,
    precoMensal: 9.00,
    economia: 'Economize R$ 3,00',
    tipo: 'individual',
  },
  {
    duracao: '6meses',
    nome: 'Semestral',
    preco: 48.00,
    precoMensal: 8.00,
    economia: 'Economize R$ 12,00',
    tipo: 'individual',
  },
  {
    duracao: '1ano',
    nome: 'Anual',
    preco: 84.00,
    precoMensal: 7.00,
    economia: 'Economize R$ 36,00',
    destaque: true,
    tipo: 'individual',
  },
  {
    duracao: 'vitalicio',
    nome: 'Vitalício',
    preco: 99.99,
    economia: 'Melhor custo-benefício!',
    destaque: true,
    tipo: 'individual',
  },
];

// Planos Empresariais (até 20 colaboradores)
export const PLANOS_EMPRESARIAIS: PlanoPreco[] = [
  {
    duracao: '1mes',
    nome: 'Mensal Empresarial',
    preco: 100.00,
    precoMensal: 100.00,
    tipo: 'empresarial',
  },
  {
    duracao: '3meses',
    nome: 'Trimestral Empresarial',
    preco: 270.00,
    precoMensal: 90.00,
    economia: 'Economize R$ 30,00',
    tipo: 'empresarial',
  },
  {
    duracao: '6meses',
    nome: 'Semestral Empresarial',
    preco: 480.00,
    precoMensal: 80.00,
    economia: 'Economize R$ 120,00',
    tipo: 'empresarial',
  },
  {
    duracao: '1ano',
    nome: 'Anual Empresarial',
    preco: 840.00,
    precoMensal: 70.00,
    economia: 'Economize R$ 360,00',
    destaque: true,
    tipo: 'empresarial',
  },
  {
    duracao: 'vitalicio',
    nome: 'Vitalício Empresarial',
    preco: 999.99,
    economia: 'Melhor custo-benefício!',
    destaque: true,
    tipo: 'empresarial',
  },
];

export const PLANOS = [...PLANOS_INDIVIDUAIS, ...PLANOS_EMPRESARIAIS];

export function calcularDataExpiracao(plano: PlanoDuracao): string | undefined {
  if (plano === 'vitalicio') return undefined;
  
  const agora = new Date();
  
  switch (plano) {
    case '1mes':
      agora.setMonth(agora.getMonth() + 1);
      break;
    case '3meses':
      agora.setMonth(agora.getMonth() + 3);
      break;
    case '6meses':
      agora.setMonth(agora.getMonth() + 6);
      break;
    case '1ano':
      agora.setFullYear(agora.getFullYear() + 1);
      break;
  }
  
  return agora.toISOString();
}
