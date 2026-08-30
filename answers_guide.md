# XR-Learn Answer Guide

This document contains the complete answers and solutions for all the activities, coding challenges, and debugging tickets across the platform.

---

## 📚 Learning Modules

These modules introduce fundamental XR concepts through guided hands-on tasks.

### Module 1: What Is XR?
**Task:** Identify which object represents AR (anchored) and VR (floating).
**Solution:** This is a visual-only task. Simply click on the floating dodecahedron (VR) and the green box sitting on the surface (AR) in the 3D viewer.

### Module 2: The Coordinate System & Transforms
**Task:** Move the box to the target coordinates `(2, 0.5, -2)`.
**Solution:**
```csharp
xr.SetPosition("box", new Vector3(2f, 0.5f, -2f));
// OR
box.transform.position = new Vector3(2f, 0.5f, -2f);
```

### Module 3: Hierarchy & Parenting
**Task:** Lower the table by `0.5` units on the Y-axis and parent `box1` and `box2` to it.
**Solution:**
```csharp
xr.SetPosition("table", new Vector3(0, -0.25f, 0));
xr.SetParent("box1", "table");
xr.SetParent("box2", "table");
```

### Module 4: Lighting & Materials
**Task:** Adjust the light intensity to `1.5f` and change the material color to `#ff4444`.
**Solution:**
```csharp
Light.intensity = 1.5f;
Material.color = "#ff4444";
```

### Module 5: Interactive Events
**Task:** Register a click event handler on the box to change its color to green (`#44ff44`) when clicked.
**Solution:**
```csharp
box.OnClick += () => {
    box.color = "#44ff44";
};
```

### Module 6: XR Sandbox
**Task:** Free-play environment. No specific task, but practice creating primitives.
**Example Code:**
```csharp
xr.CreateCube("myCube", new Vector3(0, 1, 0), new Vector3(1, 1, 1));
```

---

## ⚔️ Training Challenges

These evaluate your ability to write C# code to construct XR scenes from scratch.

### Challenge 1: Build Your First Block
```csharp
xr.CreateCube("box", new Vector3(0f, 1f, 0f), new Vector3(1f, 1f, 1f));
```

### Challenge 2: Spawn Sphere and Cylinder
```csharp
xr.CreateSphere("ball", new Vector3(-1f, 2f, 0f), new Vector3(1f, 1f, 1f));
xr.CreateCylinder("column", new Vector3(1.5f, 0.5f, -1f), new Vector3(1f, 1f, 1f));
```

### Challenge 3: Center Vector Positioning
```csharp
// Midpoint between (4, 1, 2) and (-2, 3, -4)
bridge.transform.position = new Vector3(1f, 2f, -1f);
```

### Challenge 4: Scaling a Gateway
```csharp
gate.transform.localScale = new Vector3(3.0f, 4.5f, 0.5f);
```

### Challenge 5: Rotate Solar Panel
```csharp
panel.transform.Rotate(new Vector3(-15f, 45f, 0f));
```

### Challenge 6: Parenting and Hierarchy
```csharp
xr.CreateCylinder("drone", new Vector3(0, 3f, 0), new Vector3(1f, 1f, 1f));
xr.CreateCube("turbine", new Vector3(0, 3.5f, 0), new Vector3(1f, 1f, 1f));
xr.SetParent("turbine", "drone");
```

### Challenge 7: Spacing with Variables
```csharp
float spacing = 4.0f;
xr.CreateCube("light1", new Vector3(-spacing, 2f, 0), new Vector3(1f, 1f, 1f));
xr.CreateCube("light2", new Vector3(spacing, 2f, 0), new Vector3(1f, 1f, 1f));
```

### Challenge 8: Conditional Light Switches
```csharp
if (sensor.transform.position.y > 1.0f) {
    Light.intensity = 3.0f;
} else {
    Light.intensity = 0.5f;
}
```

### Challenge 9: Spiral Steps Loop
```csharp
for (int i = 0; i < 5; i++) {
    xr.CreateCube("step" + i, new Vector3((float)Mathf.Sin(i), i * 0.5f, (float)Mathf.Cos(i)), new Vector3(1f, 1f, 1f));
}
```

### Challenge 10: Satellite Construction
```csharp
xr.CreateCylinder("mast", new Vector3(0, 1f, 0), new Vector3(1f, 1f, 1f));
xr.CreateSphere("dish", new Vector3(0, 2.5f, 0), new Vector3(2f, 0.5f, 2f));
xr.SetParent("dish", "mast");
```

---

## 🐛 Debugging Tickets

These test your ability to spot logic errors, typos, and syntax mistakes in existing code.

### Ticket 101: The Non-Rotating Fan
**Bug:** Multiplying rotation speed by 0.
**Fix:**
```csharp
transform.Rotate(new Vector3(0, 0, rotationSpeed * Time.deltaTime));
```

### Ticket 102: Dim Server Room Lighting
**Bug:** Intensity is hardcoded to 0.1f.
**Fix:**
```csharp
Light.intensity = targetIntensity;
```

### Ticket 103: Teleport Target Misaligned
**Bug:** Direction is set to `Vector3.down`.
**Fix:**
```csharp
Vector3 direction = Vector3.forward;
Teleporter.SetDirection(direction);
```

### Ticket 104: Backup Fan Blade Spelling Typo
**Bug:** Typo referencing `generatrBlade` instead of `generatorBlade`.
**Fix:**
```csharp
generatorBlade.transform.Rotate(new Vector3(0, 0, rotationSpeed * Time.deltaTime));
```

### Ticket 105: Missing Warning Light Creation
**Bug:** Trying to set the position of an object that hasn't been created yet.
**Fix:**
```csharp
xr.CreateCube("warningLight", new Vector3(0, 2, 0), new Vector3(0.5f, 0.5f, 0.5f));
xr.SetPosition("warningLight", new Vector3(0, 2, 0));
```

### Ticket 106: Transverse Rotation Axis
**Bug:** Rotating on the Z-axis instead of the Y-axis.
**Fix:**
```csharp
transform.Rotate(new Vector3(0, 90f, 0));
```

### Ticket 107: Out of Scope speed Parameter
**Bug:** `speed` variable is declared inside an `if` block, making it inaccessible.
**Fix:** Move the declaration outside the `if` block.
```csharp
float speed = 180.0f;
if (true) {
    // Other logic if needed
}
transform.Rotate(new Vector3(0, 0, speed * Time.deltaTime));
```

### Ticket 108: Temperature Logic Operator
**Bug:** Logic checks if temperature is `< 35` instead of `> 35`.
**Fix:**
```csharp
if (temperature > 35.0f) {
    Light.intensity = 3.0f;
} else {
    Light.intensity = 0.2f;
}
```

### Ticket 109: Infinite Spawning Loop
**Bug:** The loop iterator `i` is never incremented.
**Fix:** Add `i++;` inside the while loop body.
```csharp
while (i < 5)
{
    xr.CreateCube("blade" + i, new Vector3(i, 0, 0), new Vector3(1, 1, 1));
    i++;
}
```

### Ticket 110: Quantum Relay Multi-Bug
**Bug:** 3 mistakes - Typo in `trg_Z`, `Vector3.back` direction, and incorrect parent `"pad_core"`.
**Fix:**
```csharp
xr.CreateCube("beam", new Vector3(0, 0, trgZ), new Vector3(1, 1, 1));
Vector3 dir = Vector3.forward;
Teleporter.SetDirection(dir);
xr.SetParent("beam", "pad");
```
