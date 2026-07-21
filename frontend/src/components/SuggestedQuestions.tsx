interface Props {
  onSelect: (question: string) => void
}

const QUESTIONS = [
  'What is the onboarding process for new employees?',
  'What documents do I need to complete on my first day?',
  'How do I request IT equipment and system access?',
  'What are the company leave and vacation policies?',
  'Who do I contact for payroll and benefits questions?',
  'What mandatory compliance training is required?',
]

export default function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="shrink-0">
      <p className="text-xs text-slate-500 mb-2 font-medium">Suggested questions</p>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-full border border-ibm-200 bg-ibm-50 px-3 py-1 text-xs text-ibm-700 hover:bg-ibm-100 hover:border-ibm-400 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
