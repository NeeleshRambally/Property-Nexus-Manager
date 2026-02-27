# AI Integration Guide

## Overview

The app now has AI enhancement functionality built in! Users can click "Enhance with AI" on text fields to automatically improve their content.

## Current Implementation

✅ **Frontend Components:**
- `AIEnhanceButton` - Reusable button component with sparkle icon
- `useAIEnhance` hook - Handles API calls and state management
- Integrated into Add/Edit Property modals on the description field

✅ **Backend API:**
- `POST /api/ai/enhance` - Endpoint that receives text and returns enhanced version
- Currently uses a **demo/mock implementation**

## How It Works Right Now

1. User types text in the description field
2. User clicks "Enhance with AI" button (sparkle icon ✨)
3. Button shows "Enhancing..." state
4. Backend adds generic enhancement text
5. Enhanced text replaces the original text
6. Success toast notification appears

## Integrating with Real AI (OpenAI, Claude, etc.)

### Option 1: OpenAI API

Install the package:
```bash
npm install openai
```

Update `server/routes.ts`:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function enhancePropertyDescription(text: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional property listing writer. Enhance property descriptions to be more appealing and professional while keeping them accurate and concise."
      },
      {
        role: "user",
        content: `Enhance this property description: "${text}"`
      }
    ],
    max_tokens: 200,
  });

  return completion.choices[0].message.content || text;
}
```

Add to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

### Option 2: Anthropic Claude API

Install the package:
```bash
npm install @anthropic-ai/sdk
```

Update `server/routes.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function enhancePropertyDescription(text: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `You are a professional property listing writer. Enhance this property description to be more appealing and professional while keeping it accurate and concise: "${text}"`
      }
    ],
  });

  return message.content[0].text || text;
}
```

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Option 3: Local AI (Ollama)

For free, local AI without API costs:

```bash
# Install Ollama from https://ollama.ai
ollama pull llama2
```

Update `server/routes.ts`:
```typescript
async function enhancePropertyDescription(text: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt: `Enhance this property description to be more professional and appealing: "${text}"`,
      stream: false
    })
  });

  const data = await response.json();
  return data.response || text;
}
```

## Adding AI to Other Fields

You can easily add AI enhancement to any text field:

```tsx
import { AIEnhanceButton } from "@/components/AIEnhanceButton";

<div className="space-y-2">
  <div className="flex items-center justify-between">
    <Label>Your Field</Label>
    <AIEnhanceButton
      text={yourText}
      onEnhanced={(enhanced) => setYourText(enhanced)}
      type="general"
    />
  </div>
  <Textarea
    value={yourText}
    onChange={(e) => setYourText(e.target.value)}
  />
</div>
```

## Features

✅ Sparkle icon (✨) indicates AI functionality
✅ Loading state while processing
✅ Toast notifications for success/error
✅ Button disabled when text is empty
✅ Reusable across the app
✅ Easy to integrate with any AI service

## Cost Considerations

**OpenAI GPT-4:**
- ~$0.03 per 1K tokens
- Property description: ~$0.01 per enhancement

**Claude:**
- ~$0.015 per 1K tokens
- Property description: ~$0.005 per enhancement

**Ollama (Local):**
- FREE! Runs on your machine
- Requires decent hardware (8GB+ RAM)

## Next Steps

1. Choose your AI provider
2. Get API key (or install Ollama)
3. Update the backend functions
4. Test with real enhancements
5. Add AI to other fields as needed!

## Demo Mode

The current implementation works in "demo mode" - it adds generic text to show how the feature works. This lets you:
- Test the UI/UX
- Show clients the feature
- Develop without API costs
- Switch to real AI when ready
