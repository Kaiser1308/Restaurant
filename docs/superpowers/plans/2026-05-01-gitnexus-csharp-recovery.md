# GitNexus CSharp Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore reliable GitNexus blast-radius analysis for C# symbols in `Restaurant` while preserving delivery velocity with a safe fallback workflow.

**Architecture:** Execute in two parallel lanes: (1) immediate operational fallback that does not depend on broken symbol resolution, and (2) root-cause remediation for GitNexus index/parser behavior with reproducible diagnostics. Each lane has explicit verification gates and rollback-safe changes.

**Tech Stack:** GitNexus MCP + CLI, PowerShell/cmd, .NET build gate, repository docs/runbook.

---

### Task 1: Stabilize Day-to-Day Workflow (No Blocker for Feature Work)

**Files:**
- Create: `docs/gitnexus-csharp-workaround.md`
- Modify: `docs/task.md`
- Test: N/A (process validation via commands)

- [ ] **Step 1: Record mandatory MCP usage rule for multi-repo environments**

Create `docs/gitnexus-csharp-workaround.md` with:

```markdown
# GitNexus C# Workaround (Restaurant)

## Mandatory
- Always pass `repo: "Restaurant"` in every GitNexus MCP call.

## If `impact/context` cannot resolve C# symbols
1. Use GitNexus at file/process level only (`query`, `detect_changes`, process resources).
2. Build blast radius manually: Controller -> Service Interface -> Service Implementation.
3. Validate with compile gate before review.
```

- [ ] **Step 2: Add an execution checklist for C# changes**

Append to `docs/gitnexus-csharp-workaround.md`:

```markdown
## C# Change Checklist
- Identify touched service/interface files.
- Map direct callers (controller + service interfaces).
- Run build gate:
  - `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
- Run review loop:
  - spec review -> quality review
```

- [ ] **Step 3: Link workaround from active task tracker**

Update `docs/task.md` by adding:

```markdown
## GitNexus C# note
- If symbol-level impact fails in MCP, follow `docs/gitnexus-csharp-workaround.md`.
```

- [ ] **Step 4: Validate build gate command in current repo**

Run:

`cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`

Expected:
- Build succeeds or reports only pre-existing errors unrelated to workaround doc updates.

- [ ] **Step 5: Commit documentation-only workflow guardrails**

Run:

`git add docs/gitnexus-csharp-workaround.md docs/task.md`

`git commit -m "docs: add gitnexus csharp fallback workflow"`


### Task 2: Reproduce and Isolate GitNexus Root Cause

**Files:**
- Create: `docs/gitnexus-csharp-bug-report.md`
- Modify: none
- Test: command output capture

- [ ] **Step 1: Capture tool and environment versions**

Run:

- `npx gitnexus --version`
- `node -v`
- `npm -v`
- `git rev-parse HEAD`

Expected:
- Commands output exact versions used in repro.

- [ ] **Step 2: Reproduce symbol resolution failure deterministically**

Run MCP checks (with `repo: "Restaurant"`):

- `impact(target: "ITenantContext", direction: "upstream", repo: "Restaurant")`
- `context(name: "TableService", repo: "Restaurant")`

Expected:
- Failure (`Target/Symbol not found`) despite files existing.

- [ ] **Step 3: Reproduce analyze-force parser/scope failure**

Run:

`npx gitnexus analyze --force`

Expected:
- Capture any `scope extraction failed` and `scopeResolution` errors.

- [ ] **Step 4: Document repro package for upstream**

Create `docs/gitnexus-csharp-bug-report.md` containing:

```markdown
# GitNexus C# Symbol Resolution Bug Report

## Summary
- Symbol-level lookup fails for C# classes/interfaces in Restaurant repo.

## Repro Steps
1. Run `npx gitnexus analyze` (or `--force`).
2. Run MCP `impact` on `ITenantContext`.
3. Run MCP `context` on `TableService`.

## Actual Result
- `Target not found` / `Symbol not found`.
- (If present) `scope extraction failed ...`
- (If present) `Analysis failed: Phase 'scopeResolution' failed: Cannot add property 1, object is not extensible`

## Expected Result
- C# symbols (`Class`, `Interface`, `Method`) are resolvable like TS symbols.

## Environment
- Include exact CLI/Node/npm versions and current commit.
```

- [ ] **Step 5: Confirm reproducibility after clean index rebuild**

Run:

- `npx gitnexus clean --force`
- `npx gitnexus analyze`
- Repeat MCP symbol checks

Expected:
- If still failing, mark as confirmed upstream bug with clean-state repro.


### Task 3: Add a Safe Recovery Path After Upstream Fix

**Files:**
- Modify: `docs/gitnexus-csharp-workaround.md`
- Test: MCP query verification

- [ ] **Step 1: Define exit criteria for removing workaround**

Add to `docs/gitnexus-csharp-workaround.md`:

```markdown
## Exit Criteria (remove workaround)
- `impact(target: "ITenantContext", direction: "upstream", repo: "Restaurant")` resolves.
- `context(name: "TableService", repo: "Restaurant")` resolves.
- `analyze --force` has no scopeResolution crash.
```

- [ ] **Step 2: Define post-fix verification script**

Add:

```markdown
## Post-Fix Verification
1. `npx gitnexus clean --force`
2. `npx gitnexus analyze --force`
3. Run MCP `impact/context` on 3 C# symbols:
   - ITenantContext
   - TableService
   - CategoryService
4. Validate outputs include dependents/callers.
```

- [ ] **Step 3: Commit recovery criteria documentation**

Run:

`git add docs/gitnexus-csharp-workaround.md docs/gitnexus-csharp-bug-report.md`

`git commit -m "docs: add gitnexus csharp bug repro and recovery criteria"`


### Task 4: Operational Policy for Current Tenant-Context Hardening Work

**Files:**
- Modify: `docs/task.md`
- Test: repo command checklist

- [ ] **Step 1: Add temporary policy for current branch/worktree tasks**

Append to `docs/task.md`:

```markdown
## Temporary Policy (GitNexus C# unresolved symbols)
- Continue implementation with compile-time blast radius + review loop.
- Require API build pass for each task:
  - `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`
- Keep scope tightly file-bounded per task plan.
```

- [ ] **Step 2: Add pre-commit quality gate instruction**

Append:

```markdown
- Before any commit, run MCP `detect_changes` with `repo: "Restaurant"` to confirm expected scope.
```

- [ ] **Step 3: Commit policy update**

Run:

`git add docs/task.md`

`git commit -m "docs: add temporary gitnexus csharp policy for active tasks"`
