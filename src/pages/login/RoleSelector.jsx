import React from 'react';
import { Link } from 'react-router-dom';
import './RoleSelector.css';

export default function RoleSelector({ roles, className = '', excludeRoles = [] }) {
  const allExclusions = [...excludeRoles, 'admin'];
  const filteredRoles = roles.filter(role => !allExclusions.includes(role.id));

  return (
    <div className={`role-grid ${className}`}>
      {filteredRoles.map(role => (
        <Link key={role.id} to={`/authUser/${role.id}`} className="role-link">
          <div className="role-card">
            <div className="role-icon">{role.icon}</div>
            <h3 className="role-title">{role.name}</h3>
            <p className="role-desc">{role.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
