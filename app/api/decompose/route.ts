import { NextRequest } from 'next/server'

export const maxDuration = 60

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
  status: 'todo' | 'doing' | 'done'
  subtasks: Task[]
  expanded?: boolean
}

const SYSTEM_PROMPT = `You are an expert project manager and task decomposer. Your job is to break down complex projects into clear, actionable tasks with subtasks.

When given a project description, you MUST return a JSON array of tasks. Each task has this structure:
{
  "id": "task-1",
  "title": "Task Title",
  "description": "Clear description of what needs to be done",
  "priority": "high|medium|low",
  "estimatedTime": "X hours/days",
  "status": "todo",
  "subtasks": []
}

Rules:
1. Break the project into 4-8 major tasks
2. Each major task should have 2-5 subtasks
3. Subtasks should be specific and actionable
4. Assign realistic time estimates
5. Prioritize tasks appropriately (high for critical path, medium for important, low for nice-to-have)
6. Order tasks by logical dependency (what should be done first)
7. ONLY return valid JSON, no markdown, no explanation
8. Start with the most foundational tasks first

Example response:
[
  {
    "id": "task-1",
    "title": "Project Setup",
    "description": "Initialize the project with required dependencies and configuration",
    "priority": "high",
    "estimatedTime": "2 hours",
    "status": "todo",
    "subtasks": [
      {
        "id": "task-1-1",
        "title": "Initialize repository",
        "description": "Create git repo and set up .gitignore",
        "priority": "high",
        "estimatedTime": "15 minutes",
        "status": "todo",
        "subtasks": []
      }
    ]
  }
]`

export async function POST(request: NextRequest) {
  try {
    const { projectName, projectDescription } = await request.json()

    if (!projectDescription) {
      return new Response(
        JSON.stringify({ error: 'Project description is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Project: ${projectName || 'Untitled Project'}\n\nDescription: ${projectDescription}\n\nPlease decompose this into a complete task breakdown with subtasks. Return ONLY the JSON array.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate tasks', details: errorText }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        let buffer = ''
        let fullContent = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') {
                  // Try to parse the complete content as JSON
                  try {
                    // Extract JSON from the content (might have markdown wrapping)
                    let jsonStr = fullContent
                    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/)
                    if (jsonMatch) {
                      jsonStr = jsonMatch[0]
                    }
                    const tasks = JSON.parse(jsonStr)
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'complete', tasks })}\n\n`)
                    )
                  } catch (e) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Failed to parse tasks' })}\n\n`)
                    )
                  }
                  break
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    fullContent += content
                    buffer += content

                    // Send streaming content
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`)
                    )
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Request error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
