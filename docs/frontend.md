# Frontend Architecture - Ordito

## Overview
Ordito is a cross-platform desktop application for command execution and management built with React, TypeScript, and Tauri. The UI follows a dashboard-style layout optimized for power users and developers.

## Design System

### Technology Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Components**: shadcn/ui
- **Desktop**: Tauri (Rust backend)
- **Package Manager**: Bun

### Theme System
- **System Theme Detection**: Automatically adjusts to system light/dark preference
- **Implementation**: Add `dark` or `light` class to HTML tag
- **shadcn Integration**: Built-in theme support through CSS variables

## Required shadcn/ui Components

### Core Layout Components
- **`Card`** - Primary container for command items in dashboard
- **`Button`** - Command execution, actions, navigation
- **`ScrollArea`** - Command lists and output areas
- **`Separator`** - Visual section dividers
- **`Skeleton`** - Loading states for commands

### Navigation & Organization
- **`Breadcrumb`** - Folder navigation hierarchy
- **`ContextMenu`** - Right-click actions on commands/folders
- **`DropdownMenu`** - Command options, settings menu
- **`NavigationMenu`** - Top-level navigation (if needed)
- **`Tabs`** - Different views (All Commands, Favorites, Recent)

### Data Input & Management
- **`Dialog`** - Create/edit commands, settings, export dialog
- **`Form`** - Command creation/editing forms
- **`Input`** - Command name, search, folder names
- **`Textarea`** - Command scripts, descriptions
- **`Select`** - Command categories, execution environments
- **`Switch`** - Enable/disable commands, settings toggles
- **`Checkbox`** - Multi-select commands, feature flags
- **`Label`** - Form field labels

### Feedback & Status
- **`Badge`** - Command status (running, success, failed), tags
- **`Alert`** - Error messages, warnings, notifications
- **`AlertDialog`** - Confirmation dialogs (delete commands, etc.)
- **`Sonner`** - Success/error notifications for quick actions (better toast alternative)
- **`Progress`** - Command execution progress (if determinable)
- **`Spinner`** (or loading state) - Command execution indicator

### Data Display
- **`Table`** - Alternative view for command lists (optional)
- **`Tooltip`** - Command descriptions, keyboard shortcuts
- **`Collapsible`** - Expandable command output sections
- **`Sheet`** - Slide-out panels for command details/output

### Advanced Features
- **`Command`** - Command palette for quick command search/execution
- **`Popover`** - Quick actions, context information
- **`Calendar`** - Scheduling interface (for automation features)
- **`Menubar`** - Application menu (File, Edit, View, Help)

## Layout Structure

### Dashboard Layout
```
┌─────────────────────────────────────────────────────┐
│ Header (Search, Breadcrumb, Settings, Theme)       │
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ Command │ │ Command │ │ Command │ │   Add   │    │
│ │  Card   │ │  Card   │ │  Card   │ │ Command │    │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│ │ Command │ │ Command │ │ Command │               │
│ │  Card   │ │  Card   │ │  Card   │               │
│ │(running)│ └─────────┘ └─────────┘               │
│ └─────────┘                                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Output Panel (Collapsible)                          │
│ [Command execution output, logs]                    │
└─────────────────────────────────────────────────────┘
```

### Command Card Structure
- **Title**: Command name
- **Description**: Brief command description
- **Status Badge**: Execution status (idle, running, success, failed)
- **Actions**: Run, Edit, Delete (via context menu or buttons)
- **Metadata**: Last run time, execution count, folder path

## Key Features

### Folder Organization
- **Breadcrumb Navigation**: Show current folder path
- **Folder Cards**: Special cards for navigating into subfolders
- **Context Menu**: Create folder, rename, delete operations

### Quick Execution
- **System Tray Integration**: Quick access to frequently used commands
- **Command Palette**: Fast command search and execution (Cmd/Ctrl + K)
- **Keyboard Shortcuts**: Execute commands without mouse interaction

### Session Management
- **Output Panel**: Collapsible bottom panel showing current execution
- **Real-time Updates**: Live output streaming for running commands
- **Execution History**: Recent command runs with timestamps

### Data Export
- **Export Dialog**: JSON export with folder structure preservation
- **Import Dialog**: Restore commands from JSON backup
- **Migration Support**: Upgrade data format between versions

## Accessibility Features
- **Keyboard Navigation**: Full keyboard support for all actions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Support for system high contrast modes
- **Focus Indicators**: Clear focus states for all interactive elements

## Performance Considerations
- **Virtual Scrolling**: For large command lists (if needed)
- **Lazy Loading**: Command cards loaded as needed
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Debounced Search**: Efficient filtering and searching

## Component Architecture

### Core Components We Need to Build

#### Layout Components (`src/components/layout/`)
- **`app-layout.tsx`** - Main application shell with header, content area, and output panel
- **`header.tsx`** - Top navigation with breadcrumbs, search, theme toggle, settings
- **`output-panel.tsx`** - Collapsible bottom panel for command execution output
- **`sidebar.tsx`** - Optional sidebar for quick navigation (if needed later)

#### Command Components (`src/components/command/`)
- **`command-card.tsx`** - Individual command display card with title, description, status, actions
- **`command-grid.tsx`** - Grid layout container for command cards
- **`command-executor.tsx`** - Handles command execution logic and status updates
- **`command-form.tsx`** - Create/edit command dialog form
- **`command-actions.tsx`** - Action buttons (run, edit, delete, duplicate)
- **`command-status.tsx`** - Status badge component (idle, running, success, failed)
- **`command-output.tsx`** - Real-time command output display
- **`command-search.tsx`** - Search and filter commands functionality

#### Folder Components (`src/components/folder/`)
- **`folder-card.tsx`** - Folder display card for navigation
- **`folder-breadcrumb.tsx`** - Breadcrumb navigation for current path
- **`folder-form.tsx`** - Create/rename folder dialog
- **`folder-tree.tsx`** - Tree view for folder structure (optional)

#### Feature Components (`src/components/features/`)
- **`command-palette.tsx`** - Quick command search and execution (Cmd+K)
- **`theme-provider.tsx`** - System theme detection and management  
- **`export-dialog.tsx`** - JSON data export functionality
- **`import-dialog.tsx`** - JSON data import functionality
- **`settings-panel.tsx`** - Application settings and preferences
- **`system-tray-menu.tsx`** - System tray integration for quick access

#### UI Enhancement Components (`src/components/ui/`)
- **`loading-spinner.tsx`** - Custom loading states
- **`empty-state.tsx`** - Empty folder/no commands state
- **`confirmation-dialog.tsx`** - Reusable confirmation dialogs
- **`keyboard-shortcuts.tsx`** - Global keyboard shortcut handler
- **`auto-resize-textarea.tsx`** - Smart textarea for command scripts

### State Management Structure (`src/store/`)
- **`command-store.ts`** - Commands data, CRUD operations, execution state
- **`folder-store.ts`** - Folder structure, navigation state
- **`settings-store.ts`** - Application settings, theme, preferences
- **`execution-store.ts`** - Current command execution, output, history

### Custom Hooks (`src/hooks/`)
- **`use-commands.ts`** - Command CRUD operations
- **`use-folders.ts`** - Folder navigation and management
- **`use-execution.ts`** - Command execution and output handling
- **`use-keyboard-shortcuts.ts`** - Global keyboard shortcuts
- **`use-system-theme.ts`** - System theme detection
- **`use-export-import.ts`** - Data export/import functionality

### Utility Functions (`src/lib/`)
- **`command-utils.ts`** - Command validation, formatting, execution helpers
- **`folder-utils.ts`** - Folder path manipulation, validation
- **`export-utils.ts`** - JSON export/import logic
- **`tauri.ts`** - Tauri API wrapper functions
- **`constants.ts`** - App constants, default values, configuration

### Type Definitions (`src/types/`)
- **`command.ts`** - Command data structure, status, metadata
- **`folder.ts`** - Folder structure, navigation types
- **`execution.ts`** - Execution state, output, history types
- **`settings.ts`** - Application settings, preferences types
- **`api.ts`** - Tauri API response types

## File Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components + custom UI components
│   ├── layout/          # App layout components
│   ├── command/         # Command-related components
│   ├── folder/          # Folder navigation components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── app/                 # Main application entry point
```

## Installation Commands

### Initial shadcn/ui Setup
```bash
# Initialize shadcn/ui in the project
bunx shadcn@latest init

# Install all required components
bunx shadcn@latest add \
  card button scroll-area separator skeleton \
  breadcrumb context-menu dropdown-menu tabs \
  dialog form input textarea select switch checkbox label \
  badge alert alert-dialog sonner progress tooltip \
  table collapsible sheet \
  command popover calendar menubar
```

### Theme Setup
```bash
# The theme provider should be automatically configured during init
# Ensure these are in your dependencies (should be added by shadcn init):
# - "class-variance-authority" ✓ (already installed)
# - "clsx" ✓ (already installed) 
# - "tailwind-merge" ✓ (already installed)
```

### Additional Required Packages
```bash
# Install all additional packages
bun add \
  zod react-hook-form @hookform/resolvers \
  date-fns \
  next-themes \
  cmdk sonner \
  zustand \
  react-hotkeys-hook
```

## Configuration & Setup Tasks

### Environment Setup
- **`tailwind.config.js`** - Configure Tailwind with shadcn/ui integration
- **`components.json`** - shadcn/ui configuration file (created by init)
- **`tsconfig.json`** - TypeScript path aliases for clean imports
- **`vite.config.ts`** - Path resolution for @/ imports
- **`.eslintrc.js`** - ESLint rules for React/TypeScript

### CSS & Styling
- **`src/styles/globals.css`** - Global styles and CSS variables for themes
- **`src/styles/components.css`** - Component-specific styles if needed
- **CSS Variables** - Light/dark theme color definitions

### Tauri Integration Files
- **`src/lib/tauri-api.ts`** - Wrapper functions for Tauri commands
- **`src-tauri/src/commands/`** - Rust command handlers for:
  - Command CRUD operations
  - File system operations (save/load commands)
  - Command execution
  - System tray management
  - Export/import functionality

## Implementation Roadmap

### Phase 1: Foundation (Core Infrastructure)
1. **Environment Setup**
   - Initialize shadcn/ui and install all components
   - Configure Tailwind, TypeScript paths, and ESLint
   - Set up global CSS variables and theme system

2. **Type System**
   - Create all TypeScript interfaces (`command.ts`, `folder.ts`, etc.)
   - Define API contracts between frontend and Tauri backend

3. **State Management**
   - Implement Zustand stores for commands, folders, settings, execution
   - Create store persistence for local data storage

### Phase 2: Core UI Components
4. **Layout Structure**
   - `app-layout.tsx` - Main application shell
   - `header.tsx` - Navigation and search
   - `output-panel.tsx` - Execution output display

5. **Basic Command System**
   - `command-card.tsx` - Command display
   - `command-grid.tsx` - Card layout
   - `command-form.tsx` - Create/edit commands
   - `command-status.tsx` - Status indicators

### Phase 3: Advanced Features
6. **Folder Navigation**
   - `folder-card.tsx` and `folder-breadcrumb.tsx`
   - Folder CRUD operations

7. **Command Execution**
   - `command-executor.tsx` - Execute commands via Tauri
   - Real-time output streaming
   - Execution history

8. **Enhanced UX**
   - `command-palette.tsx` - Quick search (Cmd+K)
   - `keyboard-shortcuts.tsx` - Global shortcuts
   - Theme system integration

### Phase 4: Data & System Integration
9. **Data Management**
   - Export/import dialogs and functionality
   - Data validation and migration
   - Backup/restore features

10. **System Integration**
    - System tray menu and quick actions
    - Auto-start and background execution
    - System notifications

### Phase 5: Polish & Optimization
11. **Performance**
    - Virtual scrolling for large command lists
    - Lazy loading and code splitting
    - Memory optimization

12. **Accessibility & UX**
    - Keyboard navigation
    - Screen reader support
    - Error handling and user feedback
    - Loading states and transitions

## File Creation Checklist

### Required Configuration Files
- [ ] Update `tailwind.config.js` with shadcn/ui settings
- [ ] Configure `tsconfig.json` path mapping
- [ ] Set up `src/styles/globals.css` with theme variables
- [ ] Create `src/lib/utils.ts` (shadcn/ui utility functions)

### Core Type Definitions
- [ ] `src/types/command.ts` - Command interface and enums
- [ ] `src/types/folder.ts` - Folder structure types
- [ ] `src/types/execution.ts` - Execution state types
- [ ] `src/types/settings.ts` - App settings types
- [ ] `src/types/api.ts` - Tauri API types

### State Management
- [ ] `src/store/command-store.ts` - Commands CRUD and state
- [ ] `src/store/folder-store.ts` - Folder navigation
- [ ] `src/store/settings-store.ts` - App preferences
- [ ] `src/store/execution-store.ts` - Execution tracking

### Custom Hooks
- [ ] `src/hooks/use-commands.ts` - Command operations
- [ ] `src/hooks/use-folders.ts` - Folder management
- [ ] `src/hooks/use-execution.ts` - Command execution
- [ ] `src/hooks/use-keyboard-shortcuts.ts` - Global shortcuts
- [ ] `src/hooks/use-export-import.ts` - Data management

### Utility Functions
- [ ] `src/lib/command-utils.ts` - Command helpers
- [ ] `src/lib/folder-utils.ts` - Folder path utilities
- [ ] `src/lib/tauri-api.ts` - Tauri backend integration
- [ ] `src/lib/constants.ts` - App constants
- [ ] `src/lib/export-utils.ts` - Data export/import logic

### UI Components (30+ components to create)
- [ ] Layout: `app-layout.tsx`, `header.tsx`, `output-panel.tsx`
- [ ] Command: 8 command-related components
- [ ] Folder: 4 folder navigation components  
- [ ] Features: 6 feature components (palette, theme, dialogs)
- [ ] UI Enhancements: 5 utility components

### Testing Setup (Optional but Recommended)
- [ ] `vitest.config.ts` - Test configuration
- [ ] `src/test/` - Test utilities and setup
- [ ] Component test files alongside components
- [ ] Integration tests for Tauri commands

## Senior Engineering Principles

### Core Development Philosophy
- **Modularity First**: Every component, hook, and utility should be reusable and composable
- **Declarative Code**: Code should be self-explanatory; avoid comments unless logic is complex or domain-specific
- **DRY Principle**: Abstract common patterns into reusable modules
- **Type Safety**: Leverage TypeScript for compile-time error detection
- **No Runtime Testing During Development**: Use `typecheck` and `lint` for validation
- **Frontend-First Development**: Use dummy JSON data in Zustand stores, replace with Tauri backend later

### Development Workflow
```bash
# Never run the app during development for checks
# Instead, use these commands for validation:

# Type checking (primary validation)
bun run typecheck

# Linting (code quality)
bun run lint

# Only run the app when feature is complete
bun run tauri:dev
```

### Modular Architecture Guidelines

#### 1. Shared Interfaces & Types
Create composable type definitions that can be extended:
```ts
// Base interfaces that can be extended
interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

interface Executable {
  execute(): Promise<void>;
  status: CommandStatus;
}

// Composed interfaces
interface Command extends BaseEntity, Executable {
  name: string;
  script: string;
  folder_path: string;
}
```

#### 2. Composable Hooks Pattern
```ts
// Atomic hooks that can be composed
function useEntityCRUD<T>(entityType: string) {
  return {
    create: (entity: Omit<T, 'id'>) => invoke(`create_${entityType}`, { entity }),
    read: (id: string) => invoke(`get_${entityType}`, { id }),
    update: (id: string, updates: Partial<T>) => invoke(`update_${entityType}`, { id, updates }),
    delete: (id: string) => invoke(`delete_${entityType}`, { id }),
  };
}

// Composed hook
function useCommands() {
  const crud = useEntityCRUD<Command>('command');
  const execution = useCommandExecution();
  
  return {
    ...crud,
    execute: execution.execute,
    getOutput: execution.getOutput,
  };
}
```

#### 3. Component Composition Over Inheritance
```tsx
// Base card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function BaseCard({ children, className, onClick }: CardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)} onClick={onClick}>
      {children}
    </Card>
  );
}

// Composed command card
interface CommandCardProps {
  command: Command;
  onExecute: (command: Command) => void;
  onEdit: (command: Command) => void;
  onDelete: (id: string) => void;
}

function CommandCard({ command, onExecute, onEdit, onDelete }: CommandCardProps) {
  return (
    <BaseCard>
      <CardHeader>
        <CardTitle>{command.name}</CardTitle>
        <CommandStatus status={command.status} />
      </CardHeader>
      <CardContent>
        <CommandDescription description={command.description} />
        <CommandActions 
          command={command}
          onExecute={onExecute}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </BaseCard>
  );
}
```

#### 4. Utility Functions with Single Responsibility
```ts
// Each function has one clear purpose
export const formatExecutionTime = (start: Date, end?: Date): string => {
  if (!end) return 'Running...';
  return `${Math.round((end.getTime() - start.getTime()) / 1000)}s`;
};

export const validateCommandScript = (script: string): string[] => {
  const errors: string[] = [];
  if (!script.trim()) errors.push('Script cannot be empty');
  if (script.includes('rm -rf /')) errors.push('Dangerous command detected');
  return errors;
};

export const sanitizeCommandName = (name: string): string => 
  name.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').slice(0, 50);
```

### Code Standards

#### File Organization
- **kebab-case** for files (`command-card.tsx`)
- **camelCase** for variables (`commandList`)
- **PascalCase** for components (`CommandCard`)
- **SCREAMING_SNAKE_CASE** for constants (`MAX_OUTPUT_LENGTH`)

#### Import Structure
```tsx
// External libraries
import React from 'react';
import { create } from 'zustand';

// Internal types
import type { Command, CommandStatus } from '@/types/command';

// Internal utilities  
import { cn, formatDate } from '@/lib/utils';
import { validateCommand } from '@/lib/command-utils';

// Components (grouped by domain)
import { Button } from '@/components/ui/button';
import { CommandStatus } from '@/components/command/command-status';
```

#### Component Structure
```tsx
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  onAction: (data: ActionData) => void;
}

export function ComponentName({ requiredProp, optionalProp = 0, onAction }: ComponentProps) {
  const customHook = useCustomHook();
  const [localState, setLocalState] = useState<StateType>(initialValue);
  
  const handleAction = useCallback((data: ActionData) => {
    onAction(data);
  }, [onAction]);
  
  if (customHook.isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="component-container">
      <ComponentChild prop={requiredProp} onAction={handleAction} />
    </div>
  );
}
```

#### State Management Pattern
```ts
interface StoreState {
  entities: Entity[];
  selectedId?: string;
  isLoading: boolean;
}

interface StoreActions {
  setEntities: (entities: Entity[]) => void;
  selectEntity: (id: string) => void;
  addEntity: (entity: Entity) => void;
  removeEntity: (id: string) => void;
}

export const useEntityStore = create<StoreState & StoreActions>((set, get) => ({
  entities: [],
  selectedId: undefined,
  isLoading: false,
  
  setEntities: (entities) => set({ entities }),
  selectEntity: (selectedId) => set({ selectedId }),
  addEntity: (entity) => set(state => ({ 
    entities: [...state.entities, entity] 
  })),
  removeEntity: (id) => set(state => ({ 
    entities: state.entities.filter(e => e.id !== id) 
  })),
}));
```

### When to Add Comments

#### ✅ Good Comments (Keep These)
```ts
// Complex domain logic that isn't immediately obvious
function calculateScheduleNextRun(cronExpression: string): Date {
  // CRON expressions use 0-based months, Date uses 1-based
  const adjustedMonth = cronMonth === '*' ? currentMonth : cronMonth - 1;
  return new Date(year, adjustedMonth, day, hour, minute);
}

// API contracts and edge cases
interface TauriResponse<T> {
  data?: T;
  error?: string;
  // Tauri returns success=false even for handled errors
  success: boolean;
}
```

#### ❌ Bad Comments (Remove These)
```tsx
// Don't do this - code is self-explanatory
const [isOpen, setIsOpen] = useState(false); // State for dialog

// Opens the dialog
function openDialog() {
  setIsOpen(true);
}

// Render the component
return (
  <div>
    {/* Command card component */}
    <CommandCard command={command} />
  </div>
);
```

### Error Handling Strategy
```ts
// Centralized error handling
type Result<T> = { success: true; data: T } | { success: false; error: string };

async function safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<Result<T>> {
  try {
    const data = await invoke<T>(command, args);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Usage in components
function useCommands() {
  const createCommand = async (command: CreateCommandInput) => {
    const result = await safeInvoke<Command>('create_command', { command });
    
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    
    toast.success('Command created successfully');
    return result.data;
  };
  
  return { createCommand };
}
```

## Complete Frontend Build Steps Checklist

### 🚀 Phase 1: Environment Setup & Configuration

#### Step 1: Initialize shadcn/ui and Install Dependencies
```bash
# 1.1 Initialize shadcn/ui
bunx shadcn@latest init

# 1.2 Install all shadcn components
bunx shadcn@latest add \
  card button scroll-area separator skeleton \
  breadcrumb context-menu dropdown-menu tabs \
  dialog form input textarea select switch checkbox label \
  badge alert alert-dialog sonner progress tooltip \
  table collapsible sheet \
  command popover calendar menubar

# 1.3 Install additional packages
bun add \
  zod react-hook-form @hookform/resolvers \
  date-fns \
  next-themes \
  cmdk sonner \
  zustand \
  react-hotkeys-hook
```

#### Step 2: Configure Build Tools
- [ ] **Update `tsconfig.json`**
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```

- [ ] **Update `vite.config.ts`**
  ```ts
  import path from "path"
  
  export default defineConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
  ```

#### Step 3: Set Up Global Styles
- [ ] **Create `src/styles/globals.css`**
  ```css
  @import "tailwindcss";
  
  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --primary: 222.2 47.4% 11.2%;
      --primary-foreground: 210 40% 98%;
    }
    
    .dark {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;
      --card: 222.2 84% 4.9%;
      --card-foreground: 210 40% 98%;
      --primary: 210 40% 98%;
      --primary-foreground: 222.2 47.4% 11.2%;
    }
  }
  ```

### 🏗️ Phase 2: Core Infrastructure

#### Step 4: Create Type Definitions (5 files)
- [ ] **`src/types/command.ts`**
  ```ts
  export interface Command {
    id: string;
    name: string;
    description?: string;
    script: string;
    folder_path: string;
    created_at: Date;
    updated_at: Date;
    last_executed?: Date;
    execution_count: number;
    tags?: string[];
  }
  
  export enum CommandStatus {
    IDLE = "idle",
    RUNNING = "running",
    SUCCESS = "success", 
    FAILED = "failed"
  }
  ```

- [ ] **`src/types/folder.ts`**
  ```ts
  export interface Folder {
    path: string;
    name: string;
    parent_path?: string;
    created_at: Date;
  }
  
  export interface FolderNavigationState {
    current_path: string;
    breadcrumbs: Array<{ name: string; path: string }>;
  }
  ```

- [ ] **`src/types/execution.ts`**
  ```ts
  export interface CommandExecution {
    id: string;
    command_id: string;
    status: CommandStatus;
    output: string;
    error_output?: string;
    start_time: Date;
    end_time?: Date;
    exit_code?: number;
  }
  ```

- [ ] **`src/types/settings.ts`**
  ```ts
  export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    auto_save: boolean;
    show_execution_time: boolean;
    default_shell: string;
    enable_notifications: boolean;
  }
  ```

- [ ] **`src/types/api.ts`**
  ```ts
  // Tauri command interfaces
  export interface TauriResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  ```

#### Step 5: Set Up State Management (4 stores)
- [ ] **`src/store/command-store.ts`**
  ```ts
  import { create } from 'zustand';
  import { Command, CommandStatus } from '@/types/command';
  import { generateId, delay } from '@/lib/utils';
  import { DUMMY_COMMANDS } from '@/lib/dummy-data';
  
  interface CommandStore {
    commands: Command[];
    selectedCommand?: Command;
    isLoading: boolean;
    fetchCommands: () => Promise<void>;
    createCommand: (command: Omit<Command, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateCommand: (id: string, updates: Partial<Command>) => Promise<void>;
    deleteCommand: (id: string) => Promise<void>;
    selectCommand: (id: string) => void;
    executeCommand: (id: string) => Promise<void>;
  }
  
  export const useCommandStore = create<CommandStore>((set, get) => ({
    commands: [],
    selectedCommand: undefined,
    isLoading: false,
    
    fetchCommands: async () => {
      set({ isLoading: true });
      await delay(500); // Simulate API delay
      set({ commands: DUMMY_COMMANDS, isLoading: false });
    },
    
    createCommand: async (commandInput) => {
      const newCommand: Command = {
        ...commandInput,
        id: generateId(),
        status: CommandStatus.IDLE,
        created_at: new Date(),
        updated_at: new Date(),
        execution_count: 0,
      };
      
      await delay(200);
      set(state => ({ 
        commands: [...state.commands, newCommand] 
      }));
    },
    
    updateCommand: async (id, updates) => {
      await delay(200);
      set(state => ({
        commands: state.commands.map(cmd => 
          cmd.id === id 
            ? { ...cmd, ...updates, updated_at: new Date() } 
            : cmd
        ),
        selectedCommand: state.selectedCommand?.id === id 
          ? { ...state.selectedCommand, ...updates, updated_at: new Date() }
          : state.selectedCommand
      }));
    },
    
    deleteCommand: async (id) => {
      await delay(200);
      set(state => ({
        commands: state.commands.filter(cmd => cmd.id !== id),
        selectedCommand: state.selectedCommand?.id === id ? undefined : state.selectedCommand
      }));
    },
    
    selectCommand: (id) => {
      const command = get().commands.find(cmd => cmd.id === id);
      set({ selectedCommand: command });
    },
    
    executeCommand: async (id) => {
      // Simulate command execution
      set(state => ({
        commands: state.commands.map(cmd => 
          cmd.id === id 
            ? { 
                ...cmd, 
                status: CommandStatus.RUNNING,
                last_executed: new Date(),
                execution_count: cmd.execution_count + 1
              }
            : cmd
        )
      }));
      
      // Simulate execution time
      await delay(2000);
      
      // Random success/failure for demo
      const success = Math.random() > 0.3;
      
      set(state => ({
        commands: state.commands.map(cmd => 
          cmd.id === id 
            ? { 
                ...cmd, 
                status: success ? CommandStatus.SUCCESS : CommandStatus.FAILED,
              }
            : cmd
        )
      }));
    },
  }));
  ```

- [ ] **`src/store/folder-store.ts`**
- [ ] **`src/store/settings-store.ts`** 
- [ ] **`src/store/execution-store.ts`**

#### Step 6: Create Utility Functions (5 files)
- [ ] **`src/lib/utils.ts`** (shadcn/ui utils - auto-generated)
- [ ] **`src/lib/utils.ts`** (shadcn/ui utils + custom utilities)
  ```ts
  import { type ClassValue, clsx } from "clsx";
  import { twMerge } from "tailwind-merge";
  
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  
  // Utility functions for dummy data
  export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  export function formatExecutionTime(start: Date, end?: Date): string {
    if (!end) return 'Running...';
    return `${Math.round((end.getTime() - start.getTime()) / 1000)}s`;
  }
  ```

- [ ] **`src/lib/dummy-data.ts`** - Mock data for development
  ```ts
  import { Command, CommandStatus } from '@/types/command';
  import { Folder } from '@/types/folder';
  
  export const DUMMY_COMMANDS: Command[] = [
    {
      id: 'cmd-1',
      name: 'Build Project',
      description: 'Build the entire project with optimizations',
      script: 'npm run build',
      folder_path: '/',
      status: CommandStatus.IDLE,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      execution_count: 5,
      last_executed: new Date('2024-01-15'),
      tags: ['build', 'npm'],
    },
    {
      id: 'cmd-2', 
      name: 'Start Dev Server',
      description: 'Start the development server with hot reload',
      script: 'npm run dev',
      folder_path: '/',
      status: CommandStatus.IDLE,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      execution_count: 12,
      last_executed: new Date('2024-01-20'),
      tags: ['dev', 'server'],
    },
    {
      id: 'cmd-3',
      name: 'Run Tests',
      description: 'Execute all test suites',
      script: 'npm test',
      folder_path: '/testing',
      status: CommandStatus.SUCCESS,
      created_at: new Date('2024-01-02'),
      updated_at: new Date('2024-01-02'),
      execution_count: 8,
      last_executed: new Date('2024-01-18'),
      tags: ['test', 'quality'],
    },
    {
      id: 'cmd-4',
      name: 'Deploy to Staging',
      description: 'Deploy application to staging environment',
      script: 'npm run deploy:staging',
      folder_path: '/deployment',
      status: CommandStatus.FAILED,
      created_at: new Date('2024-01-03'),
      updated_at: new Date('2024-01-03'),
      execution_count: 3,
      last_executed: new Date('2024-01-19'),
      tags: ['deploy', 'staging'],
    },
    {
      id: 'cmd-5',
      name: 'Database Migration',
      description: 'Run pending database migrations',
      script: 'npm run db:migrate',
      folder_path: '/database',
      status: CommandStatus.RUNNING,
      created_at: new Date('2024-01-04'),
      updated_at: new Date('2024-01-04'),
      execution_count: 2,
      last_executed: new Date(),
      tags: ['database', 'migration'],
    },
  ];
  
  export const DUMMY_FOLDERS: Folder[] = [
    {
      path: '/',
      name: 'Root',
      created_at: new Date('2024-01-01'),
    },
    {
      path: '/testing',
      name: 'Testing',
      parent_path: '/',
      created_at: new Date('2024-01-01'),
    },
    {
      path: '/deployment',
      name: 'Deployment',
      parent_path: '/',
      created_at: new Date('2024-01-01'),
    },
    {
      path: '/database',
      name: 'Database',
      parent_path: '/',
      created_at: new Date('2024-01-01'),
    },
  ];
  ```

- [ ] **`src/lib/constants.ts`**
  ```ts
  export const APP_NAME = 'Ordito';
  export const DEFAULT_FOLDER_PATH = '/';
  export const MAX_OUTPUT_LENGTH = 10000;
  
  export const KEYBOARD_SHORTCUTS = {
    COMMAND_PALETTE: 'mod+k',
    NEW_COMMAND: 'mod+n',
    SETTINGS: 'mod+comma',
  } as const;
  ```

- [ ] **`src/lib/command-utils.ts`**
- [ ] **`src/lib/folder-utils.ts`**

### 🎨 Phase 3: Core UI Components

#### Step 7: Create Layout Components (4 files)
- [ ] **`src/components/layout/app-layout.tsx`**
  ```tsx
  import { Header } from './header';
  import { OutputPanel } from './output-panel';
  
  export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <OutputPanel />
      </div>
    );
  }
  ```

- [ ] **`src/components/layout/header.tsx`**
  ```tsx
  import { Settings } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { FolderBreadcrumb } from '@/components/folder/folder-breadcrumb';
  import { CommandSearch } from '@/components/command/command-search';
  import { ThemeToggle } from '@/components/features/theme-toggle';
  
  export function Header() {
    return (
      <header className="border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <FolderBreadcrumb />
          <div className="flex items-center gap-2">
            <CommandSearch />
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    );
  }
  ```

- [ ] **`src/components/layout/output-panel.tsx`**
- [ ] **`src/components/layout/sidebar.tsx`** (optional)

#### Step 8: Create Command Components (8 files)
- [ ] **`src/components/command/command-card.tsx`**
  ```tsx
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { CommandActions } from './command-actions';
  import { CommandStatus } from './command-status';
  import { Command } from '@/types/command';
  
  interface CommandCardProps {
    command: Command;
    onExecute: (command: Command) => void;
    onEdit: (command: Command) => void;
    onDelete: (commandId: string) => void;
  }
  
  export function CommandCard({ command, onExecute, onEdit, onDelete }: CommandCardProps) {
    const handleExecute = () => onExecute(command);
    const handleEdit = () => onEdit(command);
    const handleDelete = () => onDelete(command.id);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium truncate">{command.name}</CardTitle>
            <CommandStatus status={command.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {command.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {command.description}
            </p>
          )}
          <CommandActions 
            onExecute={handleExecute}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    );
  }
  ```

- [ ] **`src/components/command/command-grid.tsx`**
  ```tsx
  import { Command } from '@/types/command';
  import { CommandCard } from './command-card';
  
  interface CommandGridProps {
    commands: Command[];
    onExecute: (command: Command) => void;
    onEdit: (command: Command) => void;
    onDelete: (commandId: string) => void;
  }
  
  export function CommandGrid({ commands, onExecute, onEdit, onDelete }: CommandGridProps) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
        {commands.map((command) => (
          <CommandCard
            key={command.id}
            command={command}
            onExecute={onExecute}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }
  ```

- [ ] **`src/components/command/command-form.tsx`** (Create/Edit Dialog)
- [ ] **`src/components/command/command-actions.tsx`** (Action Buttons)
- [ ] **`src/components/command/command-status.tsx`** (Status Badge)
- [ ] **`src/components/command/command-search.tsx`** (Search Input)
- [ ] **`src/components/command/command-output.tsx`** (Output Display)
- [ ] **`src/components/command/command-executor.tsx`** (Execution Logic)

#### Step 9: Create Folder Components (4 files)
- [ ] **`src/components/folder/folder-card.tsx`**
- [ ] **`src/components/folder/folder-breadcrumb.tsx`**
- [ ] **`src/components/folder/folder-form.tsx`**
- [ ] **`src/components/folder/folder-tree.tsx`** (optional)

### 🚀 Phase 4: Advanced Features

#### Step 10: Create Feature Components (6 files)
- [ ] **`src/components/features/command-palette.tsx`**
  ```tsx
  import { useState } from 'react';
  import { useHotkeys } from 'react-hotkeys-hook';
  import { Command } from '@/components/ui/command';
  import { Dialog, DialogContent } from '@/components/ui/dialog';
  import { useCommands } from '@/hooks/use-commands';
  import { KEYBOARD_SHORTCUTS } from '@/lib/constants';
  
  export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const { commands, executeCommand } = useCommands();
    
    useHotkeys(KEYBOARD_SHORTCUTS.COMMAND_PALETTE, () => setOpen(true));
    
    const handleSelect = async (commandId: string) => {
      await executeCommand(commandId);
      setOpen(false);
    };
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0">
          <Command>
            <Command.Input placeholder="Search commands..." />
            <Command.List>
              <Command.Empty>No commands found.</Command.Empty>
              <Command.Group heading="Commands">
                {commands.map((command) => (
                  <Command.Item 
                    key={command.id} 
                    onSelect={() => handleSelect(command.id)}
                  >
                    {command.name}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    );
  }
  ```

- [ ] **`src/components/features/theme-provider.tsx`**
- [ ] **`src/components/features/export-dialog.tsx`**
- [ ] **`src/components/features/import-dialog.tsx`**
- [ ] **`src/components/features/settings-panel.tsx`**
- [ ] **`src/components/features/system-tray-menu.tsx`**

#### Step 11: Create Custom Hooks (5 files)
- [ ] **`src/hooks/use-commands.ts`**
  ```ts
  import { useCallback } from 'react';
  import { toast } from 'sonner';
  import { useCommandStore } from '@/store/command-store';
  import { useFolderStore } from '@/store/folder-store';
  import { useExecutionStore } from '@/store/execution-store';
  import type { Command, CreateCommandInput } from '@/types/command';
  
  export function useCommands() {
    const {
      commands,
      isLoading,
      fetchCommands,
      createCommand: storeCreateCommand,
      updateCommand: storeUpdateCommand,
      deleteCommand: storeDeleteCommand,
      executeCommand: storeExecuteCommand,
      selectCommand,
      selectedCommand
    } = useCommandStore();
    
    const { currentPath } = useFolderStore();
    const { startExecution } = useExecutionStore();
    
    const createCommand = useCallback(async (input: CreateCommandInput) => {
      try {
        await storeCreateCommand({
          ...input,
          folder_path: currentPath
        });
        toast.success('Command created successfully');
      } catch (error) {
        toast.error('Failed to create command');
      }
    }, [storeCreateCommand, currentPath]);
    
    const executeCommand = useCallback(async (id: string) => {
      const command = commands.find(cmd => cmd.id === id);
      if (!command) {
        toast.error('Command not found');
        return;
      }
      
      try {
        startExecution(id, command.name);
        await storeExecuteCommand(id);
        toast.success(`"${command.name}" executed successfully`);
      } catch (error) {
        toast.error(`Failed to execute "${command.name}"`);
      }
    }, [commands, startExecution, storeExecuteCommand]);
    
    const updateCommand = useCallback(async (id: string, updates: Partial<Command>) => {
      try {
        await storeUpdateCommand(id, updates);
        toast.success('Command updated successfully');
      } catch (error) {
        toast.error('Failed to update command');
      }
    }, [storeUpdateCommand]);
    
    const deleteCommand = useCallback(async (id: string) => {
      try {
        await storeDeleteCommand(id);
        toast.success('Command deleted successfully');
      } catch (error) {
        toast.error('Failed to delete command');
      }
    }, [storeDeleteCommand]);
    
    const getCommandsByFolder = useCallback((folderPath: string) => 
      commands.filter(cmd => cmd.folder_path === folderPath)
    , [commands]);
    
    const getCurrentFolderCommands = useCallback(() => 
      getCommandsByFolder(currentPath)
    , [getCommandsByFolder, currentPath]);
    
    const searchCommands = useCallback((query: string) => {
      if (!query.trim()) return commands;
      
      const lowerQuery = query.toLowerCase();
      return commands.filter(cmd => 
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.script.toLowerCase().includes(lowerQuery) ||
        cmd.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }, [commands]);
    
    return {
      commands,
      selectedCommand,
      isLoading,
      fetchCommands,
      createCommand,
      updateCommand,
      deleteCommand,
      executeCommand,
      selectCommand,
      getCommandsByFolder,
      getCurrentFolderCommands,
      searchCommands,
    };
  }
  ```

- [ ] **`src/hooks/use-folders.ts`**
- [ ] **`src/hooks/use-execution.ts`**
- [ ] **`src/hooks/use-keyboard-shortcuts.ts`**
- [ ] **`src/hooks/use-export-import.ts`**

#### Step 12: Create UI Enhancement Components (5 files)
- [ ] **`src/components/ui/loading-spinner.tsx`**
- [ ] **`src/components/ui/empty-state.tsx`**
- [ ] **`src/components/ui/confirmation-dialog.tsx`**
- [ ] **`src/components/ui/keyboard-shortcuts.tsx`**
- [ ] **`src/components/ui/auto-resize-textarea.tsx`**

### 🔧 Phase 5: Integration & Main App

#### Step 13: Update Main Application
- [ ] **Update `src/app/index.tsx`**
  ```tsx
  import { AppLayout } from '@/components/layout/app-layout';
  import { CommandGrid } from '@/components/command/command-grid';
  import { ThemeProvider } from '@/components/features/theme-provider';
  import { CommandPalette } from '@/components/features/command-palette';
  import { useCommands } from '@/hooks/use-commands';
  
  export default function App() {
    const { commands, fetchCommands, createCommand, updateCommand, deleteCommand } = useCommands();
    
    useEffect(() => {
      fetchCommands();
    }, []);
    
    return (
      <ThemeProvider>
        <AppLayout>
          <CommandGrid 
            commands={commands}
            onExecute={/* implementation */}
            onEdit={/* implementation */}
            onDelete={deleteCommand}
          />
          <CommandPalette />
        </AppLayout>
      </ThemeProvider>
    );
  }
  ```

#### Step 14: Backend Integration (Future Tauri Integration)
- [ ] **`src/lib/api-adapter.ts`** - Future Tauri integration layer
  ```ts
  // This file will replace dummy data with real Tauri commands later
  import { invoke } from '@tauri-apps/api/core';
  import type { Command, Folder, CommandExecution } from '@/types';
  
  type Result<T> = { success: true; data: T } | { success: false; error: string };
  
  export async function safeInvoke<T>(
    command: string, 
    args?: Record<string, unknown>
  ): Promise<Result<T>> {
    try {
      const data = await invoke<T>(command, args);
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Future API calls - currently not used
  export const api = {
    commands: {
      getAll: () => safeInvoke<Command[]>('get_commands'),
      create: (command: Omit<Command, 'id'>) => safeInvoke<Command>('create_command', { command }),
      update: (id: string, updates: Partial<Command>) => safeInvoke<Command>('update_command', { id, updates }),
      delete: (id: string) => safeInvoke<void>('delete_command', { id }),
      execute: (id: string) => safeInvoke<void>('execute_command', { id }),
    },
    folders: {
      getAll: () => safeInvoke<Folder[]>('get_folders'),
      create: (folder: Omit<Folder, 'created_at'>) => safeInvoke<Folder>('create_folder', { folder }),
      delete: (path: string) => safeInvoke<void>('delete_folder', { path }),
    },
    execution: {
      getHistory: () => safeInvoke<CommandExecution[]>('get_execution_history'),
      getOutput: (executionId: string) => safeInvoke<string>('get_execution_output', { executionId }),
    }
  } as const;
  
  // Migration helper - will be used when switching to Tauri backend
  export async function migrateToDummyData(): Promise<void> {
    // This function will help migrate from dummy data to real Tauri backend
    console.log('Future: Migrate dummy data to Tauri backend');
  }
  ```

### ✅ Phase 6: Testing & Polish

#### Step 15: Add Error Handling & Loading States
- [ ] Global error boundary
- [ ] Loading spinners for async operations
- [ ] Toast notifications for user feedback
- [ ] Form validation with zod schemas

#### Step 16: Performance Optimization
- [ ] React.memo for expensive components
- [ ] Lazy loading for large command lists
- [ ] Debounced search implementation
- [ ] Virtual scrolling if needed

#### Step 17: Accessibility & UX
- [ ] Keyboard navigation support
- [ ] Screen reader labels
- [ ] Focus management
- [ ] High contrast theme support

## 📋 Final Checklist Summary

**Configuration Files**: 5 files
**Type Definitions**: 5 files
**State Stores**: 4 files
**Utility Functions**: 5 files
**Layout Components**: 4 files
**Command Components**: 8 files
**Folder Components**: 4 files
**Feature Components**: 6 files
**Custom Hooks**: 5 files
**UI Components**: 5 files
**Backend Commands**: 10+ Rust functions

**Total Files to Create**: ~55 files
**Estimated Development Time**: 2-3 weeks for experienced developer
**Dependencies**: All listed in installation commands above

## Missing Components & Considerations

### Additional Type Definitions Needed
- [ ] **`src/types/index.ts`** - Centralized type exports
  ```ts
  export * from './command';
  export * from './folder';
  export * from './execution';
  export * from './settings';
  export * from './api';
  
  // Common utility types
  export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
  ```

### Complete Store Implementations
- [ ] **`src/store/folder-store.ts`**
  ```ts
  import { create } from 'zustand';
  import { Folder } from '@/types/folder';
  import { generateId, delay } from '@/lib/utils';
  import { DUMMY_FOLDERS } from '@/lib/dummy-data';
  
  interface FolderStore {
    currentPath: string;
    folders: Folder[];
    breadcrumbs: Array<{ name: string; path: string }>;
    isLoading: boolean;
    fetchFolders: () => Promise<void>;
    navigateToFolder: (path: string) => void;
    createFolder: (name: string) => Promise<void>;
    deleteFolder: (path: string) => Promise<void>;
  }
  
  const generateBreadcrumbs = (path: string): Array<{ name: string; path: string }> => {
    if (path === '/') return [{ name: 'Home', path: '/' }];
    
    const parts = path.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let currentPath = '';
    parts.forEach(part => {
      currentPath += `/${part}`;
      breadcrumbs.push({
        name: part.charAt(0).toUpperCase() + part.slice(1),
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  export const useFolderStore = create<FolderStore>((set, get) => ({
    currentPath: '/',
    folders: [],
    breadcrumbs: [{ name: 'Home', path: '/' }],
    isLoading: false,
    
    fetchFolders: async () => {
      set({ isLoading: true });
      await delay(300);
      set({ folders: DUMMY_FOLDERS, isLoading: false });
    },
    
    navigateToFolder: (path) => {
      set({
        currentPath: path,
        breadcrumbs: generateBreadcrumbs(path)
      });
    },
    
    createFolder: async (name) => {
      const { currentPath } = get();
      const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
      
      const newFolder: Folder = {
        path: newPath,
        name,
        parent_path: currentPath === '/' ? undefined : currentPath,
        created_at: new Date(),
      };
      
      await delay(200);
      set(state => ({
        folders: [...state.folders, newFolder]
      }));
    },
    
    deleteFolder: async (path) => {
      await delay(200);
      set(state => ({
        folders: state.folders.filter(folder => !folder.path.startsWith(path))
      }));
    },
  }));
  ```

- [ ] **`src/store/execution-store.ts`**
  ```ts
  import { create } from 'zustand';
  import { CommandExecution, CommandStatus } from '@/types/execution';
  import { generateId } from '@/lib/utils';
  
  interface ExecutionStore {
    currentExecution?: CommandExecution;
    executionHistory: CommandExecution[];
    isExecuting: boolean;
    output: string[];
    startExecution: (commandId: string, commandName: string) => void;
    appendOutput: (line: string) => void;
    completeExecution: (exitCode: number) => void;
    clearOutput: () => void;
    getExecutionById: (id: string) => CommandExecution | undefined;
  }
  
  export const useExecutionStore = create<ExecutionStore>((set, get) => ({
    currentExecution: undefined,
    executionHistory: [],
    isExecuting: false,
    output: [],
    
    startExecution: (commandId, commandName) => {
      const execution: CommandExecution = {
        id: generateId(),
        command_id: commandId,
        command_name: commandName,
        status: CommandStatus.RUNNING,
        output: '',
        start_time: new Date(),
        exit_code: undefined,
      };
      
      set({
        currentExecution: execution,
        isExecuting: true,
        output: [`Starting execution of "${commandName}"...`],
      });
    },
    
    appendOutput: (line) => {
      set(state => ({
        output: [...state.output, line],
        currentExecution: state.currentExecution ? {
          ...state.currentExecution,
          output: state.currentExecution.output + line + '\n'
        } : undefined
      }));
    },
    
    completeExecution: (exitCode) => {
      const { currentExecution } = get();
      if (!currentExecution) return;
      
      const completedExecution: CommandExecution = {
        ...currentExecution,
        status: exitCode === 0 ? CommandStatus.SUCCESS : CommandStatus.FAILED,
        end_time: new Date(),
        exit_code: exitCode,
      };
      
      set(state => ({
        currentExecution: undefined,
        isExecuting: false,
        executionHistory: [completedExecution, ...state.executionHistory.slice(0, 49)], // Keep last 50
        output: [...state.output, `Process exited with code ${exitCode}`],
      }));
    },
    
    clearOutput: () => {
      set({ output: [] });
    },
    
    getExecutionById: (id) => {
      const { executionHistory, currentExecution } = get();
      return currentExecution?.id === id 
        ? currentExecution 
        : executionHistory.find(exec => exec.id === id);
    },
  }));
  ```

- [ ] **`src/store/settings-store.ts`**
  ```ts
  import { create } from 'zustand';
  import { persist } from 'zustand/middleware';
  import { AppSettings } from '@/types/settings';
  
  interface SettingsStore {
    settings: AppSettings;
    updateSettings: (updates: Partial<AppSettings>) => void;
    resetSettings: () => void;
  }
  
  const DEFAULT_SETTINGS: AppSettings = {
    theme: 'system',
    auto_save: true,
    show_execution_time: true,
    default_shell: 'bash',
    enable_notifications: true,
    max_output_lines: 1000,
    command_timeout: 30000,
  };
  
  export const useSettingsStore = create<SettingsStore>()(
    persist(
      (set) => ({
        settings: DEFAULT_SETTINGS,
        
        updateSettings: (updates) => {
          set(state => ({
            settings: { ...state.settings, ...updates }
          }));
        },
        
        resetSettings: () => {
          set({ settings: DEFAULT_SETTINGS });
        },
      }),
      {
        name: 'ordito-settings',
      }
    )
  );
  ```

### Critical Missing Components

#### Data Validation Layer
- [ ] **`src/lib/validation.ts`** - Zod schemas for runtime validation
  ```ts
  import { z } from 'zod';
  
  export const CreateCommandSchema = z.object({
    name: z.string().min(1).max(50),
    description: z.string().optional(),
    script: z.string().min(1),
    folder_path: z.string(),
    tags: z.array(z.string()).optional(),
  });
  
  export const CommandExecutionSchema = z.object({
    command_id: z.string(),
    timeout: z.number().optional(),
  });
  ```

#### Context Providers
- [ ] **`src/providers/app-provider.tsx`** - Global context provider
  ```tsx
  interface AppContextType {
    isOnline: boolean;
    appSettings: AppSettings;
    currentUser?: User;
  }
  
  export function AppProvider({ children }: { children: React.ReactNode }) {
    return (
      <AppContext.Provider value={contextValue}>
        <ThemeProvider>
          <Toaster />
          {children}
        </ThemeProvider>
      </AppContext.Provider>
    );
  }
  ```

#### Missing Utility Components
- [ ] **`src/components/ui/theme-toggle.tsx`** - Theme switcher button
- [ ] **`src/components/ui/command-icon.tsx`** - Command type icons
- [ ] **`src/components/ui/folder-icon.tsx`** - Folder navigation icons

### Configuration Files Missing Details

#### Tailwind Configuration
- [ ] **Complete `tailwind.config.js`** with all customizations
  ```js
  module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        keyframes: {
          "accordion-down": { /* animations */ },
          "accordion-up": { /* animations */ },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
        },
      },
    },
    plugins: [require("tailwindcss-animate")],
  }
  ```

#### ESLint Configuration
- [ ] **`.eslintrc.js`** - Complete linting rules
  ```js
  module.exports = {
    extends: [
      "@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "react-hooks/exhaustive-deps": "error",
    },
  };
  ```

### Testing Strategy (Currently Optional - Make Essential)
- [ ] **`src/test/setup.ts`** - Test environment setup
- [ ] **`src/test/mock-tauri.ts`** - Tauri API mocks
- [ ] **`src/test/test-utils.tsx`** - React testing utilities
- [ ] **`vitest.config.ts`** - Testing configuration

### Build & Deployment
- [ ] **CI/CD Configuration** - GitHub Actions for:
  - Type checking on PR
  - Linting on PR 
  - Build verification
  - Tauri app builds for multiple platforms

### Documentation Gaps
- [ ] **`docs/component-api.md`** - Component prop interfaces
- [ ] **`docs/state-management.md`** - Store patterns and data flow
- [ ] **`docs/tauri-integration.md`** - Backend API contracts

### Security Considerations
- [ ] **Input Sanitization** - For command scripts and user input
- [ ] **Command Validation** - Prevent dangerous operations
- [ ] **XSS Prevention** - For dynamic content rendering

### Performance Monitoring
- [ ] **Bundle Analysis** - Track bundle size
- [ ] **Performance Metrics** - Component render times
- [ ] **Memory Usage** - Large command lists handling

## Validation Checklist for AI Development

### Before Starting Development
- [ ] Confirm all shadcn/ui components install successfully
- [ ] **Skip Tauri backend** - Use dummy JSON data for now
- [ ] Test TypeScript compilation with `bun run typecheck`
- [ ] Verify ESLint configuration with `bun run lint`
- [ ] Verify dummy data loads correctly in stores

### During Development Phase Validation
- [ ] **After each component**: Run `bun run typecheck`
- [ ] **After store creation**: Test store functionality in isolation  
- [ ] **After hook implementation**: Verify hook logic with TypeScript
- [ ] **Before integration**: Ensure all imports resolve correctly

### Critical Success Metrics
- [ ] Zero TypeScript errors in production build
- [ ] All components render without runtime errors
- [ ] State management handles edge cases properly
- [ ] Keyboard shortcuts work across all components
- [ ] Theme switching works without layout shifts
- [ ] Dummy data operations work smoothly (create, read, update, delete)
- [ ] Command execution simulation works correctly
- [ ] All stores persist data correctly (settings store)

## Migration to Tauri Backend (Future Phase)

### When Ready to Integrate Tauri:
1. **Replace store implementations** - Update Zustand stores to call `api.*` functions instead of dummy data
2. **Add Rust backend commands** - Implement actual Tauri commands in `src-tauri/src/commands/`
3. **Test API integration** - Ensure all CRUD operations work with real backend
4. **Data migration** - Export dummy data and import to real backend if needed
5. **Update error handling** - Replace simulated errors with real error responses

### Migration Checklist:
- [ ] Update `command-store.ts` to use `api.commands.*`
- [ ] Update `folder-store.ts` to use `api.folders.*` 
- [ ] Update `execution-store.ts` to use `api.execution.*`
- [ ] Remove `dummy-data.ts` and simulation delays
- [ ] Add real Tauri command implementations
- [ ] Test full CRUD workflows with backend
- [ ] Update error messages to reflect real error conditions

This comprehensive documentation now provides complete guidance for building Ordito's frontend systematically, with all missing pieces identified and solutions provided.