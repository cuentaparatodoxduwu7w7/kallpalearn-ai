// Supabase Edge Function: AI Chat with RAG
// Esta función implementa el Tutor IA con Retrieval Augmented Generation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Autenticar usuario
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // 2. Obtener datos de la petición
    const { studySetId, message, conversationHistory } = await req.json()
    
    if (!studySetId || !message) {
      throw new Error('Missing required parameters: studySetId, message')
    }

    // 3. Verificar que el usuario tiene acceso al Study Set
    const { data: studySet, error: studySetError } = await supabase
      .from('study_sets')
      .select('id, title, user_id')
      .eq('id', studySetId)
      .eq('user_id', user.id)
      .single()

    if (studySetError || !studySet) {
      throw new Error('Study set not found or access denied')
    }

    // 4. RAG: Buscar chunks relevantes
    const { data: chunks, error: chunksError } = await supabase
      .from('source_chunks')
      .select('id, content, metadata')
      .eq('study_set_id', studySetId)
      .eq('user_id', user.id)
      .limit(10)

    if (chunksError) {
      console.error('Error fetching chunks:', chunksError)
    }

    // 5. Construir contexto
    const context = chunks && chunks.length > 0
      ? chunks.map((chunk, index) => {
          const metadata = chunk.metadata || {}
          let source = ''
          
          if (metadata.page) {
            source = `Página ${metadata.page}`
          } else if (metadata.slide) {
            source = `Diapositiva ${metadata.slide}`
          } else if (metadata.section) {
            source = `Sección: ${metadata.section}`
          }
          
          return `[Fragmento ${index + 1}${source ? ` - ${source}` : ''}]\n${chunk.content}`
        }).join('\n\n')
      : null

    // 6. Obtener perfil de aprendizaje
    const { data: profile } = await supabase
      .from('learner_profiles')
      .select('preferred_explanation_style, study_level')
      .eq('user_id', user.id)
      .single()

    // 7. Construir prompt para el LLM
    const systemPrompt = buildSystemPrompt(context, profile)
    
    // 8. Llamar al proveedor de IA
    const aiResponse = await callAIProvider(systemPrompt, message, conversationHistory || [])

    // 9. Guardar conversación
    const { data: conversation } = await supabase
      .from('tutor_conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('study_set_id', studySetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let conversationId
    if (conversation) {
      conversationId = conversation.id
    } else {
      const { data: newConversation } = await supabase
        .from('tutor_conversations')
        .insert({
          user_id: user.id,
          study_set_id: studySetId,
          context: { relevant_chunks: chunks?.map(c => c.id) || [] }
        })
        .select('id')
        .single()
      conversationId = newConversation.id
    }

    // Guardar mensaje del usuario
    await supabase
      .from('tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      })

    // Guardar respuesta del asistente
    await supabase
      .from('tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse.content
      })

    // 10. Construir respuesta
    const response = {
      content: aiResponse.content,
      citations: chunks?.map(chunk => ({
        chunkId: chunk.id,
        metadata: chunk.metadata
      })) || [],
      hasContext: !!context,
      provider: aiResponse.provider
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function buildSystemPrompt(context: string | null, profile: any): string {
  let prompt = `Eres un tutor de estudio personalizado para KallpaLearn AI. Tu trabajo es ayudar al estudiante a aprender usando el material que ha subido.

`

  if (context) {
    prompt += `## Material de estudio relevante:

${context}

## INSTRUCCIONES IMPORTANTES:

1. Responde basándote PRINCIPALMENTE en el material de estudio proporcionado arriba.
2. Cuando cites información del material, indica la fuente (página, diapositiva, sección, etc.).
3. Si la información NO está en el material, di claramente: "No encontré esa información en el material que subiste."
4. Después de indicar que no está en el material, PUEDES ofrecer una explicación general, pero debe estar claramente etiquetada como "conocimiento externo".
5. NO inventes que algo aparece en el material si no aparece.
6. Sé claro, educativo y alentador.
`
  } else {
    prompt += `## AVISO: No hay material de estudio disponible para este tema.

Responde con conocimiento general, pero indica claramente que no tienes acceso al material específico del estudiante.
`
  }

  if (profile) {
    prompt += `\n## Preferencias del estudiante:\n`
    if (profile.preferred_explanation_style === 'simple') {
      prompt += `- Explicar de forma simple y clara\n`
    } else if (profile.preferred_explanation_style === 'detailed') {
      prompt += `- Proporcionar explicaciones detalladas\n`
    } else if (profile.preferred_explanation_style === 'examples') {
      prompt += `- Incluir ejemplos prácticos\n`
    }
  }

  prompt += `\n## Formato de respuesta:
- Usa un tono amigable y educativo
- Estructura tus respuestas con claridad
- Usa ejemplos cuando sea apropiado
- Si hay citas del material, inclúyelas al final en el formato:
  "Fuentes: [nombre del archivo], página X" o "Fuentes: [nombre del archivo], diapositiva X"
`

  return prompt
}

async function callAIProvider(systemPrompt: string, userMessage: string, history: any[]) {
  const provider = Deno.env.get('AI_PROVIDER') || 'demo'
  
  if (provider === 'demo') {
    return {
      content: `[Modo Demo] Esta es una respuesta de demostración. Para obtener respuestas reales basadas en tu material, configura un proveedor de IA en Supabase Edge Functions.

Proveedor configurado: ${provider}
Estado: NOT_CONFIGURED`,
      provider: 'demo'
    }
  }

  if (provider === 'openai') {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o-mini'
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured in Supabase Edge Functions')
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      provider: 'openai'
    }
  }

  if (provider === 'anthropic') {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'claude-3-5-sonnet-20241022'
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured in Supabase Edge Functions')
    }

    const messages = [
      ...history,
      { role: 'user', content: userMessage }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${error}`)
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
      provider: 'anthropic'
    }
  }

  throw new Error(`Unknown AI provider: ${provider}`)
}
