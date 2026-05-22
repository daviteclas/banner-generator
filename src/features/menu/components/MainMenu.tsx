import { useEditorStore } from '../../../store/useEditorStore';

export const MainMenu = () => {
  const setView = useEditorStore((state) => state.setView);
  const clearLayers = useEditorStore((state) => state.clearLayers);
  const isDarkMode = useEditorStore((state) => state.isDarkMode);
  const toggleDarkMode = useEditorStore((state) => state.toggleDarkMode);

  const handleOpenEditor = () => {
    setView('editor');
  };

  const handleOpenAutoGen = () => {
    clearLayers();
    setView('auto-gen');
  };

  const handleOpenStandardizer = () => {
    clearLayers();
    setView('standardizer');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 w-full p-4 transition-colors relative">
      <button 
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        title="Alternar Tema"
      >
        <span className="material-symbols-outlined text-2xl">
          {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
            Estúdio Criativo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Escolha uma das ferramentas abaixo para criar seus banners ou padronizar suas imagens.
          </p>
        </div>

        {/* 
          Container dos cartões. 
          Usando grid responsivo. 
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card: Gerador Automático (Mágico) */}
          <div 
            onClick={handleOpenAutoGen}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-transparent hover:border-indigo-400 dark:hover:border-indigo-500 flex flex-col"
          >
            {/* Destaque visual */}
            <div className="h-32 bg-linear-to-r from-purple-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-white text-6xl opacity-90 group-hover:scale-110 transition-transform duration-300">
                auto_awesome
              </span>
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                Gerador Mágico
                <span className="bg-linear-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                  Novo
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                Remova automaticamente o fundo das suas imagens usando IA e gere banners incríveis em instantes.
              </p>
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-2 transition-transform">
                Iniciar magia <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Card: Editor Manual (Canvas Livre) */}
          <div 
            onClick={handleOpenEditor}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-transparent hover:border-blue-400 dark:hover:border-blue-500 flex flex-col"
          >
            {/* Destaque visual */}
            <div className="h-32 bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-white text-6xl opacity-90 group-hover:scale-110 transition-transform duration-300">
                edit
              </span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Editor Livre
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                Uma tela em branco para você dar asas à imaginação. Adicione fotos, textos, edite livremente e crie peças únicas.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                Criar do zero <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Card: Padronizador de Imagens */}
          <div 
            onClick={handleOpenStandardizer}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-transparent hover:border-green-400 dark:hover:border-green-500 flex flex-col"
          >
            {/* Destaque visual */}
            <div className="h-32 bg-linear-to-r from-green-500 to-emerald-600 flex items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-white text-6xl opacity-90 group-hover:scale-110 transition-transform duration-300">
                photo_library
              </span>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Padronizador
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                Envie várias fotos de uma vez e deixe-as todas no mesmo tamanho perfeito sem distorcer. Baixe tudo em um clique.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
                Padronizar lote <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
