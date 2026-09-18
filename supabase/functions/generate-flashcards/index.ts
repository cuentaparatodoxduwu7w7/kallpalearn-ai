// Supabase Edge Function: Generate Flashcards with AI
// Genera flashcards inteligentes basadas en el material del usuario

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

    // 2. Obtener studySetId
    const { studySetId } = await req.json()
    
    if (!studySetId) {
      throw new Error('Missing required parameter: studySetId')
    }

    // 3. Verificar acceso al Study Set
    const { data: studySet, error: studySetError } = await supabase
      .from('study_sets')
      .select('id, title, user_id')
      .eq('id', studySetId)
      .eq('user_id', user.id)
      .single()

    if (studySetError || !studySet) {
      throw new Error('Study set not found or access denied')
    }

    // 4. Obtener chunks del material
    const { data: chunks, error: chunksError } = await supabase
      .from('source_chunks')
      .select('id, content, metadata')
      .eq('study_set_id', studySetId)
      .eq('user_id', user.id)
      .limit(20)

    if (chunksError) {
      console.error('Error fetching chunks:', chunksError)
    }

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No hay material disponible para generar flashcards',
          status: 'no_content'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. Construir contexto
    const context = chunks.map((chunk, index) => {
      const metadata = chunk.metadata || {}
      let source = ''
      
      if (metadata.page) {
        source = `Página ${metadata.page}`
      } else if (metadata.slide) {
        source = `Diapositiva ${metadata.slide}`
      }
      
      return `[Fragmento ${index + 1}${source ? ` - ${source}` : ''}]\n${chunk.content}`
    }).join('\n\n')

    // 6. Generar flashcards con IA
    const flashcards = await generateFlashcards(context)

    // 7. Guardar flashcards en la base de datos
    const flashcardsToInsert = flashcards.map((fc, index) => {
      const chunk = chunks[index % chunks.length]
      const metadata = chunk.metadata || {}
      
      return {
        study_set_id: studySetId,
        user_id: user.id,
        front: fc.question,
        back: fc.answer,
        status: 'unfamiliar',
        is_difficult: false,
        times_reviewed: 0,
        metadata: {
          source_id: chunk.id,
          source_page: metadata.page,
          source_slide: metadata.slide,
          difficulty: fc.difficulty || 'medium'
        }
      }
    })

    const { data: insertedFlashcards, error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting flashcards:', insertError)
      throw new Error('Failed to save flashcards')
    }

    // 8. Actualizar progreso del Study Set
    await supabase
      .from('study_sets')
      .update({ 
        updated_at: new Date().toISOString(),
        progress: {
          total_cards: insertedFlashcards.length,
          mastered_cards: 0,
          familiar_cards: 0,
          learning_cards: 0,
          unfamiliar_cards: insertedFlashcards.length
        }
      })
      .eq('id', studySetId)

    return new Response(
      JSON.stringify({
        flashcards: insertedFlashcards,
        count: insertedFlashcards.length,
        status: 'success'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

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

async function generateFlashcards(context: string) {
  const provider = Deno.env.get('AI_PROVIDER') || 'demo'
  
  if (provider === 'demo') {
    // Retornar flashcards de demostración
    return [
      {
        question: '[Modo Demo] ¿Cuál es el concepto principal del material?',
        answer: '[Modo Demo] Esta es una respuesta de demostración. Configura un proveedor de IA para generar flashcards reales basadas en tu material.',
        difficulty: 'medium'
      },
      {
        question: '[Modo Demo] ¿Qué aspectos son más importantes?',
        answer: '[Modo Demo] Configura OpenAI o Anthropic en Supabase Edge Functions para obtener flashcards generadas con IA real.',
        difficulty: 'medium'
      }
    ]
  }

  const prompt = `Basándote en el siguiente material de estudio, genera 10 flashcards educativas.

Material:
${context}

Genera las flashcards en formato JSON con la siguiente estructura:
[
  {
    "question": "pregunta clara y concisa",
    "answer": "respuesta completa y educativa",
    "difficulty": "easy|medium|hard"
  }
]

Las flashcards deben:
- Ser claras y concisas
- Cubrir los conceptos más importantes del material
- Tener diferentes niveles de dificultad
- Ser útiles para el estudio y la memorización
`

  if (provider === 'openai') {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o-mini'
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Eres un experto en educación que crea flashcards efectivas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    const parsed = JSON.parse(content)
    return parsed.flashcards || parsed
  }

  if (provider === 'anthropic') {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'claude-3-5-sonnet-20241022'
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error('Anthropic API error')
    }

    const data = await response.json()
    const content = data.content[0].text
    // Extraer JSON del texto
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Failed to parse flashcards from AI response')
  }

  throw new Error(`Unknown AI provider: ${provider}`)
}
