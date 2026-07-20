import { NavLink } from 'react-router-dom'
import {
  Home,
  Upload,
  MessageSquare,
  GitBranch,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/',         label: 'Dashboard',  icon: Home },
  { to: '/upload',   label: 'Upload',     icon: Upload },
  { to: '/chat',     label: 'AI Chat',    icon: MessageSquare },
  { to: '/workflow', label: 'Workflow',   icon: GitBranch },
]

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col bg-ibm-900 text-white shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-ibm-700">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-ibm-500">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">HR Onboarding</p>
          <p className="text-xs text-ibm-300 leading-tight">Orchestrator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-ibm-500 text-white'
                  : 'text-ibm-200 hover:bg-ibm-800 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-ibm-700">
        <p className="text-xs text-ibm-400">IBM Hackathon MVP</p>
        <p className="text-xs text-ibm-500">v0.1.0</p>
      </div>
    </aside>
  )
}
