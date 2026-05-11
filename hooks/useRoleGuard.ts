"use client"

import { useSession } from "next-auth/react"
import { useCallback } from "react"
import {
  hasPermission,
  UI_PERMISSIONS,
  ROLE_HIERARCHY,
  canManage as canManageRole,
} from "@/lib/permissions"
import type { RoleType, ActionType, ResourceType } from "@/lib/permissions"

export interface UseRoleGuardReturn {
  role:                 RoleType | undefined
  userId:               string | undefined
  isLoading:            boolean
  isLoggedIn:           boolean
  can:                  (action: ActionType, resource: ResourceType, ownerId?: string | null) => boolean
  cannot:               (action: ActionType, resource: ResourceType, ownerId?: string | null) => boolean
  is:                   (...roles: RoleType[]) => boolean
  isNot:                (...roles: RoleType[]) => boolean
  hasLevel:             (maxLevel: number) => boolean
  canDeleteLead:        boolean
  canAssignLead:        boolean
  canGenerateDocument:  boolean
  canAccessForecasting: boolean
  canAccessTeam:        boolean
  canAccessReports:     boolean
  canDeleteUser:        boolean
  canChangeRole:        boolean
  canManageUser:        boolean
  canManage:            (targetRole: RoleType) => boolean
}

export function useRoleGuard(): UseRoleGuardReturn {
  const { data: session, status } = useSession()

  const role      = session?.user?.role as RoleType | undefined
  const userId    = session?.user?.id
  const isLoading = status === "loading"
  const isLoggedIn = !!session?.user

  const can = useCallback(
    (
      action:   ActionType,
      resource: ResourceType,
      ownerId?: string | null
    ): boolean => {
      if (!role) return false
      return hasPermission(role, action, resource, {
        ownerId,
        currentUserId: userId,
      })
    },
    [role, userId]
  )

  const cannot = useCallback(
    (
      action:   ActionType,
      resource: ResourceType,
      ownerId?: string | null
    ): boolean => !can(action, resource, ownerId),
    [can]
  )

  const is = useCallback(
    (...roles: RoleType[]): boolean => {
      if (!role) return false
      return roles.includes(role)
    },
    [role]
  )

  const isNot = useCallback(
    (...roles: RoleType[]): boolean => !is(...roles),
    [is]
  )

  const hasLevel = useCallback(
    (maxLevel: number): boolean => {
      if (!role) return false
      return ROLE_HIERARCHY[role] <= maxLevel
    },
    [role]
  )

  const canManage = useCallback(
    (targetRole: RoleType): boolean => {
      if (!role) return false
      return canManageRole(role, targetRole)
    },
    [role]
  )

  return {
    role,
    userId,
    isLoading,
    isLoggedIn,
    can,
    cannot,
    is,
    isNot,
    hasLevel,
    canDeleteLead:        role ? UI_PERMISSIONS.canDeleteLead(role)        : false,
    canAssignLead:        role ? UI_PERMISSIONS.canAssignLead(role)        : false,
    canGenerateDocument:  role ? UI_PERMISSIONS.canGenerateDoc(role)       : false,
    canAccessForecasting: role ? UI_PERMISSIONS.canAccessForecasting(role) : false,
    canAccessTeam:        role ? UI_PERMISSIONS.canAccessTeam(role)        : false,
    canAccessReports:     role ? UI_PERMISSIONS.canAccessReports(role)     : false,
    canDeleteUser:        role ? UI_PERMISSIONS.canDeleteUser(role)        : false,
    canChangeRole:        role ? UI_PERMISSIONS.canChangeRole(role)        : false,
    canManageUser:        role ? hasPermission(role, "update", "user")     : false,
    canManage,
  }
}