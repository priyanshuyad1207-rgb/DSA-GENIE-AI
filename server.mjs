import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-haiku-latest';
const apiKey = process.env.ANTHROPIC_API_KEY;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '100kb' }));
app.use(express.static(currentDirectory));

app.post('/api/tutor', async (request, response) => {
  if (!apiKey) {
    response.status(503).json({
      error: 'AI Tutor is not configured. Add ANTHROPIC_API_KEY to the .env file.'
    });
    return;
  }

  const { question, context, history } = request.body ?? {};
  if (typeof question !== 'string' || !question.trim()) {
    response.status(400).json({ error: 'A non-empty question is required.' });
    return;
  }

  const client = new Anthropic({ apiKey });
  const messages = normalizeHistory(history);
  messages.push({ role: 'user', content: buildUserPrompt(question, context) });

  try {
    const completion = await client.messages.create({
      model,
      max_tokens: 700,
      system: buildSystemPrompt(context),
      messages
    });
    const answer = completion.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (!answer) {
      response.status(502).json({ error: 'The AI Tutor returned an empty answer.' });
      return;
    }

    response.json({ answer });
  } catch (error) {
    console.error('AI Tutor request failed:', error);
    response.status(502).json({
      error: 'The AI Tutor could not answer right now. Check the server configuration and try again.'
    });
  }
});

app.listen(port, () => {
  console.log(`DSA Genie AI is running at http://localhost:${port}`);
});

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((message) =>
      message &&
      (message.role === 'user' || message.role === 'assistant') &&
      typeof message.content === 'string' &&
      message.content.trim()
    )
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim()
    }));
}

function buildSystemPrompt(context = {}) {
  return [
    context.systemPrompt ?? 'You are a friendly DSA tutor.',
    'Answer clearly for a student. Ground explanations in the supplied visualizer context.',
    'If the context does not contain enough information, say what is missing instead of inventing screen state.',
    `Current algorithm: ${context.algorithm ?? 'Unknown'}`,
    `Complexity: ${JSON.stringify(context.complexity ?? {})}`,
    `How it works: ${JSON.stringify(context.howItWorks ?? [])}`,
    `Current step explanation: ${context.currentStep ?? 'No step has been executed yet.'}`,
    `Step progress: ${context.stepNumber ?? 0}/${context.totalSteps ?? 0}`,
    `Input array: ${JSON.stringify(context.input ?? [])}`
  ].join('\n');
}

function buildUserPrompt(question, context = {}) {
  return `Student question: ${question.trim()}\nUse the current visualizer state above to answer.`;
}
