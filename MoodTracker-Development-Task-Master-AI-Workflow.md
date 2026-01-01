# MoodTracker-Development-Task-Master-AI-Workflow.md

---

🎯 Integrated Task Management System

1. TASK MASTER AI PROJECT INITIALIZATION

```bash
# Initialize Task Master AI ในโปรเจค MoodTracker
task-master init --rules cursor,windsurf,claude,roo --yes

# Configure models for our stack
task-master models \
  --set-main claude-3-5-sonnet-20241022 \
  --set-research perplexity/sonar-pro \
  --set-fallback gpt-4o

# Create project tag
task-master add-tag moodtracker-v1 --description="MoodTracker v1 Development"
task-master use-tag moodtracker-v1
```

2. สร้าง PRD (Product Requirements Document) สำหรับ Task Master AI

```markdown
# .taskmaster/docs/moodtracker-prd.txt
# MoodTracker - Complete Daylio Clone PRD

## PROJECT OVERVIEW
สร้าง MoodTracker ที่เทียบเท่า Daylio ทุกฟีเจอร์ โดยใช้ Next.js 16.1.0 และ Modern Stack

## TECH STACK
- Frontend: Next.js 16.1.0 (App Router), React 19, TypeScript 5.7
- UI: Tailwind CSS, shadcn/ui, Lucide React, Lobe Icons
- Auth: Clerk (Authentication & User Management)
- Database: Prisma + PostgreSQL (Vercel Postgres)
- Storage: Vercel Blob (สำหรับรูปภาพ)
- Deployment: Vercel
- Gateway: Vercel Gateway / Cloudflare Gateway
- AI Tools: Qwen CLI, AWS Q, AWS Bedrock

## CORE FEATURES (จาก 30+ screenshots)

### Phase 1: Core Entry System (Week 1-2)
1. 5-level mood tracking (awful, bad, meh, good, rad)
2. Activity selection with custom categories
3. Daily notes with writing templates
4. Supplementary metrics (energy, sleep, productivity, etc.)
5. Gratitude journal (3 items)

### Phase 2: Data Visualization (Week 3-4)
1. Calendar view with mood icons
2. Statistics dashboard (mood counts, activity frequency)
3. Mood stability calculation
4. "Check back soon" states for insufficient data

### Phase 3: Goals & Motivation (Week 5-6)
1. Goal creation and tracking
2. Achievement system with unlock conditions
3. Challenge templates (Get Fit, Build Habits, Better Sleep)
4. Reminder system

### Phase 4: Advanced Features (Week 7-8)
1. Year in Pixels visualization
2. Activity influence analysis
3. Custom activity/emotion libraries
4. Report generation (weekly, monthly, yearly)
5. Data export/import

## REQUIREMENTS MAPPING
ทุกฟีเจอร์ต้อง map กับ Requirement IDs (REQ-XXX-XXX)
ใช้ Zod schemas เป็น Single Source of Truth
Component registry สำหรับป้องกัน duplication

## AI AGENTS WORKFLOW
1. Architect Agent: ออกแบบ schema และ architecture
2. Engineer Agent: Implement components และ APIs
3. QA Agent: Validation และ testing
4. Workflow Agent: Deployment และ monitoring

## QUALITY GATES
- TypeScript strict mode
- 90%+ test coverage
- ESLint zero errors
- Zod validation on all inputs
- No code duplication
```

3. Parse PRD เป็น Tasks

```bash
# Parse PRD เป็น tasks
task-master parse-prd .taskmaster/docs/moodtracker-prd.txt \
  --tag=moodtracker-v1 \
  --num-tasks=50 \
  --research

# Analyze task complexity
task-master analyze-complexity --research

# Expand all tasks to subtasks
task-master expand --all --research
```

---

🔧 Task Master AI Configuration สำหรับ MoodTracker

1. MCP Configuration สำหรับ Cursor/Windsurf

```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "PERPLEXITY_API_KEY": "pplx-...",
        "OPENAI_API_KEY": "sk-...",
        "CLERK_SECRET_KEY": "sk_test_...",
        "DATABASE_URL": "postgresql://...",
        "BLOB_READ_WRITE_TOKEN": "vercel_blob_rw_...",
        "NEXT_PUBLIC_APP_URL": "http://localhost:3000"
      }
    },
    "qwen-cli": {
      "command": "qwen",
      "args": [],
      "env": {
        "QWEN_API_KEY": "..."
      }
    }
  }
}
```

2. Task Master Rules สำหรับ MoodTracker

```json
// .taskmaster/rules/moodtracker-rules.json
{
  "codingStandards": {
    "typescript": "strict",
    "zodRequired": true,
    "componentRegistry": true,
    "noDuplication": true
  },
  "fileStructure": {
    "components": "feature-based",
    "schemas": "zod-centralized",
    "services": "domain-driven"
  },
  "validationRules": {
    "preCommit": ["type-check", "lint", "test", "zod-validate"],
    "prePush": ["build", "e2e-test"]
  },
  "aiAgents": {
    "architect": ["schema-design", "architecture-review"],
    "engineer": ["component-implementation", "api-development"],
    "qa": ["testing", "validation", "security-audit"]
  }
}
```

---

📋 UPDATED TASK REGISTRY (Next.js 16.1.0 + Task Master AI)

```yaml
# .devflow/tasks/task-registry.yaml
tasks:
  # Phase 0: Project Setup with Next.js 16.1.0
  - id: TASK-000
    title: "Initialize Next.js 16.1.0 with Task Master AI"
    requirements: []
    description: "Setup project with Next.js 16.1.0, Task Master AI integration, and environment"
    estimate: "1 day"
    dependencies: []
    files:
      - "package.json"
      - "next.config.js"
      - "eslint.config.js"
      - ".taskmaster/config.json"
      - ".cursor/mcp.json"
    acceptance_criteria:
      - "Next.js 16.1.0 running"
      - "Task Master AI initialized with PRD"
      - "MCP configured for Cursor/Windsurf"
      - "Environment variables set"
    task_master_command: |
      task-master add-task --prompt="Initialize Next.js 16.1.0 with Task Master AI integration" \
        --priority=high \
        --research

  - id: TASK-001
    title: "Configure Authentication with Clerk"
    requirements: []
    description: "Setup Clerk authentication with Next.js 16.1.0 middleware"
    estimate: "1 day"
    dependencies: ["TASK-000"]
    files:
      - "src/app/layout.tsx"
      - "src/middleware.ts"
      - "src/lib/auth.ts"
      - ".env.local"
    acceptance_criteria:
      - "Clerk provider in layout"
      - "Middleware protecting routes"
      - "Auth utilities available"
      - "Test login/logout working"
    task_master_command: |
      task-master add-task --prompt="Configure Clerk authentication for Next.js 16.1.0" \
        --parent=0 \
        --priority=high \
        --dependencies=0

  - id: TASK-002
    title: "Setup Database with Prisma + Vercel Postgres"
    requirements: []
    description: "Configure Prisma with PostgreSQL, migrations, and seeding"
    estimate: "1 day"
    dependencies: ["TASK-000"]
    files:
      - "prisma/schema.prisma"
      - "src/lib/db.ts"
      - "prisma/migrations/"
      - "scripts/seed.ts"
    acceptance_criteria:
      - "Prisma schema with all models"
      - "Database client configured"
      - "Migrations run successfully"
      - "Seed data for development"
    task_master_command: |
      task-master add-task --prompt="Setup Prisma with PostgreSQL for MoodTracker" \
        --parent=0 \
        --research

  - id: TASK-003
    title: "Create Zod Schemas (Single Source of Truth)"
    requirements: ["REQ-ENTRY-001", "REQ-ENTRY-002", "REQ-ENTRY-003"]
    description: "Implement comprehensive Zod schemas for all data models"
    estimate: "2 days"
    dependencies: ["TASK-002"]
    files:
      - "src/lib/schemas/entry.schema.ts"
      - "src/lib/schemas/activity.schema.ts"
      - "src/lib/schemas/goal.schema.ts"
      - "src/lib/schemas/achievement.schema.ts"
    acceptance_criteria:
      - "All schemas validate correctly"
      - "Schemas match Prisma schema"
      - "TypeScript types generated"
      - "Error messages user-friendly"
    task_master_command: |
      task-master add-task --prompt="Create Zod schemas for MoodTracker data models" \
        --parent=2 \
        --research

  # Phase 1: Core Entry System
  - id: TASK-010
    title: "Design System with shadcn/ui + Lobe Icons"
    requirements: ["REQ-UI-ENTRY-001"]
    description: "Create design system using shadcn/ui, Tailwind, Lucide, Lobe Icons"
    estimate: "2 days"
    dependencies: ["TASK-000"]
    files:
      - "src/components/ui/"
      - "src/styles/design-tokens.css"
      - "components.json"
      - "src/lib/utils.ts"
    acceptance_criteria:
      - "Consistent design tokens"
      - "Dark/light theme support"
      - "Accessible components"
      - "Lobe Icons integrated"
    task_master_command: |
      task-master add-task --prompt="Implement design system with shadcn/ui and Lobe Icons" \
        --parent=0

  - id: TASK-011
    title: "Mood Picker Component (5-level with emoji)"
    requirements: ["REQ-UI-ENTRY-001"]
    description: "Implement 5-level mood picker with emoji and visual feedback"
    estimate: "1 day"
    dependencies: ["TASK-010"]
    files:
      - "src/components/mood/mood-picker/"
      - "src/lib/constants/mood-levels.ts"
    acceptance_criteria:
      - "5 mood levels with correct emoji"
      - "Visual feedback for selection"
      - "Keyboard navigation support"
      - "Mobile responsive"
    task_master_command: |
      task-master add-task --prompt="Create 5-level mood picker component with emoji" \
        --parent=10 \
        --research

  - id: TASK-012
    title: "Activity Selection Grid"
    requirements: ["REQ-UI-ENTRY-002", "REQ-ACTIVITY-001"]
    description: "Activity grid with categories, multi-select, and custom icons"
    estimate: "2 days"
    dependencies: ["TASK-010", "TASK-003"]
    files:
      - "src/components/activities/activity-grid/"
      - "src/components/activities/activity-category/"
    acceptance_criteria:
      - "Multi-select activity grid"
      - "Categories with collapsible sections"
      - "Custom icons and colors"
      - "Selected state visualization"
    task_master_command: |
      task-master add-task --prompt="Implement activity selection grid with categories" \
        --parent=10 \
        --research

  - id: TASK-013
    title: "Entry Form with Metrics Sliders"
    requirements: ["REQ-ENTRY-003", "REQ-UI-ENTRY-003"]
    description: "Complete entry form with metrics sliders and gratitude items"
    estimate: "2 days"
    dependencies: ["TASK-011", "TASK-012", "TASK-003"]
    files:
      - "src/components/forms/entry-form/"
      - "src/components/forms/metric-sliders/"
      - "src/components/forms/gratitude-input/"
    acceptance_criteria:
      - "All form fields working"
      - "Metrics sliders 1-10"
      - "Gratitude items (3 items)"
      - "Form validation with Zod"
    task_master_command: |
      task-master add-task --prompt="Create complete entry form with metrics and gratitude" \
        --parent=11,12 \
        --research

  - id: TASK-014
    title: "Entry API Endpoints"
    requirements: ["REQ-ENTRY-001", "REQ-ENTRY-002", "REQ-ENTRY-003", "REQ-ENTRY-004", "REQ-ENTRY-005"]
    description: "Implement CRUD API for mood entries with validation"
    estimate: "2 days"
    dependencies: ["TASK-001", "TASK-002", "TASK-003"]
    files:
      - "src/app/api/v1/entries/route.ts"
      - "src/lib/services/EntryService.ts"
      - "src/lib/validators/entry.validator.ts"
    acceptance_criteria:
      - "POST /entries creates entry"
      - "GET /entries retrieves with filters"
      - "PUT /entries/{date} updates entry"
      - "Zod validation on all endpoints"
      - "Error handling with AppError"
    task_master_command: |
      task-master add-task --prompt="Implement entry API endpoints with Zod validation" \
        --parent=2,3 \
        --research

  # Phase 2: Data Visualization
  - id: TASK-020
    title: "Calendar View with Mood Icons"
    requirements: ["REQ-UI-CALENDAR-001"]
    description: "Monthly calendar grid showing mood icons and activities"
    estimate: "3 days"
    dependencies: ["TASK-014"]
    files:
      - "src/components/calendar/calendar-grid/"
      - "src/components/calendar/day-cell/"
      - "src/hooks/use-calendar-data.ts"
    acceptance_criteria:
      - "Monthly grid view"
      - "Mood icons in date cells"
      - "Activity abbreviations"
      - "Navigation between months"
      - "Click to view/edit entry"
    task_master_command: |
      task-master add-task --prompt="Implement calendar view with mood icons" \
        --parent=14 \
        --research

  - id: TASK-021
    title: "Statistics Dashboard"
    requirements: ["REQ-UI-STATS-001"]
    description: "Dashboard with mood counts, activity frequency, average mood"
    estimate: "3 days"
    dependencies: ["TASK-014", "TASK-010"]
    files:
      - "src/components/stats/dashboard/"
      - "src/components/stats/mood-count-chart/"
      - "src/components/stats/activity-frequency/"
      - "src/lib/services/AnalyticsService.ts"
    acceptance_criteria:
      - "Mood count visualization"
      - "Top activities display"
      - "Average mood calculation"
      - "Responsive dashboard layout"
    task_master_command: |
      task-master add-task --prompt="Create statistics dashboard with charts" \
        --parent=14 \
        --research

  - id: TASK-022
    title: "Mood Stability Calculation"
    requirements: ["REQ-CALC-001", "REQ-CALC-002"]
    description: "Calculate and display mood stability score with insights"
    estimate: "2 days"
    dependencies: ["TASK-014", "TASK-021"]
    files:
      - "src/lib/calculations/mood-stability.ts"
      - "src/components/stats/stability-meter/"
      - "src/components/stats/insights-panel/"
    acceptance_criteria:
      - "Stability algorithm implemented"
      - "Score 0-100 with visual meter"
      - "'Check back soon' for insufficient data"
      - "Insights based on stability"
    task_master_command: |
      task-master add-task --prompt="Implement mood stability calculation and display" \
        --parent=21 \
        --research

  # Phase 3: Goals & Motivation
  - id: TASK-030
    title: "Goal Creation & Tracking System"
    requirements: ["REQ-GOAL-001", "REQ-GOAL-002"]
    description: "Goal creation, progress tracking, and visualization"
    estimate: "3 days"
    dependencies: ["TASK-003", "TASK-010"]
    files:
      - "src/components/goals/goal-creator/"
      - "src/components/goals/progress-tracker/"
      - "src/app/api/v1/goals/route.ts"
      - "src/lib/services/GoalService.ts"
    acceptance_criteria:
      - "Create goals tied to activities"
      - "Automatic progress tracking"
      - "Progress visualization"
      - "Goal completion detection"
    task_master_command: |
      task-master add-task --prompt="Implement goal creation and tracking system" \
        --research

  - id: TASK-031
    title: "Achievement System with Unlock Logic"
    requirements: ["REQ-ACHIEVEMENT-001", "REQ-ACHIEVEMENT-002"]
    description: "Achievement system with tiers, unlock conditions, and badges"
    estimate: "3 days"
    dependencies: ["TASK-014", "TASK-030"]
    files:
      - "src/components/achievements/achievement-card/"
      - "src/components/achievements/unlock-animation/"
      - "src/lib/services/AchievementService.ts"
      - "prisma/seed/achievements.ts"
    acceptance_criteria:
      - "Achievement definitions"
      - "Unlock condition checking"
      - "Badge display"
      - "Unlock notifications"
    task_master_command: |
      task-master add-task --prompt="Create achievement system with unlock logic" \
        --parent=30 \
        --research

  - id: TASK-032
    title: "Challenge Templates (Get Fit, Build Habits, etc.)"
    requirements: ["REQ-GOAL-003"]
    description: "Pre-defined challenge templates for common goals"
    estimate: "2 days"
    dependencies: ["TASK-030"]
    files:
      - "src/components/challenges/challenge-templates/"
      - "src/lib/constants/challenges.ts"
      - "src/app/api/v1/challenges/route.ts"
    acceptance_criteria:
      - "Challenge templates"
      - "One-click goal creation"
      - "Suggested activities"
      - "Progress tracking for challenges"
    task_master_command: |
      task-master add-task --prompt="Implement challenge templates system" \
        --parent=30 \
        --research

  # Phase 4: Advanced Features
  - id: TASK-040
    title: "Year in Pixels Visualization"
    requirements: ["REQ-VISUAL-001", "REQ-VISUAL-002"]
    description: "Year-long mood visualization with pixel grid"
    estimate: "3 days"
    dependencies: ["TASK-014", "TASK-020"]
    files:
      - "src/components/visualizations/year-in-pixels/"
      - "src/lib/calculations/year-data.ts"
      - "src/hooks/use-year-pixels.ts"
    acceptance_criteria:
      - "Pixel grid for entire year"
      - "Color coding by mood"
      - "Hover interactions"
      - "Filter by mood"
    task_master_command: |
      task-master add-task --prompt="Create Year in Pixels visualization" \
        --research

  - id: TASK-041
    title: "Activity Influence Analysis"
    requirements: ["REQ-ANALYSIS-001", "REQ-ANALYSIS-002"]
    description: "Analyze how activities affect mood with confidence levels"
    estimate: "3 days"
    dependencies: ["TASK-014", "TASK-021"]
    files:
      - "src/lib/analysis/activity-influence.ts"
      - "src/components/analysis/influence-chart/"
      - "src/components/analysis/confidence-indicator/"
    acceptance_criteria:
      - "Influence calculation algorithm"
      - "Confidence level determination"
      - "Visualization of results"
      - "'Need more data' states"
    task_master_command: |
      task-master add-task --prompt="Implement activity influence analysis" \
        --parent=21 \
        --research

  # Phase 5: Deployment & Production
  - id: TASK-050
    title: "Vercel Blob Integration for Images"
    requirements: []
    description: "Integrate Vercel Blob for image uploads and storage"
    estimate: "1 day"
    dependencies: ["TASK-001"]
    files:
      - "src/lib/blob.ts"
      - "src/app/api/upload/route.ts"
      - "src/components/media/image-uploader/"
    acceptance_criteria:
      - "Image upload functionality"
      - "Vercel Blob configured"
      - "Image optimization"
      - "Storage management"
    task_master_command: |
      task-master add-task --prompt="Integrate Vercel Blob for image storage" \
        --parent=1

  - id: TASK-051
    title: "Production Deployment Configuration"
    requirements: []
    description: "Configure Vercel deployment, environment variables, monitoring"
    estimate: "1 day"
    dependencies: ["TASK-000"]
    files:
      - "vercel.json"
      - ".env.production"
      - "scripts/deploy.sh"
      - "scripts/health-check.js"
    acceptance_criteria:
      - "Vercel project configured"
      - "Environment variables set"
      - "Deployment pipeline working"
      - "Health checks implemented"
    task_master_command: |
      task-master add-task --prompt="Configure production deployment on Vercel" \
        --priority=high

  - id: TASK-052
    title: "Quality Gates & Automated Testing"
    requirements: []
    description: "Setup automated testing, linting, and quality checks"
    estimate: "2 days"
    dependencies: ["TASK-000"]
    files:
      - "jest.config.js"
      - ".github/workflows/ci.yml"
      - "scripts/quality-gate.sh"
      - "src/tests/"
    acceptance_criteria:
      - "Unit tests for core logic"
      - "Integration tests for APIs"
      - "E2E tests for critical flows"
      - "CI/CD pipeline working"
    task_master_command: |
      task-master add-task --prompt="Setup quality gates and automated testing" \
        --priority=high \
        --research
```

---

🤖 AI AGENTS WORKFLOW WITH TASK MASTER AI

1. Daily Workflow สำหรับ AI Agents

```bash
#!/bin/bash
# .devflow/scripts/agent-daily-workflow.sh

# เช้า: ตรวจสอบ task และเริ่มทำงาน
echo "🌅 Starting Daily Workflow with Task Master AI"

# ดู task ที่ต้องทำ
task-master list --status pending --tag=moodtracker-v1

# ดู task ถัดไปที่ควรทำ (ตาม dependencies)
NEXT_TASK=$(task-master next --quiet)
echo "Next task to work on: $NEXT_TASK"

# Research ก่อนเริ่ม task (ถ้าจำเป็น)
task-master research --id=$NEXT_TASK --save-to=$NEXT_TASK

# ขยาย task เป็น subtasks (ถ้าซับซ้อน)
task-master expand --id=$NEXT_TASK --research

# เริ่มทำงานบน subtask 