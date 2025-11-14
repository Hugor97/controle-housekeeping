"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Crown, Zap, Gift, Sparkles, Users, Building2 } from 'lucide-react';
import { storageUsers, storageSubscriptions, storageVouchers } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { PLANOS_INDIVIDUAIS, PLANOS_EMPRESARIAIS, calcularDataExpiracao } from '@/lib/planos';
import { PlanoDuracao, TipoPlano } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumDialog({ open, onOpenChange }: PremiumDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoDuracao>('1ano');
  const [tipoPlano, setTipoPlano] = useState<TipoPlano>('individual');
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const router = useRouter();

  const benefits = [
    'Sem anúncios',
    'Acesso ilimitado a todas as funcionalidades',
    'Suporte prioritário',
    'Relatórios avançados',
    'Backup automático na nuvem',
    'Temas personalizados'
  ];

  const benefitsEmpresarial = [
    'Todos os benefícios do plano individual',
    'Até 20 colaboradores com acesso Premium',
    'Gerenciamento centralizado de usuários',
    'Adicionar e remover colaboradores facilmente',
    'Dashboard administrativo exclusivo',
    'Relatórios consolidados da equipe'
  ];

  const handlePurchase = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const currentUser = storageUsers.getCurrentUser();
      
      if (currentUser) {
        const planos = tipoPlano === 'individual' ? PLANOS_INDIVIDUAIS : PLANOS_EMPRESARIAIS;
        const planoInfo = planos.find(p => p.duracao === planoSelecionado);
        
        // Atualiza usuário para premium
        const updateData: any = { isPremium: true };
        
        // Se for plano empresarial, inicializa estrutura
        if (tipoPlano === 'empresarial') {
          updateData.planoEmpresarial = {
            emailsColaboradores: [],
            dataCompra: new Date().toISOString(),
            plano: planoSelecionado,
            dataExpiracao: calcularDataExpiracao(planoSelecionado)
          };
        }
        
        storageUsers.update(currentUser.id, updateData);
        
        // Salva assinatura
        storageSubscriptions.save({
          userId: currentUser.id,
          isPremium: true,
          dataCompra: new Date().toISOString(),
          valor: planoInfo?.preco || 10.00,
          plano: planoSelecionado,
          dataExpiracao: calcularDataExpiracao(planoSelecionado),
          tipo: tipoPlano
        });

        // Atualiza o usuário atual
        const updatedUser = storageUsers.getById(currentUser.id);
        if (updatedUser) {
          storageUsers.setCurrentUser(updatedUser);
        }
      }
      
      setIsProcessing(false);
      onOpenChange(false);
      
      router.refresh();
      window.location.reload();
    }, 2000);
  };

  const handleVoucherRedeem = () => {
    if (!voucherCode.trim()) {
      alert('Digite um código de voucher válido.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const currentUser = storageUsers.getCurrentUser();
      if (!currentUser) {
        alert('Usuário não encontrado.');
        setIsProcessing(false);
        return;
      }

      const voucher = storageVouchers.getByCodigo(voucherCode);
      
      if (!voucher) {
        alert('Voucher inválido.');
        setIsProcessing(false);
        return;
      }

      if (voucher.usado) {
        alert('Este voucher já foi utilizado.');
        setIsProcessing(false);
        return;
      }

      // Marca voucher como usado
      storageVouchers.marcarComoUsado(voucherCode, currentUser.id);

      // Atualiza usuário para premium
      const updateData: any = { isPremium: true };
      
      // Se for voucher empresarial, inicializa estrutura
      if (voucher.tipo === 'empresarial') {
        updateData.planoEmpresarial = {
          emailsColaboradores: [],
          dataCompra: new Date().toISOString(),
          plano: voucher.plano,
          dataExpiracao: calcularDataExpiracao(voucher.plano)
        };
      }
      
      storageUsers.update(currentUser.id, updateData);

      // Salva assinatura
      storageSubscriptions.save({
        userId: currentUser.id,
        isPremium: true,
        dataCompra: new Date().toISOString(),
        valor: 0,
        plano: voucher.plano,
        dataExpiracao: calcularDataExpiracao(voucher.plano),
        voucherUsado: voucher.codigo,
        tipo: voucher.tipo
      });

      // Atualiza o usuário atual
      const updatedUser = storageUsers.getById(currentUser.id);
      if (updatedUser) {
        storageUsers.setCurrentUser(updatedUser);
      }

      setIsProcessing(false);
      onOpenChange(false);
      
      alert('Voucher resgatado com sucesso! Você agora é Premium! 🎉');
      router.refresh();
      window.location.reload();
    }, 1500);
  };

  const planosAtuais = tipoPlano === 'individual' ? PLANOS_INDIVIDUAIS : PLANOS_EMPRESARIAIS;
  const planoAtual = planosAtuais.find(p => p.duracao === planoSelecionado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full">
              <Crown className="w-12 h-12 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Pendências Pro Premium
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Escolha o plano ideal para você ou sua empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tabs Individual/Empresarial */}
          <Tabs value={tipoPlano} onValueChange={(v) => setTipoPlano(v as TipoPlano)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="empresarial" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresarial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-6 mt-6">
              {/* Planos Individuais */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {PLANOS_INDIVIDUAIS.map((plano) => (
                  <button
                    key={plano.duracao}
                    onClick={() => setPlanoSelecionado(plano.duracao)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      planoSelecionado === plano.duracao
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plano.destaque ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    {plano.destaque && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        POPULAR
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-bold text-gray-800 mb-1 text-sm">{plano.nome}</p>
                      {plano.precoMensal && (
                        <p className="text-xs text-gray-500 mb-1">
                          R$ {plano.precoMensal.toFixed(2)}/mês
                        </p>
                      )}
                      <p className="text-xl font-bold text-blue-600">
                        R$ {plano.preco.toFixed(2)}
                      </p>
                      {plano.economia && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          {plano.economia}
                        </p>
                      )}
                      {plano.duracao === 'vitalicio' && (
                        <p className="text-xs text-purple-600 font-semibold mt-1">
                          Para sempre
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Benefícios Individual */}
              <div className="space-y-3">
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  O que você ganha:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="empresarial" className="space-y-6 mt-6">
              {/* Planos Empresariais */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-800">Plano Empresarial</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Gerencie até <span className="font-bold text-blue-600">20 colaboradores</span> com acesso Premium completo
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {PLANOS_EMPRESARIAIS.map((plano) => (
                  <button
                    key={plano.duracao}
                    onClick={() => setPlanoSelecionado(plano.duracao)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      planoSelecionado === plano.duracao
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${plano.destaque ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    {plano.destaque && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        POPULAR
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-bold text-gray-800 mb-1 text-sm">{plano.nome}</p>
                      {plano.precoMensal && (
                        <p className="text-xs text-gray-500 mb-1">
                          R$ {plano.precoMensal.toFixed(2)}/mês
                        </p>
                      )}
                      <p className="text-xl font-bold text-blue-600">
                        R$ {plano.preco.toFixed(2)}
                      </p>
                      {plano.economia && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          {plano.economia}
                        </p>
                      )}
                      {plano.duracao === 'vitalicio' && (
                        <p className="text-xs text-purple-600 font-semibold mt-1">
                          Para sempre
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Benefícios Empresarial */}
              <div className="space-y-3">
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  O que sua empresa ganha:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {benefitsEmpresarial.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1 mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-gray-700 text-sm">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Preço selecionado */}
          {planoAtual && (
            <div className="text-center bg-gradient-to-br from-blue-50 to-slate-100 p-6 rounded-xl">
              <p className="text-gray-600 mb-2">Plano selecionado: {planoAtual.nome}</p>
              <p className="text-5xl font-bold text-gray-800 mb-1">
                R$ {planoAtual.preco.toFixed(2)}
              </p>
              {planoAtual.duracao === 'vitalicio' ? (
                <p className="text-gray-600">pagamento único • acesso vitalício</p>
              ) : (
                <p className="text-gray-600">
                  {planoAtual.precoMensal && `R$ ${planoAtual.precoMensal.toFixed(2)}/mês • `}
                  {planoAtual.economia}
                </p>
              )}
              {tipoPlano === 'empresarial' && (
                <p className="text-sm text-blue-600 font-semibold mt-2">
                  Até 20 colaboradores inclusos
                </p>
              )}
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-6 text-lg"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Assinar Agora
                </span>
              )}
            </Button>

            {/* Voucher */}
            {!showVoucherInput ? (
              <Button
                onClick={() => setShowVoucherInput(true)}
                variant="outline"
                className="w-full"
              >
                <Gift className="w-4 h-4 mr-2" />
                Tenho um voucher
              </Button>
            ) : (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <Label htmlFor="voucher">Código do Voucher</Label>
                <div className="flex gap-2">
                  <Input
                    id="voucher"
                    placeholder="Digite o código"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVoucherRedeem}
                    disabled={isProcessing || !voucherCode.trim()}
                  >
                    {isProcessing ? 'Validando...' : 'Resgatar'}
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setShowVoucherInput(false);
                    setVoucherCode('');
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-gray-500">
            Pagamento seguro • Cancele quando quiser
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
