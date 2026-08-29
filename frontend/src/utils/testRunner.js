/**
 * Test Runner: Evaluates challenge submissions against test cases.
 * Returns an array of { name, passed } results.
 */

export function runTests(challengeConfig, sceneState) {
  if (!challengeConfig?.tests || !Array.isArray(challengeConfig.tests)) {
    return []
  }

  return challengeConfig.tests.map((test) => {
    let passed = false
    try {
      passed = test.check(sceneState) === true
    } catch (e) {
      passed = false
    }
    return {
      name: test.name,
      passed,
    }
  })
}

/**
 * Check if all tests pass for a given challenge.
 */
export function allTestsPassed(challengeConfig, sceneState) {
  const results = runTests(challengeConfig, sceneState)
  return results.length > 0 && results.every((r) => r.passed)
}
