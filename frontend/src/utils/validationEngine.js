/**
 * Deterministic Validation Engine
 *
 * Evaluates student XR code RESULTS (not source code) against declarative validation rules.
 * Consumes the structured sceneState produced by executeXrCommands() and the raw XR commands list.
 *
 * Pipeline:
 *   Student C# → Roslyn → XR Interpreter → XR Commands → executeXrCommands() → sceneState
 *                                                                              ↓
 *                                                                   validationEngine (this file)
 *                                                                              ↓
 *                                                         { passed, score, results[] }
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve an object's position as [x, y, z] from either:
 *   - sceneState.dynamicObjects[name].position  → array
 *   - sceneState[name].position                 → { x, y, z }
 */
function resolvePosition(sceneState, name) {
  const dyn = sceneState?.dynamicObjects?.[name]
  if (dyn?.position) {
    const p = dyn.position
    return Array.isArray(p) ? p : [p.x ?? 0, p.y ?? 0, p.z ?? 0]
  }
  const pred = sceneState?.[name]
  if (pred?.position) {
    const p = pred.position
    return Array.isArray(p) ? p : [p.x ?? 0, p.y ?? 0, p.z ?? 0]
  }
  return null
}

/**
 * Resolve an object's scale as [x, y, z]
 */
function resolveScale(sceneState, name) {
  const dyn = sceneState?.dynamicObjects?.[name]
  if (dyn?.scale) {
    const s = dyn.scale
    return Array.isArray(s) ? s : [s.x ?? 1, s.y ?? 1, s.z ?? 1]
  }
  const pred = sceneState?.[name]
  if (pred?.scale) {
    const s = pred.scale
    return Array.isArray(s) ? s : [s.x ?? 1, s.y ?? 1, s.z ?? 1]
  }
  return null
}

/**
 * Resolve an object's rotation as [x, y, z] in RADIANS
 */
function resolveRotation(sceneState, name) {
  const dyn = sceneState?.dynamicObjects?.[name]
  if (dyn?.rotation) {
    const r = dyn.rotation
    return Array.isArray(r) ? r : [r.x ?? 0, r.y ?? 0, r.z ?? 0]
  }
  const pred = sceneState?.[name]
  if (pred?.rotation) {
    const r = pred.rotation
    return Array.isArray(r) ? r : [r.x ?? 0, r.y ?? 0, r.z ?? 0]
  }
  return null
}

/**
 * Euclidean distance between two [x,y,z] arrays
 */
function distance3(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  )
}

/**
 * Check if two vectors are within tolerance on all axes
 */
function withinTolerance(actual, expected, tolerance) {
  if (!actual || !expected) return false
  return (
    Math.abs(actual[0] - expected[0]) <= tolerance &&
    Math.abs(actual[1] - expected[1]) <= tolerance &&
    Math.abs(actual[2] - expected[2]) <= tolerance
  )
}

/**
 * Get the normalised type of an object
 */
function resolveType(sceneState, name) {
  const dyn = sceneState?.dynamicObjects?.[name]
  if (dyn?.type) return dyn.type.toLowerCase()
  return null
}

/**
 * Normalise command type string
 */
function normCmd(t) {
  return (t || '').toLowerCase().replace(/[_-]/g, '')
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE EVALUATORS
// ─────────────────────────────────────────────────────────────────────────────

const ruleEvaluators = {

  /**
   * OBJECT_EXISTS: { type, name }
   */
  OBJECT_EXISTS({ rule, sceneState }) {
    const { name } = rule
    const exists = !!(
      sceneState?.dynamicObjects?.[name] ||
      (sceneState?.[name] && typeof sceneState[name] === 'object')
    )
    return {
      passed: exists,
      message: exists
        ? `✓ Object "${name}" was created.`
        : `✗ Object "${name}" was not found in the scene. Make sure you created it with the correct name.`
    }
  },

  /**
   * OBJECT_COUNT: { type, min?, max?, expected? }
   * Counts dynamic objects, optionally filtered by type.
   */
  OBJECT_COUNT({ rule, sceneState }) {
    const dynObjs = Object.values(sceneState?.dynamicObjects || {})
    const filtered = rule.type
      ? dynObjs.filter(o => (o.type || '').toLowerCase() === rule.type.toLowerCase())
      : dynObjs

    const count = filtered.length

    if (rule.expected !== undefined) {
      const passed = count === rule.expected
      return {
        passed,
        message: passed
          ? `✓ Found exactly ${rule.expected} ${rule.type || 'object'}(s).`
          : `✗ Expected ${rule.expected} ${rule.type || 'object'}(s), but found ${count}.`
      }
    }

    if (rule.min !== undefined || rule.max !== undefined) {
      const okMin = rule.min === undefined || count >= rule.min
      const okMax = rule.max === undefined || count <= rule.max
      const passed = okMin && okMax
      const range = rule.min !== undefined && rule.max !== undefined
        ? `between ${rule.min} and ${rule.max}`
        : rule.min !== undefined ? `at least ${rule.min}` : `at most ${rule.max}`
      return {
        passed,
        message: passed
          ? `✓ Object count (${count}) is within range.`
          : `✗ Expected ${range} ${rule.type || 'object'}(s), but found ${count}.`
      }
    }

    return { passed: true, message: `✓ Found ${count} object(s).` }
  },

  /**
   * OBJECT_TYPE: { type, name, expected }
   */
  OBJECT_TYPE({ rule, sceneState }) {
    const { name, expected } = rule
    const actual = resolveType(sceneState, name)
    if (!actual) {
      return { passed: false, message: `✗ Object "${name}" does not exist.` }
    }
    const passed = actual === expected.toLowerCase()
    return {
      passed,
      message: passed
        ? `✓ "${name}" is a ${expected}.`
        : `✗ "${name}" should be a ${expected}, but is a ${actual}.`
    }
  },

  /**
   * POSITION: { name, expected: [x,y,z], tolerance? }
   */
  POSITION({ rule, sceneState }) {
    const { name, expected, tolerance = 0.1 } = rule
    const actual = resolvePosition(sceneState, name)
    if (!actual) {
      return { passed: false, message: `✗ Cannot check position — object "${name}" not found.` }
    }
    const passed = withinTolerance(actual, expected, tolerance)
    const fmt = (v) => v.map(n => Number(n.toFixed(2))).join(', ')
    return {
      passed,
      message: passed
        ? `✓ "${name}" is at position (${fmt(expected)}).`
        : `✗ "${name}" should be at (${fmt(expected)}), but is at (${fmt(actual)}).`
    }
  },

  /**
   * ROTATION: { name, expected: [x,y,z] in degrees, tolerance? (degrees) }
   * Internally rotations are stored in radians, so we convert.
   */
  ROTATION({ rule, sceneState }) {
    const { name, expected, tolerance = 2 } = rule
    const actualRad = resolveRotation(sceneState, name)
    if (!actualRad) {
      return { passed: false, message: `✗ Cannot check rotation — object "${name}" not found.` }
    }
    // Convert actual radians to degrees for comparison
    const actualDeg = actualRad.map(r => r * 180 / Math.PI)
    const toleranceRad = tolerance * Math.PI / 180
    const passed = withinTolerance(actualRad, expected.map(d => d * Math.PI / 180), toleranceRad)
    const fmt = (v) => v.map(n => Number(n.toFixed(1))).join(', ')
    return {
      passed,
      message: passed
        ? `✓ "${name}" rotation is (${fmt(expected)})°.`
        : `✗ "${name}" should be rotated (${fmt(expected)})°, but is at (${fmt(actualDeg)})°.`
    }
  },

  /**
   * SCALE: { name, expected: [x,y,z], tolerance? }
   */
  SCALE({ rule, sceneState }) {
    const { name, expected, tolerance = 0.1 } = rule
    const actual = resolveScale(sceneState, name)
    if (!actual) {
      return { passed: false, message: `✗ Cannot check scale — object "${name}" not found.` }
    }
    const passed = withinTolerance(actual, expected, tolerance)
    const fmt = (v) => v.map(n => Number(n.toFixed(2))).join(', ')
    return {
      passed,
      message: passed
        ? `✓ "${name}" has scale (${fmt(expected)}).`
        : `✗ "${name}" should have scale (${fmt(expected)}), but has (${fmt(actual)}).`
    }
  },

  /**
   * DISTANCE: { name1, name2, expected, tolerance? }
   */
  DISTANCE({ rule, sceneState }) {
    const { name1, name2, expected, tolerance = 0.2 } = rule
    const pos1 = resolvePosition(sceneState, name1)
    const pos2 = resolvePosition(sceneState, name2)
    if (!pos1 || !pos2) {
      return {
        passed: false,
        message: `✗ Cannot measure distance — one or both of "${name1}", "${name2}" not found.`
      }
    }
    const dist = distance3(pos1, pos2)
    const passed = Math.abs(dist - expected) <= tolerance
    return {
      passed,
      message: passed
        ? `✓ Distance between "${name1}" and "${name2}" is ${dist.toFixed(2)} (expected ~${expected}).`
        : `✗ Distance between "${name1}" and "${name2}" is ${dist.toFixed(2)}, but expected ~${expected}.`
    }
  },

  /**
   * COMMAND_USED: { commandType }
   */
  COMMAND_USED({ rule, commands }) {
    const target = normCmd(rule.commandType)
    const used = (commands || []).some(c => normCmd(c.type || c.Type) === target)
    return {
      passed: used,
      message: used
        ? `✓ Command "${rule.commandType}" was used.`
        : `✗ Command "${rule.commandType}" was not used. Make sure you call the correct XR function.`
    }
  },

  /**
   * COMMAND_COUNT: { commandType, min?, max?, expected? }
   */
  COMMAND_COUNT({ rule, commands }) {
    const target = normCmd(rule.commandType)
    const count = (commands || []).filter(c => normCmd(c.type || c.Type) === target).length

    if (rule.expected !== undefined) {
      const passed = count === rule.expected
      return {
        passed,
        message: passed
          ? `✓ "${rule.commandType}" called ${rule.expected} time(s).`
          : `✗ "${rule.commandType}" should be called ${rule.expected} time(s), but was called ${count}.`
      }
    }

    const okMin = rule.min === undefined || count >= rule.min
    const okMax = rule.max === undefined || count <= rule.max
    const passed = okMin && okMax
    const range = rule.min !== undefined && rule.max !== undefined
      ? `between ${rule.min} and ${rule.max}`
      : rule.min !== undefined ? `at least ${rule.min}` : `at most ${rule.max}`
    return {
      passed,
      message: passed
        ? `✓ "${rule.commandType}" called ${count} time(s).`
        : `✗ "${rule.commandType}" should be called ${range} time(s), but was called ${count}.`
    }
  },

  /**
   * CODE_FEATURE: { pattern (string regex), description }
   */
  CODE_FEATURE({ rule, rawCode }) {
    const { pattern, description } = rule
    let matched = false
    try {
      matched = new RegExp(pattern, 'i').test(rawCode || '')
    } catch (e) {
      matched = false
    }
    return {
      passed: matched,
      message: matched
        ? `✓ Code contains: ${description}.`
        : `✗ Code should contain: ${description}.`
    }
  },

  /**
   * CHILD_OF: { child, parent }
   */
  CHILD_OF({ rule, sceneState }) {
    const { child, parent } = rule
    const actual = sceneState?.parents?.[child]
    const passed = actual === parent
    return {
      passed,
      message: passed
        ? `✓ "${child}" is correctly parented to "${parent}".`
        : actual
          ? `✗ "${child}" is parented to "${actual}", but should be parented to "${parent}".`
          : `✗ "${child}" has no parent. Set its transform parent to "${parent}".`
    }
  },

  /**
   * LIGHT_INTENSITY: { expected, tolerance? }
   */
  LIGHT_INTENSITY({ rule, sceneState }) {
    const { expected, tolerance = 0.1 } = rule
    const actual = sceneState?.light?.intensity ?? sceneState?.Light?.intensity
    if (actual === undefined || actual === null) {
      return { passed: false, message: `✗ No light intensity found in scene state.` }
    }
    const passed = Math.abs(actual - expected) <= tolerance
    return {
      passed,
      message: passed
        ? `✓ Light intensity is ${actual.toFixed(2)} (expected ~${expected}).`
        : `✗ Light intensity is ${actual.toFixed(2)}, but expected ~${expected}.`
    }
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VALIDATE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a challenge result against its validation rules.
 *
 * @param {object} challengeConfig   - The challenge definition (must have validation.rules)
 * @param {object} sceneState        - The XR scene state after executeXrCommands()
 * @param {Array}  commands          - The raw XR commands returned by the server
 * @param {string} rawCode           - The student's original C# source code (for CODE_FEATURE checks)
 * @returns {{ passed: boolean, score: number, results: Array }}
 */
export function validateChallenge(challengeConfig, sceneState, commands = [], rawCode = '') {
  // Support legacy function-based tests as a fallback
  if (!challengeConfig?.validation?.rules) {
    if (challengeConfig?.tests) {
      const legacyResults = challengeConfig.tests.map(t => {
        let passed = false
        try { passed = t.check(sceneState) === true } catch (e) {}
        return { ruleType: 'LEGACY', passed, message: passed ? `✓ ${t.name}` : `✗ ${t.name}` }
      })
      const score = legacyResults.length > 0
        ? Math.round((legacyResults.filter(r => r.passed).length / legacyResults.length) * 100)
        : 0
      return {
        passed: legacyResults.every(r => r.passed),
        score,
        results: legacyResults,
      }
    }
    return { passed: false, score: 0, results: [] }
  }

  const rules = challengeConfig.validation.rules
  const results = rules.map(rule => {
    const evaluator = ruleEvaluators[rule.type]
    if (!evaluator) {
      return {
        ruleType: rule.type,
        passed: false,
        message: `✗ Unknown validation rule type: "${rule.type}".`
      }
    }
    try {
      const result = evaluator({ rule, sceneState, commands, rawCode })
      return { ruleType: rule.type, ...result }
    } catch (err) {
      return {
        ruleType: rule.type,
        passed: false,
        message: `✗ Rule evaluation error: ${err.message}`
      }
    }
  })

  const passed = results.every(r => r.passed)
  const score = results.length > 0
    ? Math.round((results.filter(r => r.passed).length / results.length) * 100)
    : 0

  return { passed, score, results }
}

/**
 * Create an execution error result for when Roslyn/interpreter fails.
 */
export function executionErrorResult(errorMessage) {
  return {
    passed: false,
    score: 0,
    status: 'EXECUTION_ERROR',
    results: [{
      ruleType: 'EXECUTION_ERROR',
      passed: false,
      message: `✗ ${errorMessage || 'Your code could not be executed. Check the syntax and XR commands.'}`
    }]
  }
}
