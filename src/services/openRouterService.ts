interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

interface ChatClassification {
    priority: 'normal' | 'priority';
    category: string;
    sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry';
    needsHuman: boolean;
    suggestedActions: string[];
}

class OpenRouterService {
    private apiKey: string = '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';
    private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    private model: string = 'x-ai/grok-4-fast:free';

    constructor() {
        // Configuration is now hardcoded
    }

    private getSystemPrompt(): string {
        return `You are an intelligent customer support AI assistant for Logic Legends, a tech support platform. Your role is to:

1. Provide helpful, accurate, and empathetic customer support
2. Classify issues by priority (normal, priority) and category
3. Detect customer sentiment and respond appropriately
4. Determine when human intervention is needed
5. Suggest practical solutions and next steps

GUIDELINES:
- Be professional, friendly, and solution-oriented
- For urgent issues (system down, critical bugs), escalate immediately
- For frustrated customers, show empathy and offer immediate help
- Provide clear, actionable steps
- Ask clarifying questions when needed
- Keep responses concise but thorough
- Always offer to create a support ticket for complex issues

CRITICAL: You MUST respond with a valid JSON object in this exact format:
{
  "message": "Your response to the customer",
  "classification": {
    "priority": "normal|priority",
    "category": "general|technical|billing|account|shipping|product_quality",
    "sentiment": "positive|neutral|frustrated|angry",
    "needsHuman": true/false,
    "suggestedActions": ["action1", "action2"]
  }
}

Do not include any text before or after the JSON. Do not wrap it in code blocks or backticks.

Current conversation context: Customer support chat session.`;
    }

    async generateResponse(userMessage: string, conversationHistory: OpenRouterMessage[] = []): Promise<{
        message: string;
        classification: ChatClassification;
    }> {
        try {
            const messages: OpenRouterMessage[] = [
                { role: 'system', content: this.getSystemPrompt() },
                ...conversationHistory,
                { role: 'user', content: userMessage }
            ];

            console.log('Calling OpenRouter API with messages:', messages);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenRouter API error:', response.status, response.statusText, errorText);
                throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
            }

            const data: OpenRouterResponse = await response.json();
            const aiResponse = data.choices[0]?.message?.content;

            console.log('OpenRouter API response:', aiResponse);

            if (!aiResponse) {
                throw new Error('No response from OpenRouter API');
            }

            // Try to parse JSON response
            try {
                let jsonString = aiResponse.trim();

                console.log('Attempting to parse response as JSON:', jsonString);

                // If response starts with ```json, remove it
                if (jsonString.startsWith('```json')) {
                    jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                }
                // If response starts with ```, remove it
                else if (jsonString.startsWith('```')) {
                    jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                // Try to find JSON object in the response
                const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonString = jsonMatch[0];
                }

                console.log('Cleaned JSON string:', jsonString);

                const parsedResponse = JSON.parse(jsonString);

                // Validate the response structure
                if (!parsedResponse.message || !parsedResponse.classification) {
                    throw new Error('Invalid response structure');
                }

                console.log('Successfully parsed response:', parsedResponse);

                return {
                    message: parsedResponse.message,
                    classification: parsedResponse.classification
                };
            } catch (parseError) {
                console.warn('Failed to parse OpenRouter response as JSON, using fallback classification:', parseError);
                return {
                    message: aiResponse,
                    classification: this.getFallbackClassification(userMessage)
                };
            }

        } catch (error) {
            console.error('OpenRouter API Error:', error);
            // Return fallback response
            return this.getFallbackResponse(userMessage);
        }
    }

    private getFallbackClassification(message: string): ChatClassification {
        const text = message.toLowerCase();

        let priority: 'normal' | 'priority' = 'normal';
        if (text.includes('urgent') || text.includes('emergency') || text.includes('critical') ||
            text.includes('down') || text.includes('not working') || text.includes('broken') ||
            text.includes('issue') || text.includes('problem') || text.includes('error') ||
            text.includes('help') || text.includes('billing') || text.includes('payment')) {
            priority = 'priority';
        }

        let category = 'general';
        if (text.includes('billing') || text.includes('payment') || text.includes('charge')) {
            category = 'billing';
        } else if (text.includes('password') || text.includes('login') || text.includes('account')) {
            category = 'account';
        } else if (text.includes('bug') || text.includes('error') || text.includes('not working') || text.includes('technical')) {
            category = 'technical';
        } else if (text.includes('shipping') || text.includes('delivery') || text.includes('package')) {
            category = 'shipping';
        } else if (text.includes('quality') || text.includes('defect') || text.includes('damaged')) {
            category = 'product_quality';
        }

        let sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry' = 'neutral';
        if (text.includes('frustrated') || text.includes('annoyed') || text.includes('terrible') || text.includes('worst')) {
            sentiment = 'frustrated';
        } else if (text.includes('furious') || text.includes('angry') || text.includes('outraged') || text.includes('disgusted')) {
            sentiment = 'angry';
        } else if (text.includes('thank') || text.includes('great') || text.includes('excellent') || text.includes('love')) {
            sentiment = 'positive';
        }

        return {
            priority,
            category,
            sentiment,
            needsHuman: priority === 'priority' || sentiment === 'angry',
            suggestedActions: this.getSuggestedActions(category, priority)
        };
    }

    private getSuggestedActions(category: string, priority: string): string[] {
        const actions: string[] = [];

        if (priority === 'priority') {
            actions.push('Escalate to priority support team');
            actions.push('Schedule immediate callback');
        }

        switch (category) {
            case 'billing':
                actions.push('Review billing details', 'Contact billing specialist');
                break;
            case 'account':
                actions.push('Send password reset link', 'Verify account information');
                break;
            case 'technical':
                actions.push('Gather system information', 'Run diagnostic tests');
                break;
            case 'shipping':
                actions.push('Track package status', 'Contact shipping carrier');
                break;
            case 'product_quality':
                actions.push('Document issue details', 'Initiate return process');
                break;
            default:
                actions.push('Create support ticket', 'Provide general assistance');
        }

        return actions;
    }

    private getFallbackResponse(userMessage: string): {
        message: string;
        classification: ChatClassification;
    } {
        const classification = this.getFallbackClassification(userMessage);

        let message = "Thank you for contacting Logic Legends support. I'm here to help you with your inquiry.";

        if (classification.sentiment === 'frustrated' || classification.sentiment === 'angry') {
            message = "I understand your frustration, and I sincerely apologize for any inconvenience. Let me help resolve this issue as quickly as possible.";
        } else if (classification.priority === 'priority') {
            message = "I've identified this as a high-priority issue. I'm immediately connecting you with our specialized support team for urgent assistance.";
        }

        message += " Could you please provide more details about your specific concern so I can assist you better?";

        return { message, classification };
    }

    // Method to generate conversation summary for ticket creation
    async generateTicketSummary(conversationHistory: OpenRouterMessage[]): Promise<{
        title: string;
        description: string;
        category: string;
    }> {
        try {
            const summaryPrompt = `Based on this customer support conversation, generate a concise ticket summary in JSON format. You MUST respond with valid JSON only, no additional text.

{
  "title": "Brief descriptive title for the issue",
  "description": "Detailed description of the customer's problem and context",
  "category": "general|technical|billing|account|shipping|product_quality"
}

Conversation history:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: summaryPrompt }],
                    temperature: 0.3,
                    max_tokens: 300
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
            }

            const data: OpenRouterResponse = await response.json();
            const summaryText = data.choices[0]?.message?.content?.trim() || '{}';

            // Try to parse JSON response
            try {
                let jsonString = summaryText;

                // If response starts with ```json, remove it
                if (jsonString.startsWith('```json')) {
                    jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                }
                // If response starts with ```, remove it
                else if (jsonString.startsWith('```')) {
                    jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                // Try to find JSON object in the response
                const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonString = jsonMatch[0];
                }

                const summary = JSON.parse(jsonString);

                return {
                    title: summary.title || 'Support Request from Chat',
                    description: summary.description || 'Customer support request initiated from chat conversation.',
                    category: summary.category || 'general'
                };
            } catch (parseError) {
                console.warn('Failed to parse ticket summary as JSON:', parseError);
                // Fallback: extract information from the raw text
                const lines = summaryText.split('\n').filter(line => line.trim());
                return {
                    title: lines[0] || 'Support Request from Chat',
                    description: summaryText || 'Customer support request initiated from chat conversation.',
                    category: 'general'
                };
            }
        } catch (error) {
            console.error('Error generating ticket summary:', error);
            return {
                title: 'Support Request from Chat',
                description: 'Customer support request initiated from chat conversation.',
                category: 'general'
            };
        }
    }
}

export const openRouterService = new OpenRouterService();
export type { ChatClassification, OpenRouterMessage };