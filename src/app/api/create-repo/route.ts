import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { clientName, colors } = await request.json()
  
  // Lógica de criação do repositório
  const createGitRepository = async () => {
    const response = await fetch('/api/create-repo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName, colors })
    })
    
    const result = await response.json()
    
    if (result.success) {
      alert(`✅ Repositório criado: ${result.repoUrl}`)
      window.open(result.repoUrl, '_blank')
    }
  }

}