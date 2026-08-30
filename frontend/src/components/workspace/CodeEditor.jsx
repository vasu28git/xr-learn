import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'

export default function CodeEditor({ 
  code, 
  onChange, 
  onRun, 
  onReset, 
  error, 
  readOnly = false, 
  isDark = true,
  fileName = "TransformController.cs",
  language = "csharp"
}) {
  const [lineCol, setLineCol] = useState({ line: 1, col: 1 })
  const [editorInstance, setEditorInstance] = useState(null)

  const handleEditorDidMount = (editor) => {
    setEditorInstance(editor)
    editor.onDidChangeCursorPosition((e) => {
      setLineCol({
        line: e.position.lineNumber,
        col: e.position.column
      })
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface border border-outline-variant/45 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
      
      {/* Editor Header / Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest h-12 shrink-0 px-4 transition-colors duration-300">
        <div className="flex items-center gap-2 h-full">
          {/* Tab */}
          <div className="h-full border-b-2 border-b-[#6366f1] px-4 flex items-center gap-2 cursor-pointer">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></span>
            <span className="font-code-md text-xs font-semibold text-on-surface">{fileName}</span>
          </div>
        </div>

        {/* Action Bar (Only reset icon remains, save/auto-save removed) */}
        <div className="flex items-center gap-2">
          {onReset && (
            <button 
              onClick={onReset} 
              className="text-on-surface-variant hover:text-[#6366f1] p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
              title="Reset code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 11A7 7 0 0 1 11.5 18m0 0L9 15.5m2.5 2.5L9 20.5M5 13a7 7 0 0 1 7.5-7m0 0l2.5 2.5m-2.5-2.5L15 3.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={language}
          theme={isDark ? "vs-dark" : "light"}
          value={code}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
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
            tabSize: 4,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            backgroundColor: isDark ? '#10131a' : '#ffffff',
          }}
        />
      </div>

      {/* Error Output Panel */}
      {error && (
        <div className="bg-error-container/10 border-t border-outline-variant p-3.5 text-xs text-error font-code-sm flex items-start gap-2 max-h-24 overflow-y-auto">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="leading-relaxed">Error: {error}</span>
        </div>
      )}

      {/* Status Bar */}
      <div className="border-t border-outline-variant/45 bg-surface-container-lowest h-10 shrink-0 flex items-center justify-between px-4 text-[10px] font-bold text-on-surface-variant tracking-wider uppercase transition-colors duration-300">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="text-xs">{"{}"}</span> {error ? '1 Error' : '0 Errors'}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-xs">⚠</span> 0 Warnings
          </span>
          <span>Line {lineCol.line}, Col {lineCol.col}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-code-sm text-[#6366f1]">{language.toUpperCase()}</span>
          <button 
            disabled={readOnly}
            onClick={onRun}
            className="bg-[#6366f1] hover:bg-[#5053e1] text-white px-4 py-1.5 rounded-lg transition-colors font-bold uppercase cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-40"
          >
            <span>Run</span>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
