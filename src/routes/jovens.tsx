import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Award,
  CheckCircle2,
  X
} from "lucide-react";

interface Jovem {
  id: string;
  nome: string;
  registroUeb: string;
  email: string;
  patrulha: string;
  dataNascimento: string;
  seisCores: string[];
}

const PATRULHAS_DISPONIVEIS = ["Fênix", "Harpia", "Lobo Guará"];

export default function JovensRoute() {
  const [jovens, setJovens] = useState<Jovem[]>([
    {
      id: "1",
      nome: "Lucas Silva",
      registroUeb: "123456-7",
      email: "lucas.silva@escoteiros.example",
      patrulha: "Fênix",
      dataNascimento: "2012-05-14",
      seisCores: ["Azul", "Verde"]
    },
    {
      id: "2",
      nome: "Mariana Souza",
      registroUeb: "765432-1",
      email: "mariana.souza@escoteiros.example",
      patrulha: "Harpia",
      dataNascimento: "2011-10-22",
      seisCores: ["Amarelo"]
    }
  ]);

  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [jovemEmEdicao, setJovemEmEdicao] = useState<Jovem | null>(null);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [registroUeb, setRegistroUeb] = useState("");
  const [email, setEmail] = useState("");
  const [patrulha, setPatrulha] = useState(PATRULHAS_DISPONIVEIS[0]);
  const [dataNascimento, setDataNascimento] = useState("");

  const abrirModalNovo = () => {
    setJovemEmEdicao(null);
    setNome("");
    setRegistroUeb("");
    setEmail("");
    setPatrulha(PATRULHAS_DISPONIVEIS[0]);
    setDataNascimento("");
    setModalAberto(true);
  };

  const abrirModalEdicao = (jovem: Jovem) => {
    setJovemEmEdicao(jovem);
    setNome(jovem.nome);
    setRegistroUeb(jovem.registroUeb);
    setEmail(jovem.email);
    setPatrulha(jovem.patrulha);
    setDataNascimento(jovem.dataNascimento);
    setModalAberto(true);
  };

  const salvarJovem = (e: React.FormEvent) => {
    e.preventDefault();
    if (jovemEmEdicao) {
      setJovens(jovens.map(j => j.id === jovemEmEdicao.id ? {
        ...j,
        nome,
        registroUeb,
        email,
        patrulha,
        dataNascimento
      } : j));
    } else {
      const novoJovem: Jovem = {
        id: String(Date.now()),
        nome,
        registroUeb,
        email,
        patrulha,
        dataNascimento,
        seisCores: []
      };
      setJovens([...jovens, novoJovem]);
    }
    setModalAberto(false);
  };

  const excluirJovem = (id: string) => {
    if (confirm("Deseja realmente excluir este jovem?")) {
      setJovens(jovens.filter(j => j.id !== id));
    }
  };

  const jovensFiltrados = jovens.filter(j => 
    j.nome.toLowerCase().includes(busca.toLowerCase()) ||
    j.registroUeb.toLowerCase().includes(busca.toLowerCase()) ||
    j.patrulha.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-amber-600" /> Gestão de Jovens
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Controle de membros da Tropa Escoteira, registros UEB e patrulhas.
          </p>
        </div>
        <button
          onClick={abrirModalNovo}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus size={18} /> Novo Jovem
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome, registro UEB ou patrulha..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700 shadow-sm"
        />
      </div>

      {/* Lista de Jovens (Cards / Tabela) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jovensFiltrados.map((jovem) => (
          <div key={jovem.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start">
                <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                  {jovem.patrulha}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => abrirModalEdicao(jovem)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => excluirJovem(jovem.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 text-lg mt-3">{jovem.nome}</h3>
              
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-slate-400" />
                  <span>Reg. UEB: <strong className="text-slate-700">{jovem.registroUeb}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-slate-400" />
                  <span className="truncate">{jovem.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Nasc: {jovem.dataNascimento}</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 size={14} /> Ativo
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cadastro / Edição */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {jovemEmEdicao ? "Editar Jovem" : "Cadastrar Novo Jovem"}
              </h2>
              <button 
                onClick={() => setModalAberto(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarJovem} className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700"
                  placeholder="Ex: João Pedro"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registro UEB</label>
                  <input
                    type="text"
                    required
                    value={registroUeb}
                    onChange={(e) => setRegistroUeb(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700"
                    placeholder="Ex: 123456-7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patrulha</label>
                  <select
                    value={patrulha}
                    onChange={(e) => setPatrulha(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700 bg-white"
                  >
                    {PATRULHAS_DISPONIVEIS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700"
                  placeholder="exemplo@escoteiros.example"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  required
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors shadow-sm"
                >
                  {jovemEmEdicao ? "Salvar Alterações" : "Cadastrar Jovem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}