"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storageUsers, storageVouchers } from '@/lib/storage';
import { PlanoDuracao, Voucher } from '@/lib/types';
import { Gift, Copy, Check, Crown, ArrowLeft, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(storageUsers.getCurrentUser());
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoDuracao>('vitalicio');
  const [quantidade, setQuantidade] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const user = storageUsers.getCurrentUser();
    
    if (!user || !user.isAdmin) {
      alert('Acesso negado. Apenas administradores podem acessar esta página.');
      router.push('/');
      return;
    }

    setCurrentUser(user);
    loadVouchers();
  }, [router]);

  const loadVouchers = () => {
    const allVouchers = storageVouchers.getAll();
    setVouchers(allVouchers.sort((a, b) => 
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    ));
  };

  const generateRandomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateVouchers = () => {
    if (quantidade < 1 || quantidade > 50) {
      alert('Quantidade deve ser entre 1 e 50 vouchers.');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const novosVouchers: Voucher[] = [];

      for (let i = 0; i < quantidade; i++) {
        const voucher: Voucher = {
          id: Math.random().toString(36).substring(2, 9),
          codigo: generateRandomCode(),
          plano: planoSelecionado,
          usado: false,
          criadoEm: new Date().toISOString()
        };
        storageVouchers.add(voucher);
        novosVouchers.push(voucher);
      }

      setIsGenerating(false);
      loadVouchers();
      
      alert(`${quantidade} voucher(s) gerado(s) com sucesso! 🎉`);
      setQuantidade(1);
    }, 1000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteVoucher = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este voucher?')) {
      const allVouchers = storageVouchers.getAll();
      const filtered = allVouchers.filter(v => v.id !== id);
      storageVouchers.save(filtered);
      loadVouchers();
    }
  };

  const planoNomes: Record<PlanoDuracao, string> = {
    'vitalicio': 'Vitalício',
    '1mes': '1 Mês',
    '3meses': '3 Meses',
    '6meses': '6 Meses',
    '1ano': '1 Ano'
  };

  if (!currentUser || !currentUser.isAdmin) {
    return null;
  }

  const vouchersDisponiveis = vouchers.filter(v => !v.usado);
  const vouchersUsados = vouchers.filter(v => v.usado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Painel de Administração</h1>
              <p className="text-gray-600">Gerencie vouchers premium</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gerador de Vouchers */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Gerar Vouchers
              </CardTitle>
              <CardDescription>
                Crie vouchers para presentear pessoas com acesso premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plano">Tipo de Plano</Label>
                <Select
                  value={planoSelecionado}
                  onValueChange={(value) => setPlanoSelecionado(value as PlanoDuracao)}
                >
                  <SelectTrigger id="plano">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vitalicio">Vitalício - R$ 99,99</SelectItem>
                    <SelectItem value="1mes">1 Mês - R$ 10,00</SelectItem>
                    <SelectItem value="3meses">3 Meses - R$ 27,00</SelectItem>
                    <SelectItem value="6meses">6 Meses - R$ 48,00</SelectItem>
                    <SelectItem value="1ano">1 Ano - R$ 84,00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  max="50"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-gray-500">Máximo: 50 vouchers por vez</p>
              </div>

              <Button
                onClick={handleGenerateVouchers}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gerando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Gerar {quantidade} Voucher{quantidade > 1 ? 's' : ''}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Resumo dos vouchers gerados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-1">Disponíveis</p>
                  <p className="text-3xl font-bold text-green-700">{vouchersDisponiveis.length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-1">Usados</p>
                  <p className="text-3xl font-bold text-blue-700">{vouchersUsados.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-1">Total</p>
                  <p className="text-3xl font-bold text-purple-700">{vouchers.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium mb-1">Taxa de Uso</p>
                  <p className="text-3xl font-bold text-orange-700">
                    {vouchers.length > 0 ? Math.round((vouchersUsados.length / vouchers.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Vouchers */}
        <Card className="shadow-xl mt-6">
          <CardHeader>
            <CardTitle>Vouchers Gerados</CardTitle>
            <CardDescription>
              Lista de todos os vouchers criados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vouchers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum voucher gerado ainda</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      voucher.usado
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="text-lg font-bold text-gray-800 bg-white px-3 py-1 rounded border">
                          {voucher.codigo}
                        </code>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          voucher.usado
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-green-200 text-green-700'
                        }`}>
                          {voucher.usado ? 'USADO' : 'DISPONÍVEL'}
                        </span>
                        <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded border">
                          {planoNomes[voucher.plano]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Criado em: {new Date(voucher.criadoEm).toLocaleDateString('pt-BR')}
                        {voucher.usado && voucher.usadoEm && (
                          <> • Usado em: {new Date(voucher.usadoEm).toLocaleDateString('pt-BR')}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!voucher.usado && (
                        <Button
                          onClick={() => handleCopyCode(voucher.codigo)}
                          variant="outline"
                          size="sm"
                        >
                          {copiedCode === voucher.codigo ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteVoucher(voucher.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
