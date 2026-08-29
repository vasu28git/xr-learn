import { useState } from 'react'
import Editor from '@monaco-editor/react'

export default function CodeEditor({ code, onChange, onRun, error, readOnly = false }) {
  return (
    <div className="code-editor-panel">
      <div className="code-editor-wrapper">
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value || '')}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            readOnly: readOnly,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
          }}
        />
      </div>

      {error && (
        <div className="code-error">
          ❌ {error}
        </div>
      )}

      <div className="code-editor-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={onRun}
          disabled={readOnly}
          style={{ flex: 1 }}
        >
          ▶ Run Code
        </button>
      </div>
    </div>
  )
}
