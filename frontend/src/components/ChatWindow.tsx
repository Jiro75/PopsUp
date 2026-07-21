import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendChatMessage } from '@/services/api'
import type { ChatMessage } from '@/types'

let msgCounter = 0
const uid = () => `msg-${++msgCounter}`

const makeWelcomeMsg = (): ChatMessage => ({
  id: uid(),
  role: 'assistant',
  content: '__welcome__',
  timestamp: new Date(),
})

interface Props {
  prefilledInput?: string
  onPrefilledConsumed?: () => void
}

export default function ChatWindow({ prefilledInput, onPrefilledConsumed }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcomeMsg()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // When a suggested question is clicked, prefill the input and focus textarea
  useEffect(() => {
    if (prefilledInput) {
      setInput(prefilledInput)
      onPrefilledConsumed?.()
      textareaRef.current?.focus()
    }
  }, [prefilledInput, onPrefilledConsumed])

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

  const clearChat = () => setMessages([makeWelcomeMsg()])

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-ibm-900">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5 text-ibm-300" />
          <div>
            <p className="text-sm font-semibold text-white">HR Onboarding Assistant</p>
            <p className="text-xs text-ibm-300">Powered by IBM watsonx.ai + RAG</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          title="Clear chat"
          className="flex items-center gap-1.5 text-xs text-ibm-300 hover:text-white transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
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
            ref={textareaRef}
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

/** Render a simple welcome card instead of a plain text bubble */
function WelcomeBubble() {
  return (
    <div className="rounded-xl bg-slate-100 text-slate-800 rounded-tl-sm px-4 py-3 text-sm leading-relaxed space-y-2 animate-fade-in">
      <p className="font-semibold">👋 Welcome! I'm your AI HR Onboarding Assistant</p>
      <p className="text-xs text-slate-500">Powered by IBM watsonx.ai + RAG</p>
      <p className="text-xs text-slate-600 mt-1">Here's what I can help you with:</p>
      <ul className="text-xs text-slate-700 space-y-1 pl-1">
        <li><span className="font-medium">Onboarding policies</span> — first-day checklists, orientation schedules</li>
        <li><span className="font-medium">IT &amp; access</span> — equipment requests, system provisioning</li>
        <li><span className="font-medium">Benefits &amp; payroll</span> — leave policies, compensation questions</li>
        <li><span className="font-medium">Compliance &amp; training</span> — mandatory courses, code of conduct</li>
      </ul>
      <p className="text-xs text-slate-500 pt-1">Upload an HR document on the Upload page, then ask anything — or pick a suggested question above.</p>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const [showSources, setShowSources] = useState(false)
  const isUser = message.role === 'user'
  const isWelcome = message.content === '__welcome__'

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
        {isWelcome ? <WelcomeBubble /> : (
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
        )}

        {/* Sources toggle — not shown for welcome message */}
        {!isUser && !isWelcome && message.sources && message.sources.length > 0 && (
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

        {!isWelcome && (
          <p className="text-xs text-slate-400 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
