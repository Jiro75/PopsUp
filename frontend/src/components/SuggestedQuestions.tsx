const QUESTIONS = [
  'What should a new employee do in their first week?',
  'What is the remote work policy?',
  'How do I set up my IT accounts and VPN?',
  'What mandatory training is required within 30 days?',
  'What are the PTO and benefits for new employees?',
  'Who should I contact for HR paperwork?',
]

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
}

export default function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2 font-medium">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-full border border-ibm-200 bg-ibm-50 px-3 py-1 text-xs text-ibm-700 hover:bg-ibm-100 hover:border-ibm-400 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
