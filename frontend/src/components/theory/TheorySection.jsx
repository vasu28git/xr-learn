export default function TheorySection({ sections }) {
  return (
    <div className="theory-section">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'heading':
            return (
              <h2 key={index} className="theory-heading">
                {section.content}
              </h2>
            )
          case 'text':
            return (
              <p key={index} className="theory-text">
                {section.content}
              </p>
            )
          case 'highlight':
            return (
              <div key={index} className="theory-highlight">
                {section.content}
              </div>
            )
          case 'list':
            return (
              <ul key={index} className="theory-list">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
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
