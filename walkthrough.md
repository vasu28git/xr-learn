# Integration Walkthrough: C# XR Pipeline & Three.js Command Execution

We have integrated the newly added C# Roslyn-based XR execution pipeline with the existing frontend React application and Node/Express backend. All 7 tests in `XrCodingLab.Tests` compile and pass.

---

## 1. Modified & Created Files

### Modified Files:
*   [**`backend/server.js`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/backend/server.js): Added `/api/execute` endpoint proxy that forwards student source code to the C# execution server at `http://localhost:5058/api/execute`.
*   [**`server/Interpreting/UnityTransformInterpreter.cs`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/server/Interpreting/UnityTransformInterpreter.cs): Expanded compilation stubs (`Time`, `Light`, `Material`, `Teleporter`, `xr.SetParent`), added AST whitelisting rules, and implemented C# statement parsing for emergency alarms, teleport direction, and click event registration.
*   [**`frontend/src/lib/api.js`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/frontend/src/lib/api.js): Exposed `api.execute.run(source)` to make POST requests to the Express backend proxy.
*   [**`frontend/src/hooks/useSandbox.js`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/frontend/src/hooks/useSandbox.js): Replaced the client-side JavaScript regex-transpiler and `eval`-based local runner with a preprocessor that wraps statement-level C# scripts into standard Unity class templates and queries the C# execution service via backend API proxy.
*   [**`frontend/src/components/workspace/SceneObjects.jsx`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/frontend/src/components/workspace/SceneObjects.jsx): Added a `DynamicSceneObjects` renderer to dynamically instantiate and transform `box`, `sphere`, and `cylinder` meshes created via `xr` commands. Added checks for `hasRun` state (empty scene initially) and `hasDynamicObjects` (suppresses default module objects when rendering custom C# models).
*   [**`frontend/src/pages/Debugging.jsx`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/frontend/src/pages/Debugging.jsx): Connected the submit handler to the backend compiler proxy to check for compilation/syntax errors, and display detailed compiler warnings in the output console.
*   [**`frontend/src/pages/Training.jsx`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/frontend/src/pages/Training.jsx): Connected the editor output errors to the `lastError` state of the sandbox.

### New Files Created:
*   [**`frontend/src/utils/xrCommandExecutor.js`**](file:///c:/Users/admin/OneDrive/Desktop/xr-learn/frontend/src/utils/xrCommandExecutor.js): Created a reusable, sequential execution layer that applies C# stubs transformations to existing scene objects and dynamic registry meshes.

---

## 2. Editor Communication with C# Server (`/server`)

The communication follows a secure, centralized flow:
1.  **Editor Input**: Student writes C# code in the Monaco-based editor (either statement-level or full `MonoBehaviour` classes).
2.  **Preprocessing**: Statement-level scripts (e.g. `xr.SetPosition("box", ...);`) are wrapped inside a standard Unity boilerplate class containing `using UnityEngine;` and a `Start()` method on the client. Full class inputs are kept untouched.
3.  **Client request**: The editor calls `api.execute.run(source)` to send a POST request to `/api/execute` on the Node/Express backend.
4.  **Backend Proxy**: The Express gateway forwards the payload to the C# execution server at `http://localhost:5058/api/execute`.
5.  **Roslyn Compilation**: The C# server parses the code, analyses semantic structures, checks whitelisting constraints, executes `Start()` or `Update()` lifecycle loops, and replies with structured commands and syntax/runtime issues.
6.  **Commands Application**: The commands are delivered to the frontend, where the execution layer updates the 3D scene registry and updates the React-Three-Fiber scene state.

---

## 3. XR Command JSON Format

The C# server returns a structured array of commands with properties in PascalCase or camelCase:

```json
{
  "commands": [
    {
      "Type": "CreateCube",
      "Name": "seat",
      "Position": { "X": 0.0, "Y": 2.0, "Z": 0.0 },
      "Scale": { "X": 3.0, "Y": 0.35, "Z": 3.0 },
      "Object": "seat",
      "X": 0.0,
      "Y": 2.0,
      "Z": 0.0,
      "ScaleX": 3.0,
      "ScaleY": 0.35,
      "ScaleZ": 3.0
    },
    {
      "Type": "Rotate",
      "Name": "backrest",
      "Object": "backrest",
      "X": -10.0,
      "Y": 0.0,
      "Z": 0.0
    }
  ],
  "errors": [],
  "astNodes": ["ClassDeclarationSyntax", "MethodDeclarationSyntax", "InvocationExpressionSyntax"],
  "syntaxNodeCount": 35
}
```

---

## 4. Three.js XR Command Execution Layer

The frontend helper `executeXrCommands` processes these commands sequentially:
*   **Object Registry**: Tracks dynamic meshes by name (e.g. `"seat"`).
*   **Geometries**: Spawns `<boxGeometry>`, `<sphereGeometry>`, and `<cylinderGeometry>` based on `CreateCube`, `CreateSphere`, and `CreateCylinder` commands.
*   **Transforms**: Modifies position coordinates (`x`, `y`, `z`) and scale bounds, and calculates relative rotational offsets converting C# Euler degrees into Three.js radians (`deg * Math.PI / 180`).
*   **Event Handling**: Checks event occurrences (`RegisterClick`) to set `hasClickHandler` and support task objectives completion check.

---

## 5. Module Pipeline Reuse

All modules share the same execution architecture:
*   **Learning Pages & Training Arena**: Share the centralized `useSandbox` hook. The hook handles code execution, C# preprocessing, and updates `sceneState`.
*   **Debugging Hub**: Submits code directly to the `/api/execute` proxy to validate syntax and print real Roslyn semantic/syntactic diagnostics.

---

## 6. How to Run the Application

To run the complete system locally:

1.  **Start C# Server**:
    Run inside `/server` directory:
    ```bash
    dotnet run --urls http://localhost:5058
    ```
2.  **Start Node Backend**:
    Run inside `/backend` directory:
    ```bash
    npm run dev
    ```
3.  **Start Frontend Dev Server**:
    Run inside `/frontend` directory:
    ```bash
    npm run dev
    ```
4.  **Run Tests**:
    Run inside `/` root directory:
    ```bash
    dotnet test XrCodingLab.Tests/XrCodingLab.Tests.csproj
    ```
