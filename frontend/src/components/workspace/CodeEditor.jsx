import Editor from '@monaco-editor/react'

export default function CodeEditor({ code, onChange, onRun, onReset, error, readOnly = false }) {
  return (
    <div className="flex-1 flex flex-col h-full bg-surface border border-outline-variant rounded-lg overflow-hidden">
      {/* Editor Header / Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest h-10 shrink-0">
        <div className="flex items-center h-full">
          <div className="px-4 h-full bg-surface border-r border-outline-variant border-t-2 border-t-primary flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[14px] text-tertiary-container">data_object</span>
            <span className="font-code-md text-xs font-semibold text-on-surface">TransformController.cs</span>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant hover:text-on-surface ml-2">close</span>
          </div>
        </div>
        {/* Action Bar */}
        <div className="flex items-center gap-2 px-2">
          {onReset && (
            <button 
              onClick={onReset}
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface px-2 py-1 rounded border border-outline-variant hover:bg-surface-container-highest transition-colors font-body-sm text-[10px] uppercase font-bold tracking-wider cursor-pointer"
            >
              <span className="material-symbols-outlined text-[12px]">refresh</span>
              Reset
            </button>
          )}
          <button 
            disabled={readOnly}
            onClick={onRun}
            className="flex items-center gap-1 bg-secondary-container/20 text-secondary border border-secondary/30 hover:bg-secondary-container/40 px-3 py-1 rounded transition-colors font-body-sm text-[10px] uppercase font-bold tracking-wider cursor-pointer disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
            Run
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value || '')}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            padding: { top: 12 },
            fontFamily: "'JetBrains Mono', monospace",
            readOnly: readOnly,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            backgroundColor: '#10131a',
          }}
        />
      </div>

      {/* Error Output Panel */}
      {error && (
        <div className="bg-error-container/10 border-t border-outline-variant p-3 text-xs text-error font-code-sm flex items-start gap-2 max-h-24 overflow-y-auto">
          <span className="material-symbols-outlined text-[14px] mt-0.5">terminal</span>
          <span className="leading-relaxed">Error: {error}</span>
        </div>
      )}
    </div>
  )
}
