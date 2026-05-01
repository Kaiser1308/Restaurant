# ClickUp Workflow for Restaurant POS

## 1) Muc tieu

Thiet lap 1 quy trinh ClickUp nhat quan de theo doi toan bo Phase 1 theo dung nguyen tac vertical slice:
- Moi feature di tron flow: DB -> API -> UI -> E2E test.
- Uu tien tien do co the deploy/kiem thu, khong theo kieu tach roi backend/frontend.
- Role ro rang: Owner/PM, Dev, QA/UAT.

Tai lieu nay la "single source of truth" cho cach tao task, move status, review va dong task.

## 2) Cau truc workspace trong ClickUp

### Space
- `Restaurant POS`

### Folders
- `Phase 1 - MVP`
- `Backlog - Parking Lot`
- `Bugs & Incidents`
- `Tech Debt`

### Lists trong `Phase 1 - MVP`
- `W1 Foundation + Auth`
- `W2 Tables + Menu + Ordering`
- `W3 Payment + Bills + Void`
- `W4 Print + Audit + Reports`
- `W5 Polish + SignalR (Optional)`
- `W6 Pilot + Hardening`

Luu y:
- M?i List tuong ung 1 vertical slice/1 week trong `restaurant_dotnet_docs/PHASE_1_TASKS.md`.
- Viec ngoai scope tuan hien tai thi dua ve `Backlog - Parking Lot`.

## 3) Task hierarchy

- Epic (optional): cap week/process lon (vd: "Week 2 - Tables/Menu/Ordering").
- Task: don vi giao viec chinh, co outcome ro rang.
- Subtask: chia nho theo lop ky thuat khi can (DB/API/UI/Test).

Nguyen tac:
- 1 task phai co ket qua co the test duoc.
- Tranh tao task chi mo ta "code mot chut" khong co acceptance criteria.

## 4) Status workflow (bat buoc)

Dung mot workflow chung cho tat ca list:
1. `Backlog`
2. `Ready`
3. `In Progress`
4. `In Review`
5. `In QA`
6. `Blocked`
7. `Done`

Quy tac chuyen trang thai:
- `Backlog -> Ready`: da ro scope + acceptance criteria + estimate.
- `Ready -> In Progress`: co nguoi owner va bat dau lam.
- `In Progress -> In Review`: da code xong + self-check + update mo ta task.
- `In Review -> In QA`: da merge vao nhanh lam viec hoac da co ban deploy test.
- `In QA -> Done`: pass test va dat acceptance criteria.
- Bat ky trang thai nao -> `Blocked`: phai ghi ly do block + owner giai quyet + ETA go block.

## 5) Custom fields nen tao

Bat buoc:
- `Module` (Dropdown): auth, tables, menu, orders, bills, audit, reports, print-agent, infra, docs.
- `Layer` (Dropdown): db, api, web, print-agent, e2e.
- `Priority` (Dropdown): P0, P1, P2, P3.
- `Risk` (Dropdown): low, medium, high.
- `Estimate` (Number): gio hoac story point (chon 1 chuan va dung nhat quan).
- `Target Week` (Dropdown): W1..W6.
- `PR/Commit` (Text): link PR hoac hash commit.

Khuyen nghi:
- `Tenant Impact` (Checkbox): co anh huong quy tac tenant_id hay khong.
- `Needs Migration` (Checkbox): co tao/sua migration hay khong.
- `API Contract Impact` (Checkbox): co doi request/response contract hay khong.

## 6) Naming conventions

### Ten task
Format:
`[Module] Mo ta ket qua`

Vi du:
- `[Auth] Implement login + refresh token flow`
- `[Orders] Send pending items to kitchen and create print job`
- `[Bills] Void paid bill with reason + audit log`

### Mo ta task (template)
- Context: tai sao can task nay.
- Scope: lam gi, khong lam gi.
- Acceptance Criteria:
  - AC1 ...
  - AC2 ...
  - AC3 ...
- Tech notes: file/chung quyet dinh lien quan (`TECH_DECISIONS`, `API_CONTRACT`, `DB_SCHEMA`).
- Test plan: cach test manual/automated.

## 7) Definition of Ready (DoR)

Task chi duoc vao `Ready` khi du:
- Co acceptance criteria ro rang.
- Co owner chiu trach nhiem.
- Co estimate.
- Co references tai lieu lien quan.
- Khong vi pham guardrails (khong them tech ngoai scope Phase 1).

## 8) Definition of Done (DoD)

Task chi duoc `Done` khi du:
- Code da xong theo dung scope.
- Build/test lien quan pass.
- Cac thay doi contract/schema duoc cap nhat (neu co).
- Da co bang chung test (note, screenshot, log ng?n).
- Co PR/commit link trong task.
- Khong con subtask mo.

## 9) Sprint rhythm de theo sat PHASE_1_TASKS

### Daily
- Dau ngay (10-15 phut):
  - Chon task tu `Ready` sang `In Progress`.
  - Xac nhan khong bi block env (DB/API/web).
- Cuoi ngay (10 phut):
  - Update task progress + next step.
  - Move status dung thuc te.
  - Tao task moi neu phat sinh bug/tech debt.

### Weekly
- Dau tuan:
  - Khoi tao list week moi theo `PHASE_1_TASKS.md`.
  - Muc tieu: demo duoc full flow week do.
- Cuoi tuan:
  - Review tasks `Done` vs ke hoach.
  - Chuyen task chua xong sang week tiep theo voi ghi chu ly do.

## 10) Automation de setup trong ClickUp

Nen tao cac automation sau:

1. Khi status -> `In Review`
- Auto assign reviewer (tech lead/owner).
- Auto comment checklist review:
  - Kiem tra scope
  - Kiem tra test evidence
  - Kiem tra risk regression

2. Khi status -> `Blocked`
- Bat buoc them comment theo format:
  - `Block reason:`
  - `Owner resolving:`
  - `ETA unblock:`

3. Khi status -> `Done`
- Bat buoc field `PR/Commit` khong rong.
- Auto gan tag `done-week-{Wn}` theo `Target Week`.

4. Khi task qua han va chua `Done`
- Auto ping assignee + Owner/PM.

## 11) Views nen co

- `Board by Status` (view chinh hang ngay).
- `Table - Week Plan` (group theo Target Week, sort theo Priority).
- `My Work` (moi thanh vien tu theo doi viec ca nhan).
- `Blocked Queue` (filter status = Blocked).
- `Bugs Hotlist` (Folder Bugs, filter P0/P1).

## 12) Mau task vertical slice (copy/paste)

Title:
`[Orders] Add pending items after first send-to-kitchen round`

Description:
- Context: MVP can cho phep them mon sau khi da gui bep lan 1.
- Scope:
  - API: chi send item dang pending.
  - DB: tao print job moi cho moi lan send.
  - UI: hien ro item da gui va item pending.
- Out of scope:
  - Khong lam SignalR realtime o task nay.
- Acceptance Criteria:
  - AC1: Co the them item pending sau lan send dau.
  - AC2: Nhan "Send to kitchen" lan 2 chi gui item pending moi.
  - AC3: Tao print job rieng cho lan gui thu 2.
  - AC4: Item da send truoc do khong bi sua quantity.
- Test Plan:
  - Manual E2E theo flow waiter -> kitchen print mock.

Subtasks:
- `[DB] Verify order item state transition rules`
- `[API] Update send-to-kitchen service logic`
- `[Web] Show mixed states in order detail`
- `[E2E] Manual test multi-round send`

## 13) Rule quan tri scope

- Moi feature moi phai map vao 1 trong cac module da co.
- Neu request ngoai MVP, tao task trong `Backlog - Parking Lot`, khong chen vao week dang chay.
- Moi bug do task nao tao ra phai link nguoc lai task goc (relation: `caused by`).

## 14) Rollout de ap dung ngay

1. Tao Space/Folder/List nhu muc 2.
2. Tao status workflow nhu muc 4.
3. Tao custom fields nhu muc 5.
4. Tao 3 templates:
- Feature Task Template
- Bug Task Template
- Tech Debt Template
5. Import backlog tu `PHASE_1_TASKS.md` vao cac list W1..W6.
6. Chot owner review cho cot `In Review`.

---

Nguon tham chieu trong repo:
- `restaurant_dotnet_docs/PHASE_1_TASKS.md`
- `restaurant_dotnet_docs/MVP_SPEC.md`
- `restaurant_dotnet_docs/TECH_DECISIONS.md`
- `restaurant_dotnet_docs/API_CONTRACT_V1.md`
- `restaurant_dotnet_docs/DB_SCHEMA_V1.md`
- `docs/superpowers/specs/2026-04-30-i18n-design.md`
