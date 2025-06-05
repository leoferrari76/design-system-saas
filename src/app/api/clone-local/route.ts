// app/api/clone-local/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { clientName, colors } = await request.json()
    
    // Simular criação do template (em produção seria um ZIP real)
    const folderName = clientName.toLowerCase().replace(/\s+/g, '-') + '-design-system'
    
    // Por enquanto, vamos simular o download
    // Em produção, você criaria um ZIP com todos os arquivos
    
    return NextResponse.json({
      success: true,
      folderName: folderName,
      clientName: clientName,
      downloadUrl: '#', // Placeholder
      files: [
        'package.json',
        'next.config.js', 
        'tailwind.config.js',
        'pages/index.tsx',
        'pages/_app.tsx',
        'styles/globals.css',
        'components/Button.tsx',
        'components/Card.tsx',
        'components/Input.tsx',
        'README.md'
      ],
      message: `Template preparado! (Demo - em produção geraria ZIP real)`
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Erro: ${error?.message || 'Erro desconhecido'}`
    }, { status: 500 })
  }
}