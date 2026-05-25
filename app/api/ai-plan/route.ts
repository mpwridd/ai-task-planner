import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { goal, projectName } = await request.json()

    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 })
    }

    const apiKey = process.env.MIMO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'MIMO_API_KEY not configured' }, { status: 500 })
    }

    const prompt = `You are a project planning expert. Break down the following goal into actionable tasks for a project called "${projectName}".

Goal: ${goal}

Return a JSON array of tasks. Each task should have:
- "title": A clear, actionable task title (string)
- "description": Brief description of what needs to be done (string)
- "priority": "low", "medium", or "high" (string)
- "status": always "todo" (string)

Return ONLY the JSON array, no other text. Example format:
[
  {
    "title": "Research competitors",
    "description": "Analyze top 5 competitors in the market",
    "priority": "high",
    "status": "todo"
  }
]

Generate 5-10 tasks that cover the goal comprehensively.`

    const response = await fetch('http://100.91.112.121:8317/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Mimo-V2.5-Pro',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful project planning assistant. Always respond with valid JSON arrays only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mimo API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate plan from AI' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Parse the JSON response
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = content.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
      }
      
      const tasks = JSON.parse(jsonStr)
      
      if (!Array.isArray(tasks)) {
        throw new Error('Response is not an array')
      }

      return NextResponse.json({ tasks })
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('AI Plan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
