const executeCSharp = async (source) => {
  const response = await fetch('http://localhost:5058/api/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ source }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      commands: [],
      errors: [{ kind: 'runtime', message: `C# execution service error: ${errText}`, line: 1, column: 1 }],
      astNodes: [],
      syntaxNodeCount: 0,
    };
  }

  return response.json();
};

module.exports = {
  executeCSharp
};
