export function checkCompletion(moduleId, sceneState, targetState) {
  const TOLERANCE = 0.15

  switch (moduleId) {
    case 1:
      return sceneState.virtualClicked === true && sceneState.anchoredClicked === true

    case 2:
      return (
        Math.abs((sceneState.box?.position?.x ?? 0) - targetState.x) <= TOLERANCE &&
        Math.abs((sceneState.box?.position?.y ?? 0) - targetState.y) <= TOLERANCE &&
        Math.abs((sceneState.box?.position?.z ?? 0) - targetState.z) <= TOLERANCE
      )

    case 3:
      return (
        sceneState.box1Parent === 'table' &&
        sceneState.box2Parent === 'table' &&
        sceneState.table?.moved === true
      )

    case 4:
      return (
        Math.abs((sceneState.light?.intensity ?? 0) - targetState.intensity) <= 0.15 &&
        sceneState.material?.color?.toLowerCase() === targetState.color?.toLowerCase() &&
        Math.abs((sceneState.material?.roughness ?? 0.5) - targetState.roughness) <= 0.15 &&
        Math.abs((sceneState.material?.metalness ?? 0) - targetState.metalness) <= 0.15
      )

    case 5:
      return sceneState.box?.hasClickHandler === true

    case 6:
      return (
        (sceneState.objectsPositioned ?? 0) >= 2 &&
        sceneState.parentChildSet === true &&
        sceneState.hasClickHandler === true
      )

    default:
      return false
  }
}
