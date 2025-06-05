import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 API chamada recebida!')
    
    const { clientName, colors } = await request.json()
    console.log('📦 Dados recebidos:', { clientName, colors })
    
    // Verificar variáveis de ambiente
    const githubToken = process.env.GITHUB_TOKEN
    const githubUsername = process.env.GITHUB_USERNAME
    
    console.log('🔑 GitHub Token:', githubToken ? `Configurado (${githubToken.substring(0, 10)}...)` : 'NÃO CONFIGURADO')
    console.log('👤 GitHub Username:', githubUsername || 'NÃO CONFIGURADO')
    
    if (!githubToken || !githubUsername) {
      return NextResponse.json({
        success: false,
        error: 'GitHub token ou username não configurados no .env.local'
      }, { status: 400 })
    }
    
    // Criar repositório no GitHub
    const repoName = clientName.toLowerCase().replace(/\s+/g, '-')
    console.log(`🚀 Criando repositório: ${repoName}`)
    
    // 1. Criar o repositório
    const createRepoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: `Design System personalizado para ${clientName}`,
        private: false,
        auto_init: true,
      })
    })

    console.log('📡 GitHub API status:', createRepoResponse.status)

    if (!createRepoResponse.ok) {
      const errorData = await createRepoResponse.json()
      console.error('❌ Erro da API do GitHub:', errorData)
      return NextResponse.json({
        success: false,
        error: `Erro ao criar repositório: ${errorData.message || 'Erro desconhecido'}`
      }, { status: 400 })
    }

    const repoData = await createRepoResponse.json()
    console.log('✅ Repositório criado:', repoData.html_url)
    
    // 2. Aguardar um pouco para o repositório ser criado
    console.log('⏳ Aguardando 3 segundos...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 3. Criar todos os arquivos do Design System
    await Promise.all([
      createThemeConfig(repoName, clientName, colors, githubToken, githubUsername),
      createIndexHTML(repoName, clientName, colors, githubToken, githubUsername),
      createStylesCSS(repoName, clientName, colors, githubToken, githubUsername),
      createComponentsJS(repoName, clientName, colors, githubToken, githubUsername),
      createReadme(repoName, clientName, colors, githubToken, githubUsername),
      createPackageJSON(repoName, clientName, githubToken, githubUsername)
    ])
    
    // 4. Ativar GitHub Pages
    await enableGitHubPages(repoName, githubToken, githubUsername)
    
    console.log('🎉 Design System completo criado!')
    
    return NextResponse.json({
      success: true,
      repoUrl: repoData.html_url,
      cloneUrl: repoData.clone_url,
      repoName: repoName,
      previewUrl: `https://${githubUsername}.github.io/${repoName}`,
      message: `Design System criado! Página preview estará disponível em alguns minutos.`
    })
    
  } catch (error: any) {
    console.error('💥 Erro na API:', error)
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error?.message || 'Erro desconhecido'}`
    }, { status: 500 })
  }
}

// Função para criar theme-config.json
async function createThemeConfig(repoName: string, clientName: string, colors: any, token: string, username: string) {
  try {
    console.log('📄 Criando theme-config.json...')
    
    const themeConfig = {
      client: clientName,
      colors: colors,
      generated_at: new Date().toISOString(),
      saas_version: "1.0.0",
      preview_url: `https://${username}.github.io/${repoName}`
    }
    
    const content = btoa(JSON.stringify(themeConfig, null, 2))
    
    await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/theme-config.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `feat: add theme configuration`,
        content: content,
        branch: 'main'
      })
    })
    
    console.log('✅ theme-config.json criado!')
  } catch (error: any) {
    console.error('❌ Erro theme-config:', error?.message)
  }
}

// Função para criar index.html (Página principal do Design System)
async function createIndexHTML(repoName: string, clientName: string, colors: any, token: string, username: string) {
  try {
    console.log('🌐 Criando index.html...')
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design System - ${clientName}</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --primary: ${colors.primary};
            --secondary: ${colors.secondary};
            --accent: ${colors.accent};
            --muted: ${colors.muted};
            --primary-foreground: #ffffff;
            --secondary-foreground: #ffffff;
            --accent-foreground: #ffffff;
            --muted-foreground: #374151;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Design System</h1>
                    <p class="text-gray-600">${clientName}</p>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-500">Gerado automaticamente</span>
                    <a href="https://github.com/${username}/${repoName}" target="_blank" 
                       class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                        Ver Código
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
        <!-- Paleta de Cores -->
        <section class="mb-12">
            <h2 class="text-xl font-bold mb-6">🎨 Paleta de Cores</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="text-center">
                    <div class="w-24 h-24 mx-auto rounded-lg mb-3 border border-gray-200" 
                         style="background-color: ${colors.primary}"></div>
                    <h3 class="font-medium">Primary</h3>
                    <p class="text-sm text-gray-500">${colors.primary}</p>
                </div>
                <div class="text-center">
                    <div class="w-24 h-24 mx-auto rounded-lg mb-3 border border-gray-200" 
                         style="background-color: ${colors.secondary}"></div>
                    <h3 class="font-medium">Secondary</h3>
                    <p class="text-sm text-gray-500">${colors.secondary}</p>
                </div>
                <div class="text-center">
                    <div class="w-24 h-24 mx-auto rounded-lg mb-3 border border-gray-200" 
                         style="background-color: ${colors.accent}"></div>
                    <h3 class="font-medium">Accent</h3>
                    <p class="text-sm text-gray-500">${colors.accent}</p>
                </div>
                <div class="text-center">
                    <div class="w-24 h-24 mx-auto rounded-lg mb-3 border border-gray-200" 
                         style="background-color: ${colors.muted}"></div>
                    <h3 class="font-medium">Muted</h3>
                    <p class="text-sm text-gray-500">${colors.muted}</p>
                </div>
            </div>
        </section>

        <!-- Botões -->
        <section class="mb-12">
            <h2 class="text-xl font-bold mb-6">🔘 Botões</h2>
            <div class="space-y-6">
                <div>
                    <h3 class="font-medium mb-3">Variações</h3>
                    <div class="flex flex-wrap gap-4">
                        <button class="btn-primary">Primary Button</button>
                        <button class="btn-secondary">Secondary Button</button>
                        <button class="btn-accent">Accent Button</button>
                        <button class="btn-outline">Outline Button</button>
                    </div>
                </div>
                <div>
                    <h3 class="font-medium mb-3">Tamanhos</h3>
                    <div class="flex flex-wrap items-center gap-4">
                        <button class="btn-primary text-sm px-3 py-1.5">Small</button>
                        <button class="btn-primary px-4 py-2">Medium</button>
                        <button class="btn-primary text-lg px-6 py-3">Large</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Cards -->
        <section class="mb-12">
            <h2 class="text-xl font-bold mb-6">📋 Cards</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="card">
                    <h3 class="card-title">Card Principal</h3>
                    <p class="card-content">
                        Este é um exemplo de card usando as cores personalizadas do design system.
                    </p>
                    <button class="btn-accent">Ação do Card</button>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon" style="background-color: ${colors.accent}"></div>
                    <h4 class="feature-title">Feature 1</h4>
                    <p class="feature-description">Descrição da primeira funcionalidade</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon" style="background-color: ${colors.secondary}"></div>
                    <h4 class="feature-title">Feature 2</h4>
                    <p class="feature-description">Descrição da segunda funcionalidade</p>
                </div>
            </div>
        </section>

        <!-- Formulários -->
        <section class="mb-12">
            <h2 class="text-xl font-bold mb-6">📝 Formulários</h2>
            <div class="max-w-md">
                <div class="space-y-4">
                    <div>
                        <label class="form-label">Nome completo</label>
                        <input type="text" placeholder="Digite seu nome" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Email</label>
                        <input type="email" placeholder="seu@email.com" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Mensagem</label>
                        <textarea placeholder="Sua mensagem aqui..." rows="4" class="form-input resize-none"></textarea>
                    </div>
                    <button class="btn-primary w-full">Enviar Formulário</button>
                </div>
            </div>
        </section>

        <!-- Código CSS -->
        <section class="mb-12">
            <h2 class="text-xl font-bold mb-6">💻 Como Usar</h2>
            <div class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                <pre><code>/* CSS Variables */
:root {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --accent: ${colors.accent};
    --muted: ${colors.muted};
}

/* Classes utilitárias */
.btn-primary { 
    background-color: var(--primary); 
    color: white; 
}
.btn-secondary { 
    background-color: var(--secondary); 
    color: white; 
}
.btn-accent { 
    background-color: var(--accent); 
    color: white; 
}</code></pre>
            </div>
        </section>
    </main>

    <footer class="bg-white border-t mt-16">
        <div class="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
            <p>Design System gerado automaticamente para ${clientName}</p>
            <p class="text-sm mt-2">Criado em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
    </footer>

    <script src="components.js"></script>
</body>
</html>`

    const content = btoa(htmlContent)
    
    await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/index.html`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `feat: add design system homepage`,
        content: content,
        branch: 'main'
      })
    })
    
    console.log('✅ index.html criado!')
  } catch (error: any) {
    console.error('❌ Erro index.html:', error?.message)
  }
}

// Função para criar styles.css
async function createStylesCSS(repoName: string, clientName: string, colors: any, token: string, username: string) {
  try {
    console.log('🎨 Criando styles.css...')
    
    const cssContent = `/* Design System CSS - ${clientName} */

/* CSS Variables */
:root {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --accent: ${colors.accent};
    --muted: ${colors.muted};
    --primary-foreground: #ffffff;
    --secondary-foreground: #ffffff;
    --accent-foreground: #ffffff;
    --muted-foreground: #374151;
}

/* Botões */
.btn-primary {
    background-color: var(--primary);
    color: var(--primary-foreground);
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-primary:hover {
    opacity: 0.9;
}

.btn-secondary {
    background-color: var(--secondary);
    color: var(--secondary-foreground);
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-secondary:hover {
    opacity: 0.9;
}

.btn-accent {
    background-color: var(--accent);
    color: var(--accent-foreground);
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;
}

.btn-accent:hover {
    opacity: 0.9;
}

.btn-outline {
    background-color: transparent;
    color: var(--primary);
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    border: 2px solid var(--primary);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-outline:hover {
    background-color: var(--primary);
    color: var(--primary-foreground);
}

/* Cards */
.card {
    background-color: var(--muted);
    border: 1px solid rgba(107, 114, 128, 0.3);
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 0.5rem;
}

.card-content {
    color: #6b7280;
    margin-bottom: 1rem;
}

.feature-card {
    background-color: white;
    border: 2px solid var(--muted);
    border-radius: 0.5rem;
    padding: 1rem;
}

.feature-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    margin-bottom: 0.75rem;
}

.feature-title {
    font-weight: 500;
    color: var(--primary);
    margin-bottom: 0.5rem;
}

.feature-description {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Formulários */
.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--primary);
    margin-bottom: 0.25rem;
}

.form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--secondary);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Utilidades */
.text-primary {
    color: var(--primary);
}

.bg-primary {
    background-color: var(--primary);
}

.border-primary {
    border-color: var(--primary);
}

.text-secondary {
    color: var(--secondary);
}

.bg-secondary {
    background-color: var(--secondary);
}

.text-accent {
    color: var(--accent);
}

.bg-accent {
    background-color: var(--accent);
}

.bg-muted {
    background-color: var(--muted);
}

/* Responsividade */
@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .grid-cols-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}`

    const content = btoa(cssContent)
    
    await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/styles.css`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `feat: add design system styles`,
        content: content,
        branch: 'main'
      })
    })
    
    console.log('✅ styles.css criado!')
  } catch (error: any) {
    console.error('❌ Erro styles.css:', error?.message)
  }
}

// Função para criar components.js
async function createComponentsJS(repoName: string, clientName: string, colors: any, token: string, username: string) {
  try {
    console.log('⚡ Criando components.js...')
    
    const jsContent = `// Design System Components - ${clientName}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Design System ${clientName} carregado!');
    
    // Adicionar interatividade aos botões
    addButtonInteractions();
    
    // Adicionar funcionalidade de cópia para códigos
    addCopyFunctionality();
});

// Interações dos botões
function addButtonInteractions() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Efeito visual de clique
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

// Funcionalidade de cópia
function addCopyFunctionality() {
    // Adicionar botões de cópia próximo aos códigos
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.innerHTML = '📋 Copiar';
        button.className = 'btn-accent text-sm ml-2';
        button.onclick = () => copyToClipboard(block.textContent);
        
        if (block.parentElement && block.parentElement.parentElement) {
            block.parentElement.parentElement.style.position = 'relative';
            button.style.position = 'absolute';
            button.style.top = '10px';
            button.style.right = '10px';
            block.parentElement.parentElement.appendChild(button);
        }
    });
}

// Função para copiar texto
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Código copiado!');
    }).catch(() => {
        // Fallback para navegadores que não suportam clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Código copiado!');
    });
}

// Mostrar notificação
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--accent);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
    \`;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Configurações do Design System
const designSystem = {
    colors: ${JSON.stringify(colors, null, 4)},
    client: "${clientName}",
    version: "1.0.0"
};

// Exportar para uso global
window.designSystem = designSystem;`

    const content = btoa(jsContent)
    
    await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/components.js`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `feat: add design system components`,
        content: content,
        branch: 'main'
      })
    })
    
    console.log('✅ components.js criado!')
  } catch (error: any) {
    console.error('❌ Erro components.js:', error?.message)
  }
}

// Função para criar package.json
async function createPackageJSON(repoName: string, clientName: string, token: string, username: string) {
  try {
    console.log('📦 Criando package.json...')
    
    const packageJson = {
      name: repoName,
      version: "1.0.0",
      description: `Design System personalizado para ${clientName}`,
      main: "index.html",
      scripts: {
        start: "python -m http.server 8000",
        serve: "npx serve ."
      },
      keywords: ["design-system", "css", "html", "white-label"],
      author: `Design System SaaS`,
      license: "MIT",
      repository: {
        type: "git",
        url: `https://github.com/${username}/${repoName}.git`
      },
      homepage: `https://${username}.github.io/${repoName}`
    }
    
    const content = btoa(JSON.stringify(packageJson, null, 2))
    
    await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/package.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `feat: add package.json`,
        content: content,
        branch: 'main'
      })
    })
    
    console.log('✅ package.json criado!')
  } catch (error: any) {
    console.error('❌ Erro package.json:', error?.message)
  }
}

// Função para criar README.md
async function createReadme(repoName: string, clientName: string, colors: any, token: string, username: string) {
  try {
    console.log('📖 Criando README.md...')
    
    const readmeContent = `# Design System - ${clientName}

Sistema de design personalizado gerado automaticamente.

## 🌐 Visualizar

**👉 [Ver Design System](https://${username}.github.io/${repoName})**

## 🎨 Paleta de Cores

${Object.entries(colors).map(([key, value]) => `- **${key.charAt(0).toUpperCase() + key.slice(1)}**: \`${value}\``).join('\n')}

## 📁 Estrutura

- \`index.html\` - Página principal do Design System
- \`styles.css\` - Estilos personalizados
- \`components.js\` - Componentes JavaScript
- \`theme-config.json\` - Configurações do tema

## 🚀 Como usar localmente

1. Clone o repositório:
   \`\`\`bash
   git clone https://github.com/${username}/${repoName}.git
   cd ${repoName}
   \`\`\`

2. Abra o arquivo \`index.html\` no navegador ou inicie um servidor local:
   \`\`\`bash
   python -m http.server 8000
   # ou
   npx serve .
   \`\`\`

3. Acesse \`http://localhost:8000\`

## 🎯 Componentes Incluídos

- ✅ **Botões** - Primary, Secondary, Accent, Outline
- ✅ **Cards** - Cards padrão e Feature cards
- ✅ **Formulários** - Inputs, textareas, labels
- ✅ **Paleta de Cores** - Visualização completa
- ✅ **CSS Variables** - Fácil customização

## 📱 Responsivo

O Design System é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Mobile
- 📱 Tablet

## 🛠️ Personalização

Para alterar as cores, edite o arquivo \`styles.css\`:

\`\`\`css
:root {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --accent: ${colors.accent};
    --muted: ${colors.muted};
}
\`\`\`

## 📞 Suporte

Design System gerado automaticamente pelo **Design System SaaS**.

---

**Criado em:** ${new Date().toLocaleDateString('pt-BR')}  
**Cliente:** ${clientName}  
**Versão:** 1.0.0
`

    const content = btoa(readmeContent)
    
    // Primeiro, obter o SHA do README existente
    const getFileResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/README.md`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    })
    
    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json()
      
      // Atualizar o README existente
      await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/README.md`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `docs: update README with design system info`,
          content: content,
          sha: fileData.sha,
          branch: 'main'
        })
      })
    }
    
    console.log('✅ README.md criado!')
  } catch (error: any) {
    console.error('❌ Erro README:', error?.message)
  }
 }
 
 // Função para ativar GitHub Pages
 async function enableGitHubPages(repoName: string, token: string, username: string) {
  try {
    console.log('🌐 Ativando GitHub Pages...')
    
    await fetch(`https://api.github.com/repos/${username}/${repoName}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          branch: 'main'
        }
      })
    })
    
    console.log('✅ GitHub Pages ativado!')
  } catch (error: any) {
    console.log('⚠️ GitHub Pages:', error?.message || 'Pode já estar ativado')
  }
 }