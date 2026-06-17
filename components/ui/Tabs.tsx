'use client'
import { useState } from 'react'

interface Tab { id: string; label: string }
interface TabsProps {
  tabs: Tab[]
  children: (activeId: string) => React.ReactNode
}

export default function Tabs({ tabs, children }: TabsProps) {
  const [active, setActive] = useState(tabs[0].id)
  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-gray-200 flex gap-0 px-5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              active === tab.id
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">{children(active)}</div>
    </div>
  )
}
