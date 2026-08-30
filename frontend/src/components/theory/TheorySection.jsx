export default function TheorySection({ sections }) {
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'heading':
            return (
              <h3 key={index} className="text-base font-bold text-on-surface tracking-tight mt-6 first:mt-0 mb-2">
                {section.content}
              </h3>
            )
          case 'text':
            return (
              <p key={index} className="text-xs text-on-surface-variant leading-relaxed mb-4">
                {section.content}
              </p>
            )
          case 'highlight':
            return (
              <div key={index} className="bg-surface-container-lowest border border-outline-variant/35 rounded-2xl p-4 font-mono text-[10px] text-[#6366f1] overflow-x-auto my-4 shadow-inner dark:bg-surface-container-low">
                <code>{section.content}</code>
              </div>
            )
          case 'list':
            return (
              <ul key={index} className="space-y-2.5 my-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-[#6366f1]/10 text-[#6366f1] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
