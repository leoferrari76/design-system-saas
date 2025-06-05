'use client'

import { useState } from 'react'
import { Download, GitBranch, Palette, ExternalLink } from 'lucide-react'

export default function DesignSystemSaaS() {
  const [clientName, setClientName] = useState('')
  const [colors, setColors] = useState({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    muted: '#f3f4f6'
  })
  const [isCreatingRepo, setIsCreatingRepo] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [lastCreatedRepo, setLastCreatedRepo] = useState<any>(null)
  const [lastLocalSetup, setLastLocalSetup] = useState<any>(null)
  const [lastDeployment, setLastDeployment] = useState<any>(null)

  const exportTheme = () => {
    const cssContent = `/* Design System CSS - ${clientName} */

:root {
  --primary: ${colors.primary};
  --secondary: ${colors.secondary};
  --accent: ${colors.accent};
  --muted: ${colors.muted};
}

/* Botões */
.btn-primary {
  background-color: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background-color: var(--secondary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn-accent {
  background-color: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

/* Cards */
.card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Inputs */
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}`

    const blob = new Blob([cssContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${clientName.toLowerCase().replace(/\s+/g, '-')}-design-system.css`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Função para criar repositório simples (GitHub Pages)
  const createGitRepository = async () => {
    if (!clientName.trim()) {
      alert('Por favor, digite o nome do cliente')
      return
    }

    setIsCreatingRepo(true)
    
    try {
      const response = await fetch('/api/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, colors })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setLastCreatedRepo(result)
        alert(`✅ Design System criado!\n\n🌐 Página: ${result.previewUrl}\n📂 Repo: ${result.repoUrl}`)
      } else {
        alert(`❌ Erro: ${result.error}`)
      }
    } catch (error: any) {
      alert(`💥 Erro: ${error.message}`)
    } finally {
      setIsCreatingRepo(false)
    }
  }

  // Função para clone local
  const cloneAndRunLocal = async () => {
    if (!clientName.trim()) {
      alert('Por favor, digite o nome do cliente')
      return
    }

    setIsCloning(true)
    
    try {
      const response = await fetch('/api/clone-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, colors })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setLastLocalSetup(result)
        alert(`✅ Template preparado!\n\nEm produção seria:\n1. Download do ZIP\n2. cd ${result.folderName}\n3. npm install && npm run dev\n4. localhost:3000\n\n(Demo: ${result.message})`)
      } else {
        alert(`❌ Erro: ${result.error}`)
      }
    } catch (error: any) {
      alert(`💥 Erro: ${error.message}`)
    } finally {
      setIsCloning(false)
    }
  }

  // Função para deploy no Vercel
  const deployToVercel = async () => {
    if (!clientName.trim()) {
      alert('Por favor, digite o nome do cliente')
      return
    }

    setIsDeploying(true)
    
    try {
      const response = await fetch('/api/deploy-vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, colors })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setLastDeployment(result)
        alert(`🚀 Deploy realizado!\n\n🌐 URL Live: ${result.liveUrl}\n📂 Repo: ${result.repoUrl}\n\nO site estará disponível em 1-2 minutos!`)
      } else {
        alert(`❌ Erro: ${result.error}`)
      }
    } catch (error: any) {
      alert(`💥 Erro: ${error.message}`)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {(lastCreatedRepo || lastLocalSetup || lastDeployment) && (
        <div className="bg-green-50 border-b border-green-200 px-8 py-3">
          <div className="max-w-7xl mx-auto">
            {lastCreatedRepo && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-700 font-medium">✅ Design System Simples:</span>
                  <span className="text-green-600">{lastCreatedRepo.clientName}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(lastCreatedRepo.repoUrl, '_blank')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white text-green-700 border border-green-300 rounded hover:bg-green-50 transition-colors"
                  >
                    <GitBranch size={14} />
                    Ver Repositório
                  </button>
                  <button
                    onClick={() => window.open(lastCreatedRepo.previewUrl, '_blank')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Ver Página
                  </button>
                </div>
              </div>
            )}
            
            {lastLocalSetup && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-purple-700 font-medium">💻 Setup Local:</span>
                  <span className="text-purple-600">{lastLocalSetup.clientName}</span>
                </div>
                <div className="text-sm text-purple-600">
                  Executar: cd {lastLocalSetup.folderName} && npm install && npm run dev
                </div>
              </div>
            )}
            
            {lastDeployment && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-orange-700 font-medium">🚀 Deploy Live:</span>
                  <span className="text-orange-600">{lastDeployment.clientName}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(lastDeployment.repoUrl, '_blank')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white text-orange-700 border border-orange-300 rounded hover:bg-orange-50 transition-colors"
                  >
                    <GitBranch size={14} />
                    Ver Código
                  </button>
                  <button
                    onClick={() => window.open(lastDeployment.liveUrl, '_blank')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Ver Site Live
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Palette className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Design System SaaS
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gerador automático de Design Systems white-label para seus clientes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuração */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Palette size={20} />
                  Configuração
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Empresa ABC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(colors).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
                <h3 className="font-semibold mb-4">Preview</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-2 rounded text-white text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Primary
                    </button>
                    <button 
                      className="px-3 py-2 rounded text-white text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      Secondary
                    </button>
                  </div>
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: colors.muted }}
                  >
                    <h4 className="font-medium" style={{ color: colors.primary }}>Card Example</h4>
                    <p className="text-sm text-gray-600 mt-1">Preview do design system</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações e Informações */}
            <div className="lg:col-span-2 space-y-6">
              {/* Botões de Ação */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Gerar Design System</h3>
                
                <div className="flex gap-3">
                  <button
                    onClick={exportTheme}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    Exportar CSS
                  </button>
                  
                  <button
                    onClick={cloneAndRunLocal}
                    disabled={isCloning}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={16} />
                    {isCloning ? (
                      <>
                        <span className="animate-spin">⚙️</span>
                        Preparando Local...
                      </>
                    ) : (
                      'Clone Local (localhost)'
                    )}
                  </button>
                  
                  <button
                    onClick={deployToVercel}
                    disabled={isDeploying}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink size={16} />
                    {isDeploying ? (
                      <>
                        <span className="animate-spin">⚙️</span>
                        Deploy Live...
                      </>
                    ) : (
                      'Deploy Live (Vercel)'
                    )}
                  </button>
                  
                  <button
                    onClick={createGitRepository}
                    disabled={isCreatingRepo}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <GitBranch size={16} />
                    {isCreatingRepo ? (
                      <>
                        <span className="animate-spin">⚙️</span>
                        Criando Simples...
                      </>
                    ) : (
                      'Criar Simples (GitHub)'
                    )}
                  </button>
                </div>
              </div>

              {/* Informações sobre as opções */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Design System White Label</h3>
                <p className="text-gray-600 mb-4">Três formas de criar seu design system</p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium mb-2 text-purple-900">💻 Clone Local (Recomendado)</h4>
                    <div className="text-sm text-purple-700 space-y-1">
                      <div>📁 150+ componentes completos</div>
                      <div>⚡ Next.js + React + TypeScript</div>
                      <div>🔧 Totalmente customizável</div>
                      <div>🏠 Roda em localhost:3000</div>
                      <div>📦 Download direto do ZIP</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium mb-2 text-orange-900">🚀 Deploy Live (Vercel)</h4>
                    <div className="text-sm text-orange-700 space-y-1">
                      <div>🌐 URL pública em 30 segundos</div>
                      <div>⚡ Todos os 150+ componentes</div>
                      <div>📱 Responsivo e otimizado</div>
                      <div>🔄 Deploy automático</div>
                      <div>✨ Pronto para cliente acessar</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium mb-2 text-green-900">📄 Simples (GitHub Pages)</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>🌐 HTML + CSS + JS básico</div>
                      <div>⚡ Componentes essenciais</div>
                      <div>📱 Responsivo simples</div>
                      <div>🚀 GitHub Pages automático</div>
                      <div>💡 Para apresentações rápidas</div>
                    </div>
                  </div>

                  {(isCloning || isDeploying || isCreatingRepo) && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <span className="animate-spin">⚙️</span>
                        <span className="font-medium">
                          {isCloning && 'Preparando arquivos para download...'}
                          {isDeploying && 'Fazendo deploy no Vercel...'}
                          {isCreatingRepo && 'Criando repositório GitHub...'}
                        </span>
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">
                        {isCloning && 'Aplicando suas cores e gerando ZIP...'}
                        {isDeploying && 'Criando repositório e fazendo deploy automático...'}
                        {isCreatingRepo && 'Gerando arquivos HTML, CSS, JS e ativando Pages...'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}