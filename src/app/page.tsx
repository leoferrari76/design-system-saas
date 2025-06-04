'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, GitBranch, Download, Palette } from "lucide-react"

export default function DesignSystemMVP() {
  const [colors, setColors] = useState({
    primary: '#1a1a1a',
    secondary: '#6b7280',
    accent: '#3b82f6',
    muted: '#f3f4f6',
  })

  const [clientName, setClientName] = useState('Cliente Exemplo')
  const [activeTab, setActiveTab] = useState('config')

  const updateColor = (colorKey: string, hexValue: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: hexValue
    }))
  }

  // Função para converter hex para HSL
  const hexToHsl = (hex: string) => {
    if (!hex.startsWith('#') || hex.length !== 7) return null
    
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }

  const exportTheme = () => {
    const cssVariables = Object.entries(colors)
      .map(([key, hexValue]) => {
        const hslValue = hexToHsl(hexValue)
        return `  --${key}: ${hslValue};`
      })
      .join('\n')
    
    const cssContent = `:root {\n${cssVariables}\n  --primary-foreground: 0 0% 98%;\n  --secondary-foreground: 0 0% 9%;\n  --accent-foreground: 0 0% 98%;\n  --muted-foreground: 0 0% 45%;\n}`
    
    const blob = new Blob([cssContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${clientName.toLowerCase().replace(/\s+/g, '-')}-theme.css`
    a.click()
  }

  const createGitRepository = async () => {
    // Simula criação de repositório Git
    const repoName = clientName.toLowerCase().replace(/\s+/g, '-')
    const commands = [
      `git clone https://github.com/seu-usuario/design-system-template.git ${repoName}`,
      `cd ${repoName}`,
      `git remote rename origin template`,
      `git remote add origin https://github.com/seu-usuario/${repoName}.git`,
      `# Configure as cores personalizadas`,
      `echo '${JSON.stringify(colors, null, 2)}' > theme-config.json`,
      `git add .`,
      `git commit -m "feat: configuração inicial para ${clientName}"`,
      `git push -u origin main`
    ]

    const commandsText = commands.join('\n')
    
    const blob = new Blob([commandsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `setup-${repoName}.sh`
    a.click()

    alert(`Repositório "${repoName}" configurado! Execute o script baixado para criar o repositório.`)
  }

  // Função para determinar cor do texto baseada no background
  const getTextColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Código copiado para a área de transferência!')
  }

  // Códigos dos componentes
  const buttonCode = `// Button Component
const Button = ({ variant = 'primary', children, ...props }) => {
  const styles = {
    primary: {
      backgroundColor: '${colors.primary}',
      color: '${getTextColor(colors.primary)}',
      border: 'none'
    },
    secondary: {
      backgroundColor: '${colors.secondary}',
      color: '${getTextColor(colors.secondary)}',
      border: 'none'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '${colors.primary}',
      border: \`2px solid ${colors.primary}\`
    }
  }

  return (
    <button
      style={{
        ...styles[variant],
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      {...props}
    >
      {children}
    </button>
  )
}`

  const cardCode = `// Card Component
const Card = ({ children, ...props }) => {
  return (
    <div
      style={{
        backgroundColor: '${colors.muted}',
        border: \`1px solid ${colors.secondary}40\`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      {...props}
    >
      {children}
    </div>
  )
}`

  const inputCode = `// Input Component
const Input = ({ ...props }) => {
  return (
    <input
      style={{
        width: '100%',
        padding: '8px 12px',
        border: \`1px solid ${colors.secondary}80\`,
        borderRadius: '6px',
        fontSize: '14px',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '${colors.accent}'
        e.target.style.boxShadow = \`0 0 0 2px ${colors.accent}20\`
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '${colors.secondary}80'
        e.target.style.boxShadow = 'none'
      }}
      {...props}
    />
  )
}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Fixo */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Design System SaaS</h1>
            <p className="text-sm text-gray-600">Cliente: {clientName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportTheme}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Exportar CSS
            </button>
            <button
              onClick={createGitRepository}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <GitBranch size={16} />
              Criar Repositório
            </button>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100">
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Palette size={16} />
                Configuração
              </TabsTrigger>
              <TabsTrigger value="buttons">Botões</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="forms">Formulários</TabsTrigger>
              <TabsTrigger value="palette">Paleta</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Configuração */}
            <TabsContent value="config">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Configuração do Cliente</CardTitle>
                    <CardDescription>Defina as informações e cores do projeto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Nome do Cliente */}
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Nome do Cliente</Label>
                      <Input
                        id="client-name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Digite o nome do cliente"
                      />
                    </div>

                    {/* Configuração de Cores */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Paleta de Cores</h3>
                      
                      {Object.entries(colors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                          <div className="flex gap-2">
                            <input
                              id={key}
                              type="color"
                              value={value}
                              onChange={(e) => updateColor(key, e.target.value)}
                              className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <Input
                              value={value}
                              onChange={(e) => updateColor(key, e.target.value)}
                              placeholder={`#${key}`}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Configurações do Projeto</CardTitle>
                    <CardDescription>Configurações técnicas e de versionamento</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Estrutura do Repositório</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>📂 design-system-template (repositório pai)</div>
                        <div>├── 📂 components/</div>
                        <div>├── 📂 styles/</div>
                        <div>├── 📄 theme-config.json</div>
                        <div>└── 📄 README.md</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-900">Próximos Passos</h4>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Configure as cores desejadas</li>
                        <li>Teste os componentes nas outras abas</li>
                        <li>Clique em "Criar Repositório" para gerar o projeto</li>
                        <li>Execute o script baixado no terminal</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Botões */}
            <TabsContent value="buttons">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Preview - Botões</CardTitle>
                    <CardDescription>Visualize os botões com as cores aplicadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Variações</h4>
                      <div className="flex gap-3 flex-wrap">
                        <button
                          className="px-4 py-2 rounded-md font-medium transition-colors"
                          style={{
                            backgroundColor: colors.primary,
                            color: getTextColor(colors.primary)
                          }}
                        >
                          Primary
                        </button>
                        <button
                          className="px-4 py-2 rounded-md font-medium transition-colors"
                          style={{
                            backgroundColor: colors.secondary,
                            color: getTextColor(colors.secondary)
                          }}
                        >
                          Secondary
                        </button>
                        <button
                          className="px-4 py-2 rounded-md font-medium border-2 transition-colors"
                          style={{
                            borderColor: colors.primary,
                            color: colors.primary,
                            backgroundColor: 'transparent'
                          }}
                        >
                          Outline
                        </button>
                        <button
                          className="px-4 py-2 rounded-md font-medium transition-colors"
                          style={{
                            backgroundColor: colors.accent,
                            color: getTextColor(colors.accent)
                          }}
                        >
                          Accent
                        </button>
                      </div>

                      <h4 className="font-medium">Tamanhos</h4>
                      <div className="flex gap-3 items-center flex-wrap">
                        <button
                          className="px-2 py-1 text-sm rounded font-medium"
                          style={{
                            backgroundColor: colors.primary,
                            color: getTextColor(colors.primary)
                          }}
                        >
                          Small
                        </button>
                        <button
                          className="px-4 py-2 rounded-md font-medium"
                          style={{
                            backgroundColor: colors.primary,
                            color: getTextColor(colors.primary)
                          }}
                        >
                          Medium
                        </button>
                        <button
                          className="px-6 py-3 text-lg rounded-lg font-medium"
                          style={{
                            backgroundColor: colors.primary,
                            color: getTextColor(colors.primary)
                          }}
                        >
                          Large
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Código do Componente
                      <button
                        onClick={() => copyToClipboard(buttonCode)}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Copy size={14} />
                        Copiar
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{buttonCode}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Cards */}
            <TabsContent value="cards">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Preview - Cards</CardTitle>
                    <CardDescription>Visualize os cards com as cores aplicadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: colors.muted,
                        borderColor: colors.secondary + '40'
                      }}
                    >
                      <h5 className="font-semibold text-gray-900 mb-2">Card Simples</h5>
                      <p className="text-sm text-gray-600 mb-3">Este é um exemplo de card básico com as cores personalizadas aplicadas.</p>
                      <button
                        className="px-3 py-1.5 text-sm rounded font-medium"
                        style={{
                          backgroundColor: colors.accent,
                          color: getTextColor(colors.accent)
                        }}
                      >
                        Ação
                      </button>
                    </div>

                    <div 
                      className="p-6 rounded-lg border"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: colors.primary + '20'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: colors.primary }}
                        >
                          A
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">Card com Avatar</h5>
                          <p className="text-sm text-gray-500">Exemplo com ícone</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">Conteúdo do card com avatar personalizado usando as cores do tema.</p>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1.5 text-sm rounded border font-medium"
                          style={{
                            borderColor: colors.primary,
                            color: colors.primary
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm rounded font-medium"
                          style={{
                            backgroundColor: colors.primary,
                            color: getTextColor(colors.primary)
                          }}
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Código do Componente
                      <button
                        onClick={() => copyToClipboard(cardCode)}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Copy size={14} />
                        Copiar
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{cardCode}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Formulários */}
            <TabsContent value="forms">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Preview - Formulários</CardTitle>
                    <CardDescription>Visualize os campos de formulário</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        placeholder="Digite seu nome"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                        style={{ borderColor: colors.secondary + '80' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = colors.accent
                          e.target.style.boxShadow = `0 0 0 2px ${colors.accent}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = colors.secondary + '80'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="Digite seu email"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                        style={{ borderColor: colors.secondary + '80' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = colors.accent
                          e.target.style.boxShadow = `0 0 0 2px ${colors.accent}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = colors.secondary + '80'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                        style={{ borderColor: colors.secondary + '80' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = colors.accent
                          e.target.style.boxShadow = `0 0 0 2px ${colors.accent}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = colors.secondary + '80'
                          e.target.style.boxShadow = 'none'
                        }}
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="option1">Opção 1</option>
                        <option value="option2">Opção 2</option>
                        <option value="option3">Opção 3</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                      <textarea
                        placeholder="Digite sua mensagem"
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-none"
                        style={{ borderColor: colors.secondary + '80' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = colors.accent
                          e.target.style.boxShadow = `0 0 0 2px ${colors.accent}20`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = colors.secondary + '80'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    <button
                      className="w-full px-4 py-2 rounded-md font-medium transition-colors"
                      style={{
                        backgroundColor: colors.primary,
                        color: getTextColor(colors.primary)
                      }}
                    >
                      Enviar Formulário
                    </button>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Código do Componente
                      <button
                        onClick={() => copyToClipboard(inputCode)}
                        className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Copy size={14} />
                        Copiar
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{inputCode}</code>
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Paleta */}
            <TabsContent value="palette">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Paleta de Cores - {clientName}</CardTitle>
                  <CardDescription>Visualização completa da paleta personalizada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(colors).map(([key, hexValue]) => (
                      <div key={key} className="space-y-3">
                        <div
                          className="h-32 rounded-lg border flex flex-col items-center justify-center text-center p-4"
                          style={{ backgroundColor: hexValue }}
                        >
                          <div 
                            className="font-bold text-lg capitalize mb-1"
                            style={{ 
                              color: getTextColor(hexValue),
                              textShadow: '0 0 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            {key}
                          </div>
                          <div 
                            className="text-sm font-mono"
                            style={{ 
                              color: getTextColor(hexValue),
                              textShadow: '0 0 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            {hexValue}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div><strong>RGB:</strong> {hexValue.slice(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}</div>
                          <div><strong>HSL:</strong> {hexToHsl(hexValue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}