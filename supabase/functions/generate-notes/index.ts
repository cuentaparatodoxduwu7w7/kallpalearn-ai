// Supabase Edge Function: Generate Notes
// Genera notas inteligentes basadas en el material del usuario

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

    const { studySetId } = await req.json()
    
    if (!studySetId) {
      throw new Error('Missing required parameter: studySetId')
    }

    // Verificar acceso
    const { data: studySet } = await supabase
      .from('study_sets')
      .select('id, title, user_id')
      .eq('id', studySetId)
      .eq('user_id', user.id)
      .single()

    if (!studySet) {
      throw new Error('Study set not found or access denied')
    }

    // Obtener chunks
    const { data: chunks } = await supabase
      .from('source_chunks')
      .select('id, content, metadata')
      .eq('study_set_id', studySetId)
      .eq('user_id', user.id)
      .limit(30)

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No hay material disponible', status: 'no_content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construir contexto
    const context = chunks.map((chunk, index) => {
      const metadata = chunk.metadata || {}
      let source = ''
      if (metadata.page) source = `Página ${metadata.page}`
      else if (metadata.slide) source = `Diapositiva ${metadata.slide}`
      return `[Fragmento ${index + 1}${source ? ` - ${source}` : ''}]\n${chunk.content}`
    }).join('\n\n')

    // Generar notas
    const notes = await generateNotes(context, studySet.title)

    // Guardar notas
    const { data: insertedNotes, error: insertError } = await supabase
      .from('notes')
      .insert({
        study_set_id: studySetId,
        user_id: user.id,
        title: notes.title,
        summary: notes.summary,
        main_concepts: notes.mainConcepts,
        definitions: notes.definitions,
        examples: notes.examples,
        key_points: notes.keyPoints,
        custom_content: ''
      })
      .select()
      .single()

    if (insertError) {
      throw new Error('Failed to save notes')
    }

    return new Response(
      JSON.stringify({
        notes: insertedNotes,
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

async function generateNotes(context: string, title: string) {
  const provider = Deno.env.get('AI_PROVIDER') || 'demo'
  
  if (provider === 'demo') {
    return {
      title: `[Modo Demo] Notas: ${title}`,
      summary: '[Modo Demo] Configura un proveedor de IA para generar notas reales basadas en tu material.',
      mainConcepts: ['Concepto 1', 'Concepto 2', 'Concepto 3'],
      definitions: [
        { term: 'Término 1', definition: 'Definición de demostración' }
      ],
      examples: ['Ejemplo de demostración'],
      keyPoints: ['Punto clave 1', 'Punto clave 2']
    }
  }

  const prompt = `Basándote en el siguiente material, genera notas de estudio completas.

Material:
${context}

Genera en formato JSON:
{
  "title": "título descriptivo de las notas",
  "summary": "resumen conciso del material (2-3 párrafos)",
  "mainConcepts": ["concepto1", "concepto2", "concepto3"],
  "definitions": [
    {"term": "término", "definition": "definición clara"}
  ],
  "examples": ["ejemplo práctico 1", "ejemplo práctico 2"],
  "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"]
}

Las notas deben ser claras, bien estructuradas y útiles para el estudio.`

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
          { role: 'system', content: 'Eres un experto en educación que crea notas de estudio efectivas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) throw new Error('OpenAI API error')

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
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
    const jsonMatch = data.content[0].text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('Failed to parse notes from AI response')
  }

  throw new Error(`Unknown AI provider: ${provider}`)
}
