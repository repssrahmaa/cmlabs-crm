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
  viewer:           "user-viewer-001",
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
// SUPER_ADMIN
// ════════════════════════════════════════════════════════════════
describe("SUPER_ADMIN permissions", () => {
  const role: RoleType = "SUPER_ADMIN"

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

  test("cannot manage another SUPER_ADMIN", () => {
    expect(canManage("SUPER_ADMIN", "SUPER_ADMIN")).toBe(false)
  })

  test("can manage EXECUTIVE", () => {
    expect(canManage("SUPER_ADMIN", "EXECUTIVE")).toBe(true)
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

  test("cannot manage SUPER_ADMIN", () => {
    expect(canManage("EXECUTIVE", "SUPER_ADMIN")).toBe(false)
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

  test("cannot access full forecasting", () => {
    expect(UI_PERMISSIONS.canAccessForecasting(role)).toBe(false)
  })

  test("cannot access team management", () => {
    expect(UI_PERMISSIONS.canAccessTeam(role)).toBe(false)
  })

  test("can manage VIEWER", () => {
    expect(canManage("ACCOUNT_EXECUTIVE", "VIEWER")).toBe(true)
  })

  test("cannot manage SALES_MANAGER", () => {
    expect(canManage("ACCOUNT_EXECUTIVE", "SALES_MANAGER")).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════
// VIEWER
// ════════════════════════════════════════════════════════════════
describe("VIEWER permissions", () => {
  const role: RoleType = "VIEWER"

  test("can read lead", () => {
    expect(perm(role, "read", "lead")).toBe(true)
  })

  test("cannot create lead", () => {
    expect(perm(role, "create", "lead")).toBe(false)
  })

  test("cannot create activity", () => {
    expect(perm(role, "create", "activity")).toBe(false)
  })

  test("cannot update activity", () => {
    expect(perm(role, "update", "activity")).toBe(false)
  })

  test("cannot delete activity", () => {
    expect(perm(role, "delete", "activity")).toBe(false)
  })

  test("cannot read user list", () => {
    expect(perm(role, "read", "user")).toBe(false)
  })

  test("cannot read report", () => {
    expect(perm(role, "read", "report")).toBe(false)
  })

  test("cannot create document", () => {
    expect(perm(role, "create", "document")).toBe(false)
  })

  test("cannot access forecasting", () => {
    expect(UI_PERMISSIONS.canAccessForecasting(role)).toBe(false)
  })

  test("cannot manage any role", () => {
    const roles: RoleType[] = [
      "SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER",
      "ACCOUNT_EXECUTIVE", "VIEWER",
    ]
    roles.forEach((target) => {
      expect(canManage("VIEWER", target)).toBe(false)
    })
  })
})

// ════════════════════════════════════════════════════════════════
// ROLE_HIERARCHY
// ════════════════════════════════════════════════════════════════
describe("ROLE_HIERARCHY", () => {
  test("SUPER_ADMIN is level 1 (highest)", () => {
    expect(ROLE_HIERARCHY["SUPER_ADMIN"]).toBe(1)
  })

  test("VIEWER is level 5 (lowest)", () => {
    expect(ROLE_HIERARCHY["VIEWER"]).toBe(5)
  })

  test("levels are strictly increasing", () => {
    const levels = [
      ROLE_HIERARCHY["SUPER_ADMIN"],
      ROLE_HIERARCHY["EXECUTIVE"],
      ROLE_HIERARCHY["SALES_MANAGER"],
      ROLE_HIERARCHY["ACCOUNT_EXECUTIVE"],
      ROLE_HIERARCHY["VIEWER"],
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
    "SUPER_ADMIN", "EXECUTIVE", "SALES_MANAGER",
    "ACCOUNT_EXECUTIVE", "VIEWER",
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