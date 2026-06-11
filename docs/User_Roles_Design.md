# User Roles Design

## Overview
ReOm.Co implements a strict Role-Based Access Control (RBAC) system. 

## Defined Roles
1. **Admin**: Superuser access. Can manage all users, system configurations, and override workflows.
2. **Manager**: Department or team leader. Can approve requests, assign tasks, and view detailed team analytics.
3. **Operational Staff**: Standard end-user. Can create tasks, submit approval requests, and view their own operational records.
4. **Executive**: High-level observer. Has access to the Executive Reporting Portal for organizational KPIs, with no mutation rights (read-only for operations).

## Permission Matrix

| Feature / Module                 | Admin | Manager | Ops Staff | Executive |
|----------------------------------|-------|---------|-----------|-----------|
| Login / Logout                   | ✅    | ✅      | ✅        | ✅        |
| User Management                  | ✅    | ❌      | ❌        | ❌        |
| Create/Edit Tasks                | ✅    | ✅      | ✅        | ❌        |
| Delete Tasks                     | ✅    | ❌      | ❌        | ❌        |
| Submit Approval Requests         | ✅    | ✅      | ✅        | ❌        |
| Approve/Reject Requests          | ✅    | ✅      | ❌        | ❌        |
| View Personal Dashboard          | ✅    | ✅      | ✅        | ❌        |
| View Team/Dept Dashboard         | ✅    | ✅      | ❌        | ❌        |
| Executive KPI Portal             | ✅    | ❌      | ❌        | ✅        |
| View System Monitoring/Alerts    | ✅    | ❌      | ❌        | ❌        |
| Backup & Scalability Mgmt        | ✅    | ❌      | ❌        | ❌        |
| Audit Log Viewer                 | ✅    | ❌      | ❌        | ❌        |
