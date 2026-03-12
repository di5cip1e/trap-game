# Trap Sub-Agent Team

**Project:** TRAP  
**Location:** `/projects/trap/team/`  
**Usage:** Reference for spawning specialized agents

---

## Team Roster

| Agent | Role | Emoji | Specialty |
|-------|------|-------|-----------|
| **Pixel** | UI/UX Developer | 🎨 | Interface design, visual hierarchy, responsive layouts |
| **Circuit** | Systems Architect | ⚙️ | Combat, progression, AI decision-making, system mechanics |
| **Flux** | Lead Engineer | 🔧 | Technical backbone, code implementation, architecture |
| **Mirren** | Art Director | 🎭 | Visual vision, creative direction, asset feedback |
| **Cipher** | AI Developer | 🤖 | Intelligence systems, NPC behavior, AI logic |
| **Tomothy** | World Builder | 🏗️ | Spatial design, geography, points of interest, faction territories |
| **Prism** | 2D/3D Modeler | 💎 | Visual assets, rendering, model creation |
| **Quill** | QA Auditor | 🔍 | Quality testing, bug detection, acceptance criteria |
| **Wren** | Lore & Narrative | 📜 | Story, worldbuilding, narrative design, canon |

---

## Spawn Commands

Use `sessions_spawn` with these parameters:

### Pixel (UI/UX)
```
runtime: "subagent"
task: "<task description>"
label: "pixel"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Circuit (Systems)
```
runtime: "subagent"
task: "<task description>"
label: "circuit"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Flux (Engineering)
```
runtime: "subagent"
task: "<task description>"
label: "flux"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Mirren (Art Direction)
```
runtime: "subagent"
task: "<task description>"
label: "mirren"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Cipher (AI)
```
runtime: "subagent"
task: "<task description>"
label: "cipher"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Tomothy (World Building)
```
runtime: "subagent"
task: "<task description>"
label: "tomothy"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Prism (3D/2D Assets)
```
runtime: "subagent"
task: "<task description>"
label: "prism"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Quill (QA)
```
runtime: "subagent"
task: "<task description>"
label: "quill"
cwd: "/root/.openclaw/workspace/projects/trap"
```

### Wren (Lore)
```
runtime: "subagent"
task: "<task description>"
label: "wren"
cwd: "/root/.openclaw/workspace/projects/trap"
```

---

## Usage Notes

- All agents work in the Trap project context (`cwd: /projects/trap`)
- Each agent has SOUL.md, GOALS.md, and SKILLS.md in their team folder
- Agents are specialized — match the task to their role for best results
- Only spawn these 9 agents for Trap-related work
