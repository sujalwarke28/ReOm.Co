import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  id: string;
  username: string;
  role: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  optionsByRole: Record<string, SelectOption[]>;
  roleOrder: string[];
  roleLabels: Record<string, string>;
  placeholder?: string;
  allowUnassigned?: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  Admin: '#dc2626',
  Manager: '#0077cc',
  Executive: '#d97706',
  OperationalStaff: '#16a34a',
};

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  optionsByRole,
  roleOrder,
  roleLabels,
  placeholder = '— Select User —',
  allowUnassigned = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected option
  let selectedOption: SelectOption | null = null;
  for (const role of roleOrder) {
    const users = optionsByRole[role];
    if (users) {
      const found = users.find(u => u.id === value);
      if (found) {
        selectedOption = found;
        break;
      }
    }
  }

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          outline: 'none',
          textAlign: 'left',
          boxShadow: isOpen ? '0 0 0 3px var(--accent-subtle)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {selectedOption ? (
            <>
              {/* Mini Avatar */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: ROLE_COLORS[selectedOption.role] || 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {selectedOption.username.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontWeight: 500 }}>{selectedOption.username}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                ({roleLabels[selectedOption.role] || selectedOption.role})
              </span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
          )}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            maxHeight: 280,
            overflowY: 'auto',
            padding: '6px 0',
            animation: 'fadeSlideUp 0.15s ease both',
          }}
        >
          {allowUnassigned && (
            <div
              onClick={() => handleSelect('')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                color: value === '' ? 'var(--accent)' : 'var(--text-secondary)',
                background: value === '' ? 'var(--bg-elevated)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = value === '' ? 'var(--bg-elevated)' : 'transparent')}
            >
              — Unassigned —
            </div>
          )}

          {roleOrder.map(role => {
            const users = optionsByRole[role];
            if (!users || users.length === 0) return null;

            return (
              <div key={role}>
                {/* Section Header */}
                <div
                  style={{
                    padding: '8px 16px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: ROLE_COLORS[role] || 'var(--text-muted)',
                    borderTop: allowUnassigned || roleOrder.indexOf(role) > 0 ? '1px solid var(--border)' : 'none',
                    marginTop: allowUnassigned || roleOrder.indexOf(role) > 0 ? 4 : 0,
                  }}
                >
                  {roleLabels[role] || role}
                </div>

                {/* Users List */}
                {users.map(u => {
                  const isSelected = u.id === value;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleSelect(u.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                        background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = isSelected ? 'var(--accent-subtle)' : 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isSelected ? 'var(--accent-subtle)' : 'transparent')}
                    >
                      {/* Circle Initials */}
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 7,
                          background: ROLE_COLORS[role] || 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#fff',
                        }}
                      >
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: isSelected ? 600 : 500 }}>{u.username}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
