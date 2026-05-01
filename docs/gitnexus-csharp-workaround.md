# GitNexus C# Workaround (Restaurant)

## Mandatory
- Always pass `repo: "Restaurant"` in every GitNexus MCP call.

## Trigger Workaround Mode
Use this workaround when any condition is true:
- `impact` returns `Target not found` for an existing C# symbol.
- `context` returns `Symbol not found` for an existing C# symbol.
- `npx gitnexus analyze --force` fails with `scopeResolution`/`scope extraction failed`.

## Workaround Mode Procedure
1. Use GitNexus only for file/process checks (`query`, `detect_changes`, process resources).
2. Build manual blast radius (repeat for each touched service):
   - Identify touched files: service implementation + related interface.
   - Map direct callers in code: Controller -> Service Interface -> Service Implementation.
   - Record caller list for review notes.
3. Run compile gate:
   - `cmd.exe /c "dotnet build apps\api\Restaurant.Api\Restaurant.Api.csproj"`

## Review Checklist (pass/fail)
- [ ] **PASS:** All touched services have a documented direct-caller map.
- [ ] **PASS:** Build gate succeeds, or failures are pre-existing and unrelated.
- [ ] **PASS:** `detect_changes` scope matches intended files only.
- [ ] **EXIT CHECK:** Spec review passed.
- [ ] **EXIT CHECK:** Quality review passed.

## Exit Criteria (remove workaround mode)
- `impact(target: "ITenantContext", direction: "upstream", repo: "Restaurant")` resolves.
- `context(name: "TableService", repo: "Restaurant")` resolves.
- `npx gitnexus analyze --force` exits successfully and output does **not** include:
  - `scope extraction failed`
  - `Phase 'scopeResolution' failed`
  - `object is not extensible`

## Post-Fix Verification
1. `npx gitnexus clean --force`
2. `npx gitnexus analyze --force`
3. Run MCP `impact/context` on C# symbols:
   - ITenantContext
   - TableService
   - CategoryService
4. Validate outputs include dependents/callers.
