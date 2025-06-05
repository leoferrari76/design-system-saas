import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Deploy Vercel chamada!')
    
    const body = await request.text()
    console.log('📦 Body bruto:', body)
    
    let clientName, colors
    try {
      const parsed = JSON.parse(body)
      clientName = parsed.clientName
      colors = parsed.colors
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao processar dados enviados'
      }, { status: 400 })
    }
    
    console.log('✅ Dados parseados:', { clientName, colors })
    
    // Limpar nome do cliente
    const cleanClientName = clientName.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    if (!cleanClientName) {
      return NextResponse.json({
        success: false,
        error: 'Nome do cliente inválido'
      }, { status: 400 })
    }
    
    // Verificar variáveis de ambiente
    const githubToken = process.env.GITHUB_TOKEN
    const githubUsername = process.env.GITHUB_USERNAME
    
    console.log('🔑 GitHub Token:', githubToken ? 'Configurado' : 'NÃO CONFIGURADO')
    console.log('👤 GitHub Username:', githubUsername || 'NÃO CONFIGURADO')
    
    if (!githubToken || !githubUsername) {
      return NextResponse.json({
        success: false,
        error: 'GitHub token ou username não configurados no .env.local'
      }, { status: 400 })
    }
    
    // Criar nome do repositório seguro
    const repoName = cleanClientName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '-ds-full'
    
    console.log(`🚀 Criando repositório: ${repoName}`)
    
    // Tentar criar o repositório
    const createRepoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: `Design System completo para ${cleanClientName}`,
        private: false,
        auto_init: true,
      })
    })

    console.log('📡 GitHub API status:', createRepoResponse.status)

    if (!createRepoResponse.ok) {
      const errorText = await createRepoResponse.text()
      console.error('❌ Erro da API do GitHub:', errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      
      return NextResponse.json({
        success: false,
        error: `Erro ao criar repositório: ${errorData.message || 'Erro desconhecido'}`
      }, { status: 400 })
    }

    const repoData = await createRepoResponse.json()
    console.log('✅ Repositório criado:', repoData.html_url)
    
    // Aguardar repositório ser criado
    console.log('⏳ Aguardando 5 segundos para o repositório ser totalmente criado...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Criar arquivo básico com logs detalhados
    console.log('📄 Iniciando criação do index.html...')
    const fileCreated = await createBasicIndex(repoName, cleanClientName, colors, githubToken, githubUsername)
    
    if (!fileCreated) {
      console.error('❌ Falha na criação do arquivo')
      return NextResponse.json({
        success: false,
        error: 'Repositório criado, mas falha na criação do arquivo HTML'
      }, { status: 500 })
    }
    
    console.log('✅ Arquivo HTML criado com sucesso!')
    
    // Ativar GitHub Pages
    console.log('🌐 Ativando GitHub Pages...')
    await enableGitHubPages(repoName, githubToken, githubUsername)
    
    const liveUrl = `https://${githubUsername}.github.io/${repoName}`
    
    return NextResponse.json({
      success: true,
      repoUrl: repoData.html_url,
      liveUrl: liveUrl,
      clientName: cleanClientName,
      repoName: repoName,
      message: `Deploy realizado! Site estará disponível em 2-3 minutos.`
    })
    
  } catch (error: any) {
    console.error('💥 Erro na API Deploy:', error)
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error?.message || 'Erro desconhecido'}`
    }, { status: 500 })
  }
}

async function createBasicIndex(repoName: string, clientName: string, colors: any, token: string, username: string): Promise<boolean> {
  try {
    console.log(`📝 Criando index.html para ${repoName}...`)
    
    // HTML mais simples para evitar problemas de encoding
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design System - ${clientName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 2rem; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 3rem; 
        }
        .title { 
            font-size: 2.5rem; 
            color: #333; 
            margin-bottom: 1rem; 
        }
        .subtitle { 
            font-size: 1.2rem; 
            color: #666; 
        }
        .colors { 
            display: flex; 
            gap: 2rem; 
            flex-wrap: wrap; 
            justify-content: center; 
            margin: 3rem 0; 
        }
        .color-card { 
            background: white; 
            border-radius: 10px; 
            padding: 1.5rem; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            text-align: center; 
            min-width: 200px;
        }
        .color-preview { 
            width: 100%; 
            height: 100px; 
            border-radius: 5px; 
            margin-bottom: 1rem; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
        }
        .btn { 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            color: white; 
            margin: 5px; 
            cursor: pointer; 
            font-weight: bold;
        }
        .card { 
            background: white; 
            border-radius: 10px; 
            padding: 2rem; 
            margin: 2rem 0; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="title">Design System</h1>
            <p class="subtitle">${clientName} - Criado Automaticamente ✅</p>
        </header>

        <section class="colors">
            <div class="color-card">
                <div class="color-preview" style="background-color: ${colors.primary}">PRIMARY</div>
                <h3>Primary</h3>
                <p>${colors.primary}</p>
            </div>
            <div class="color-card">
                <div class="color-preview" style="background-color: ${colors.secondary}">SECONDARY</div>
                <h3>Secondary</h3>
                <p>${colors.secondary}</p>
            </div>
            <div class="color-card">
                <div class="color-preview" style="background-color: ${colors.accent}">ACCENT</div>
                <h3>Accent</h3>
                <p>${colors.accent}</p>
            </div>
            <div class="color-card">
                <div class="color-preview" style="background-color: ${colors.muted}; color: #333">MUTED</div>
                <h3>Muted</h3>
                <p>${colors.muted}</p>
            </div>
        </section>

        <section>
            <h2>Componentes</h2>
            
            <div>
                <h3>Botões</h3>
                <button class="btn" style="background-color: ${colors.primary}">Primary Button</button>
                <button class="btn" style="background-color: ${colors.secondary}">Secondary Button</button>
                <button class="btn" style="background-color: ${colors.accent}">Accent Button</button>
            </div>

            <div class="card">
                <h3 style="color: ${colors.primary}">Card de Exemplo</h3>
                <p>Este Design System foi criado automaticamente pelo SaaS White Label!</p>
                <p><strong>Cliente:</strong> ${clientName}</p>
                <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                <button class="btn" style="background-color: ${colors.accent}">Ação do Card</button>
            </div>
        </section>

        <footer style="text-align: center; margin-top: 3rem; color: #666;">
            <p>🎉 Design System gerado automaticamente</p>
            <p>SaaS White Label funcionando perfeitamente!</p>
        </footer>
    </div>
</body>
</html>`

    console.log('📦 HTML content length:', htmlContent.length)
    
    // Converter para base64
    const content = Buffer.from(htmlContent, 'utf8').toString('base64')
    console.log('🔐 Base64 content length:', content.length)
    
    // Fazer a requisição para criar o arquivo
    console.log('🌐 Fazendo requisição para GitHub API...')
    
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/index.html`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Add design system page',
        content: content,
        branch: 'main'
      })
    })

    console.log('📡 GitHub file creation status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro ao criar arquivo:', errorText)
      return false
    }
    
    const fileData = await response.json()
    console.log('✅ Arquivo criado com sucesso:', fileData.content?.name)
    
    return true
    
  } catch (error: any) {
    console.error('❌ Erro na createBasicIndex:', error.message)
    console.error('Stack trace:', error.stack)
    return false
  }
}

async function enableGitHubPages(repoName: string, token: string, username: string) {
  try {
    console.log('🌐 Tentando ativar GitHub Pages...')
    
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: { branch: 'main' }
      })
    })
    
    console.log('📡 GitHub Pages activation status:', response.status)
    
    if (response.ok) {
      console.log('✅ GitHub Pages ativado com sucesso!')
    } else {
      const errorText = await response.text()
      console.log('⚠️ GitHub Pages response:', errorText)
    }
    
  } catch (error: any) {
    console.log('⚠️ Erro GitHub Pages (pode já estar ativo):', error.message)
  }
}