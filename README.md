# 🎨 Estúdio Criativo (BannerGen)

Um poderoso estúdio de design diretamente no navegador. Esta aplicação foi construída para automatizar tarefas de marketing, permitindo a criação de banners complexos, remoção de fundos com Inteligência Artificial e padronização de imagens em lote — **tudo rodando no client-side (no browser), sem a necessidade de um backend.**

Este projeto demonstra o domínio em manipulação de Canvas avançado, gerenciamento de estados complexos, uso de Web Workers para processamento de IA em tempo real e boas práticas de UI/UX.

---

## ✨ Funcionalidades Principais

### 1. 🖌️ Editor Livre (Estilo Canva)
Um editor visual drag-and-drop completo construído sobre o ecossistema Konva.
* **Múltiplas Camadas**: Suporte a imagens, textos e formas geométricas (retângulos, círculos).
* **Guia Magnética (Snapping)**: Algoritmos matemáticos que criam um alinhamento perfeito e "magnético" nas bordas e no centro do canvas (exatamente como ferramentas profissionais de design).
* **Edição de Texto In-line**: Digite e altere fontes e cores em tempo real sem perder o estado.
* **Cor de Fundo & Shapes**: Permite compor layouts complexos (divisões de cores, tarjas, etc.) definindo cores de fundo e manipulando retângulos e círculos.

### 2. 🪄 Gerador Mágico (Remoção de Fundo com IA)
* Utiliza modelos de **Machine Learning no Navegador** via WebAssembly (Hugging Face Transformers.js).
* Capaz de analisar a foto de um produto, remover seu fundo (Background Removal) de forma autônoma e gerar um banner no formato exato da campanha em questão de segundos. Tudo local e com total privacidade dos dados.

### 3. 📦 Padronizador de Imagens em Lote
Uma ferramenta focada em alta produtividade para e-commerces e campanhas massivas:
* **Upload em Lote**: Aceita o envio de múltiplas fotos ao mesmo tempo.
* **Corte Inteligente (Object-Fit: Cover)**: Redimensiona dezenas de imagens para uma resolução alvo (ex: 1200x600) garantindo que a imagem ocupe todo o espaço sem nenhuma distorção.
* **Exportação em ZIP**: As imagens são processadas e empacotadas em um único arquivo `.zip` diretamente na memória do navegador.

### 4. 🌙 UI/UX Moderna
* Design limpo inspirado nas melhores práticas de experiência do usuário.
* Suporte nativo a **Dark Mode** integrado em todos os componentes.
* Ícones vetoriais modernos e tipografia aprimorada com Tailwind CSS v4.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenhado utilizando o que há de mais moderno no ecossistema React, com foco em performance e manutenibilidade.

* **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
* **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) (com suporte avançado a Dark Mode nativo)
* **Gerenciamento de Estado Global**: [Zustand](https://github.com/pmndrs/zustand) (Garante que a UI reaja aos movimentos do Canvas instantaneamente sem loops de renderização).
* **Motor de Renderização (Canvas)**: [react-konva](https://konvajs.org/docs/react/index.html) e Konva.js
* **Inteligência Artificial (Client-Side)**: [@huggingface/transformers](https://huggingface.co/docs/transformers.js/index) (Processamento do modelo onnx via Wasm)
* **Utilitários**:
  * `jszip`: Empacotamento client-side assíncrono.
  * `use-image`: Carregamento seguro e otimizado de blobs em texturas do WebGL/Canvas.

---

## 🚀 Como Rodar Localmente

Para testar as incríveis funcionalidades do Estúdio Criativo na sua máquina:

1. Clone o repositório:
```bash
git clone https://github.com/daviteclas/banner-generator.git
```

2. Entre no diretório do projeto:
```bash
cd banner-generator
```

3. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra o navegador em `http://localhost:5173`

---

> Desenvolvido com foco na construção de arquiteturas escaláveis para front-end, explorando manipulação de DOM/Canvas pesado e integração com IA no lado do cliente. Aberto para feedbacks e conexões no LinkedIn!
