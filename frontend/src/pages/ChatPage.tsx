import ChatWindow from '@/components/ChatWindow'
import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full px-8 py-8 max-w-3xl mx-auto gap-4">
      {/* Page header */}
      <div className="shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-5 w-5 text-ibm-500" />
          <h1 className="text-xl font-bold text-slate-800">AI Chat</h1>
        </div>
        <p className="text-sm text-slate-500">
          Ask questions about onboarding policies. The assistant retrieves relevant
          chunks from your uploaded documents using RAG.
        </p>
      </div>

      {/* Chat window fills remaining height */}
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  )
}
