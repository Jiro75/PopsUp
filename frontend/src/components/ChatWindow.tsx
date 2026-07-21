import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendChatMessage } from '@/services/api'
import type { ChatMessage } from '@/types'

let msgCounter = 0
const uid = () => `msg-${++msgCounter}`

const WELCOME_MESSAGE = `👋 Welcome! I'm your AI HR onboarding assistant powered by IBM watsonx.ai.

I can answer questions about:
• Onboarding steps and timelines
• Company policies and compliance
• IT setup and account provisioning
• Benefits, PTO, and HR procedures

Try one of the suggested questions, or ask me anything!`

const initialMessage = (): ChatMessage => ({
  id: uid(),
  role: 'assistant',
  content: WELCOME_MESSAGE,
  timestamp: new Date(),
})

interface ChatWindowProps {
  prefillMessage?: string
}

export default function ChatWindow({ prefillMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Pre-fill input when a suggested question is clicked
  useEffect(() => {
    if (prefillMessage) setInput(prefillMessage)
  }, [prefillMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage({ message: text })
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error. Please check the backend connection.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => setMessages([initialMessage()])

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5 bg-ibm-900">
        <Bot className="h-5 w-5 text-ibm-300" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">HR Onboarding Assistant</p>
          <p className="text-xs text-ibm-300">Powered by IBM watsonx.ai + RAG</p>
        </div>
        <button
          onClick={clearChat}
          title="Clear chat"
          className="text-ibm-400 hover:text-white transition-colors p-1 rounded"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about onboarding policies…  (Enter to send)"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ibm-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={cn(
              'shrink-0 flex items-center justify-center rounded-lg h-10 w-10 transition-colors',
              input.trim() && !loading
                ? 'bg-ibm-500 text-white hover:bg-ibm-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">Shift+Enter for new line</p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold mt-0.5',
          isUser ? 'bg-ibm-500' : 'bg-slate-700',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-xl px-4 py-2.5 text-sm leading-relaxed animate-fade-in',
            isUser
              ? 'bg-ibm-500 text-white rounded-tr-sm'
              : 'bg-slate-100 text-slate-800 rounded-tl-sm',
          )}
        >
          {message.content}
        </div>

        {/* Sources toggle */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="pl-1">
            <button
              onClick={() => setShowSources((v) => !v)}
              className="flex items-center gap-1 text-xs text-ibm-500 hover:text-ibm-700 transition-colors"
            >
              <ChevronDown
                className={cn('h-3 w-3 transition-transform', showSources && 'rotate-180')}
              />
              {showSources ? 'Hide' : 'Show'} {message.sources.length} source
              {message.sources.length !== 1 ? 's' : ''}
            </button>
            {showSources && (
              <div className="mt-1 space-y-1">
                {message.sources.map((src, i) => (
                  <p
                    key={i}
                    className="rounded bg-ibm-50 border border-ibm-100 px-3 py-1.5 text-xs text-slate-600 leading-relaxed"
                  >
                    {src}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-slate-400 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
