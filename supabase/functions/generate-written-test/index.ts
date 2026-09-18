// Supabase Edge Function: Generate Written Test
// Genera exámenes escritos basados en el material del usuario

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { studySetId } = await req.json()
    if (!studySetId) throw new Error('Missing studySetId')

    // Verificar acceso
    const { data: studySet } = await supabase
      .from('study_sets')
      .select('id, user_id')
      .eq('id', studySetId)
      .eq('user_id', user.id)
      .single()

    if (!studySet) throw new Error('Study set not found')

    // Obtener chunks
    const { data: chunks } = await supabase
      .from('source_chunks')
      .select('id, content, metadata')
      .eq('study_set_id', studySetId)
      .eq('user_id', user.id)
      .limit(20)

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No hay material disponible', status: 'no_content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const context = chunks.map((chunk, index) => {
      const metadata = chunk.metadata || {}
      let source = ''
      if (metadata.page) source = `Página ${metadata.page}`
      else if (metadata.slide) source = `Diapositiva ${metadata.slide}`
      return `[Fragmento ${index + 1}${source ? ` - ${source}` : ''}]\n${chunk.content}`
    }).join('\n\n')

    // Generar preguntas
    const questions = await generateWrittenQuestions(context)

    // Crear written test
    const { data: writtenTest } = await supabase
      .from('written_tests')
      .insert({
        study_set_id: studySetId,
        user_id: user.id,
        metadata: { generated_at: new Date().toISOString() }
      })
      .select('id')
      .single()

    // Guardar preguntas
    const questionsToInsert = questions.map((q, index) => {
      const chunk = chunks[index % chunks.length]
      const metadata = chunk.metadata || {}
      
      return {
        written_test_id: writtenTest.id,
        question: q.question,
        model_answer: q.modelAnswer,
        explanation: q.explanation,
        metadata: {
          source_id: chunk.id,
          source_page: metadata.page,
          source_slide: metadata.slide,
          difficulty: q.difficulty || 'medium'
        }
      }
    })

    await supabase.from('written_questions').insert(questionsToInsert)

    return new Response(
      JSON.stringify({
        writtenTestId: writtenTest.id,
        count: questions.length,
        status: 'success'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message, status: 'error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateWrittenQuestions(context: string) {
  const provider = Deno.env.get('AI_PROVIDER') || 'demo'
  
  if (provider === 'demo') {
    return [
      {
        question: '[Modo Demo] Explica los conceptos principales del material.',
        modelAnswer: '[Modo Demo] Configura un proveedor de IA para generar preguntas reales.',
        explanation: '[Modo Demo] Esta es una pregunta de demostración.',
        difficulty: 'medium'
      }
    ]
  }

  const prompt = `Basándote en el siguiente material, genera 5 preguntas de respuesta abierta.

Material:
${context}

Genera en formato JSON:
[
  {
    "question": "pregunta abierta que requiera explicación detallada",
    "modelAnswer": "respuesta modelo completa y educativa",
    "explanation": "qué aspectos debe cubrir una buena respuesta",
    "difficulty": "easy|medium|hard"
  }
]

Las preguntas deben requerir explicaciones detalladas y comprensión profunda del material.`

  if (provider === 'openai') {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: Deno.env.get('AI_MODEL') || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un experto en educación que crea preguntas de examen efectivas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) throw new Error('OpenAI API error')

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    return parsed.questions || parsed
  }

  if (provider === 'anthropic') {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: Deno.env.get('AI_MODEL') || 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      })
    })

    if (!response.ok) throw new Error('Anthropic API error')

    const data = await response.json()
    const jsonMatch = data.content[0].text.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('Failed to parse questions from AI response')
  }

  throw new Error(`Unknown AI provider: ${provider}`)
}
