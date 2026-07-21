import {
  hasPermission,
  canManage,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  UI_PERMISSIONS,
} from "../permissions"
import type { RoleType, ActionType, ResourceType } from "../permissions"

// ── Test fixtures ──────────────────────────────────────────────
const USER_IDS = {
  superAdmin:       "user-super-admin-001",
  executive:        "user-executive-001",
  salesManager:     "user-sales-manager-001",
  accountExecutive: "user-ae-001",
}

// ── Helper ─────────────────────────────────────────────────────
function perm(
  role:           RoleType,
  action:         ActionType,
  resource:       ResourceType,
  ownerId?:       string | null,
  currentUserId?: string
): boolean {
  return hasPermission(role, action, resource, { ownerId, currentUserId })
}

// ════════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════════
describe("ADMIN permissions", () => {
  const role: RoleType = "ADMIN"

  test("can delete any lead", () => {
    expect(perm(role, "delete", "lead")).toBe(true)
  })

  test("can create lead", () => {
    expect(perm(role, "create", "lead")).toBe(true)
  })

  test("can update any lead", () => {
    expect(perm(role, "update", "lead",
      USER_IDS.accountExecutive,
      USER_IDS.superAdmin
    )).toBe(true)
  })

  test("can assign lead", () => {
    expect(perm(role, "assign", "lead")).toBe(true)
  })

  test("can delete user", () => {
    expect(perm(role, "delete", "user")).toBe(true)
  })

  test("canDeleteUser UI helper → true", () => {
    expect(UI_PERMISSIONS.canDeleteUser(role)).toBe(true)
  })

  test("canChangeRole UI helper → true", () => {
    expect(UI_PERMISSIONS.canChangeRole(role)).toBe(true)
  })

  test("can create document", () => {
    expect(perm(role, "create", "document")).toBe(true)
  })

  test("can access forecasting", () => {
    expect(UI_PERMISSIONS.canAccessForecasting(role)).toBe(true)
  })

  test("cannot manage another ADMIN", () => {
    expect(canManage("ADMIN", "ADMIN")).toBe(false)
  })

  test("can manage EXECUTIVE", () => {
    expect(canManage("ADMIN", "EXECUTIVE")).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════
// EXECUTIVE
// ════════════════════════════════════════════════════════════════
describe("EXECUTIVE permissions", () => {
  const role: RoleType = "EXECUTIVE"

  test("cannot create lead", () => {
    expect(perm(role, "create", "lead")).toBe(false)
  })

  test("can read lead", () => {
    expect(perm(role, "read", "lead")).toBe(true)
  })

  test("cannot update lead", () => {
    expect(perm(role, "update", "lead")).toBe(false)
  })

  test("cannot delete lead", () => {
    expect(perm(role, "delete", "lead")).toBe(false)
  })

  test("cannot create document", () => {
    expect(perm(role, "create", "document")).toBe(false)
  })

  test("canGenerateDocument UI helper → false", () => {
    expect(UI_PERMISSIONS.canGenerateDoc(role)).toBe(false)
  })

  test("cannot manage ADMIN", () => {
    expect(canManage("EXECUTIVE", "ADMIN")).toBe(false)
  })

  test("can manage SALES_MANAGER", () => {
    expect(canManage("EXECUTIVE", "SALES_MANAGER")).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════
// SALES_MANAGER
// ════════════════════════════════════════════════════════════════
describe("SALES_MANAGER permissions", () => {
  const role: RoleType = "SALES_MANAGER"

  test("can assign lead", () => {
    expect(perm(role, "assign", "lead")).toBe(true)
  })

  test("can update any lead", () => {
    expect(perm(role, "update", "lead",
      USER_IDS.accountExecutive,
      USER_IDS.salesManager
    )).toBe(true)
  })

  test("cannot delete user", () => {
    expect(perm(role, "delete", "user")).toBe(false)
  })

  test("canDeleteUser UI helper → false", () => {
    expect(UI_PERMISSIONS.canDeleteUser(role)).toBe(false)
  })

  test("canChangeRole UI helper → false", () => {
    expect(UI_PERMISSIONS.canChangeRole(role)).toBe(false)
  })

  test("can create document", () => {
    expect(perm(role, "create", "document")).toBe(true)
  })

  test("can access team management", () => {
    expect(UI_PERMISSIONS.canAccessTeam(role)).toBe(true)
  })

  test("cannot manage EXECUTIVE", () => {
    expect(canManage("SALES_MANAGER", "EXECUTIVE")).toBe(false)
  })

  test("can manage ACCOUNT_EXECUTIVE", () => {
    expect(canManage("SALES_MANAGER", "ACCOUNT_EXECUTIVE")).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════
// ACCOUNT_EXECUTIVE
// ════════════════════════════════════════════════════════════════
describe("ACCOUNT_EXECUTIVE permissions", () => {
  const role: RoleType = "ACCOUNT_EXECUTIVE"

  test("can edit own lead (ownerId matches)", () => {
    expect(perm(role, "update", "lead",
      USER_IDS.accountExecutive,
      USER_IDS.accountExecutive
    )).toBe(true)
  })

  test("cannot edit someone else's lead (ownerId mismatch)", () => {
    expect(perm(role, "update", "lead",
      USER_IDS.salesManager,
      USER_IDS.accountExecutive
    )).toBe(false)
  })

  test("cannot edit unassigned lead (ownerId null)", () => {
    expect(perm(role, "update", "lead",
      null,
      USER_IDS.accountExecutive
    )).toBe(false)
  })

  test("cannot delete any lead", () => {
    expect(perm(role, "delete", "lead",
      USER_IDS.accountExecutive,
      USER_IDS.accountExecutive
    )).toBe(false)
  })

  test("cannot assign lead", () => {
    expect(perm(role, "assign", "lead",
      USER_IDS.accountExecutive,
      USER_IDS.accountExecutive
    )).toBe(false)
  })

  test("cannot read user list", () => {
    expect(perm(role, "read", "user")).toBe(false)
  })

  test("cannot access team management", () => {
    expect(UI_PERMISSIONS.canAccessTeam(role)).toBe(false)
  })


  test("cannot manage SALES_MANAGER", () => {
    expect(canManage("ACCOUNT_EXECUTIVE", "SALES_MANAGER")).toBe(false)
  })
})
// ════════════════════════════════════════════════════════════════
// ROLE_HIERARCHY
// ════════════════════════════════════════════════════════════════
describe("ROLE_HIERARCHY", () => {
  test("ADMIN is level 1 (highest)", () => {
    expect(ROLE_HIERARCHY["ADMIN"]).toBe(1)
  })


  test("levels are strictly increasing", () => {
    const levels = [
      ROLE_HIERARCHY["ADMIN"],
      ROLE_HIERARCHY["EXECUTIVE"],
      ROLE_HIERARCHY["SALES_MANAGER"],
      ROLE_HIERARCHY["ACCOUNT_EXECUTIVE"]
    ]
    for (let i = 0; i < levels.length - 1; i++) {
      expect(levels[i]).toBeLessThan(levels[i + 1])
    }
  })
})

// ════════════════════════════════════════════════════════════════
// ROLE_PERMISSIONS completeness
// ════════════════════════════════════════════════════════════════
describe("ROLE_PERMISSIONS matrix is complete", () => {
  const allRoles: RoleType[] = [
    "ADMIN", "EXECUTIVE", "SALES_MANAGER",
    "ACCOUNT_EXECUTIVE",
  ]
  const allResources: ResourceType[] = [
    "lead", "activity", "user", "report",
    "document", "forecast", "dashboard",
  ]

  allRoles.forEach((role) => {
    allResources.forEach((resource) => {
      test(`${role} has defined permission for ${resource}`, () => {
        expect(ROLE_PERMISSIONS[role][resource]).toBeDefined()
      })
    })
  })
})