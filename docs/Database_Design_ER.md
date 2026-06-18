# Database Design & ER Diagram

## Overview
The database uses MySQL to manage application state across users, tasks, approvals, reports, auditing, and system alerts.

## Schema Definitions

- **Users**: Core identities with role-based attributes.
- **Tasks**: Work items assigned to users.
- **Approvals**: Workflow requests that require sign-off.
- **Reports**: Meta-information about generated analytics reports.
- **Audit Logs**: Immutable records of system activities.
- **Alerts**: System health warnings and notifications.

## ER Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string username
        string email
        string password_hash
        string role "Admin | Manager | Staff | Exec"
        datetime created_at
    }

    TASKS {
        uuid id PK
        string title
        string description
        string status "Pending | Completed"
        uuid assigned_to FK
        uuid created_by FK
        datetime created_at
    }

    APPROVALS {
        uuid id PK
        string request_title
        string status "Pending | Approved | Rejected"
        uuid submitted_by FK
        uuid approved_by FK
        datetime created_at
    }

    REPORTS {
        uuid id PK
        string report_name
        uuid generated_by FK
        datetime created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor FK
        string action
        datetime timestamp
    }

    ALERTS {
        uuid id PK
        string alert_type "CPU | Memory | Storage | General"
        string severity "Low | Medium | High | Critical"
        string status "Active | Resolved"
        datetime timestamp
    }

    USERS ||--o{ TASKS : "assigned"
    USERS ||--o{ TASKS : "creates"
    USERS ||--o{ APPROVALS : "submits"
    USERS ||--o{ APPROVALS : "approves"
    USERS ||--o{ REPORTS : "generates"
    USERS ||--o{ AUDIT_LOGS : "performs"
```
