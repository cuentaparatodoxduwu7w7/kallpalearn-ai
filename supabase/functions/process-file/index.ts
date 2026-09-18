// Supabase Edge Function: Process File
// Extrae contenido de archivos subidos y crea chunks

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

    const { sourceId, studySetId } = await req.json()
    
    if (!sourceId || !studySetId) {
      throw new Error('Missing required parameters')
    }

    // Obtener información de la fuente
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (sourceError || !source) {
      throw new Error('Source not found')
    }

    // Actualizar estado a processing
    await supabase
      .from('sources')
      .update({ status: 'processing', progress: 10 })
      .eq('id', sourceId)

    // Descargar archivo de Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('study-materials')
      .download(`${user.id}/${studySetId}/${source.name}`)

    if (downloadError) {
      throw new Error('Failed to download file')
    }

    // Extraer contenido basado en el tipo de archivo
    let extractedContent = ''
    const fileType = source.type.toLowerCase()

    if (fileType.includes('text') || fileType.includes('txt')) {
      extractedContent = await fileData.text()
    } else if (fileType.includes('pdf')) {
      // Para PDFs, necesitamos una librería como pdf.js
      // Por ahora, marcamos como pendiente
      extractedContent = '[PDF - Procesamiento pendiente de implementación]'
    } else if (fileType.includes('word') || fileType.includes('docx')) {
      extractedContent = '[DOCX - Procesamiento pendiente de implementación]'
    } else if (fileType.includes('image')) {
      extractedContent = '[Imagen - OCR pendiente de implementación]'
    } else {
      extractedContent = '[Tipo de archivo no soportado]'
    }

    // Actualizar fuente con contenido extraído
    await supabase
      .from('sources')
      .update({ 
        extracted_content: extractedContent,
        status: 'extracting',
        progress: 40
      })
      .eq('id', sourceId)

    // Dividir en chunks
    const chunks = splitIntoChunks(extractedContent, sourceId, studySetId, user.id)

    // Guardar chunks
    if (chunks.length > 0) {
      await supabase
        .from('source_chunks')
        .insert(chunks)

      await supabase
        .from('sources')
        .update({ 
          status: 'completed',
          progress: 100
        })
        .eq('id', sourceId)
    } else {
      await supabase
        .from('sources')
        .update({ 
          status: 'error',
          error_message: 'No se pudo extraer contenido del archivo'
        })
        .eq('id', sourceId)
    }

    return new Response(
      JSON.stringify({
        sourceId,
        chunksCount: chunks.length,
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

function splitIntoChunks(content: string, sourceId: string, studySetId: string, userId: string) {
  if (!content || content.trim().length === 0) {
    return []
  }

  const chunks = []
  const maxChunkSize = 1000
  const paragraphs = content.split(/\n\s*\n/)
  
  let currentChunk = ''
  let chunkIndex = 0

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk.trim()) {
        chunks.push({
          user_id: userId,
          study_set_id: studySetId,
          source_id: sourceId,
          content: currentChunk.trim(),
          metadata: {
            chunk_index: chunkIndex,
            page: null,
            slide: null,
            section: null
          }
        })
        chunkIndex++
      }
      currentChunk = paragraph
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      user_id: userId,
      study_set_id: studySetId,
      source_id: sourceId,
      content: currentChunk.trim(),
      metadata: {
        chunk_index: chunkIndex,
        page: null,
        slide: null,
        section: null
      }
    })
  }

  return chunks
}
