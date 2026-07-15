import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  ClipboardList,
  Users
} from "lucide-react";

import { useWorkforce } from "../context/WorkforceContext";

export default function DepartmentDetails() {
  const { departmentCode } = useParams();

  const {
    departmentCoverage,
    issues,
    shifts,
    employees
  } = useWorkforce();

  const department = departmentCoverage.find(
    (item) => item.code === departmentCode
  );

  if (!department) {
    return (
      <div className="empty-page">
        <h1>Department not found</h1>

        <Link to="/departments" className="text-button">
          Return to Departments
        </Link>
      </div>
    );
  }

  const departmentIssues = issues.filter(
    (issue) => issue.departmentCode === department.code
  );

  const departmentShifts = shifts.filter(
    (shift) => shift.departmentCode === department.code
  );

  const detailedStaff = departmentShifts
    .map((shift) => {
      const employee = employees.find(
        (item) => item.id === shift.employeeId
      );

      return {
        ...shift,
        employee
      };
    })
    .filter((shift) => shift.employee);

  const status = getDepartmentStatus(
    department.coveragePercentage,
    department.totalGap
  );

  return (
    <div>
      <Link to="/departments" className="back-link">
        <ArrowLeft size={17} />
        Back to Departments
      </Link>

      <section className="page-heading">
        <div>
          <p className="eyebrow">{department.code}</p>

          <h1>{department.name}</h1>

          <p>
            Review staffing coverage, patient demand, current shifts, and
            active workforce issues.
          </p>
        </div>

        <span className={`department-status ${status.className}`}>
          {status.label}
        </span>
      </section>

      <section className="metric-grid">
        <MetricCard
          label="Coverage"
          value={`${department.coveragePercentage}%`}
          detail={`${department.totalConfirmed} of ${department.totalRequired} confirmed`}
          icon={Users}
          tone="neutral"
        />

        <MetricCard
          label="Coverage gap"
          value={department.totalGap}
          detail="Staff still needed"
          icon={ClipboardList}
          tone={department.totalGap > 0 ? "danger" : "success"}
        />

        <MetricCard
          label="Patient census"
          value={department.patientCensus}
          detail={`${department.expectedAdmissions} expected admissions`}
          icon={BedDouble}
          tone="warning"
        />

        <MetricCard
          label="Active issues"
          value={departmentIssues.length}
          detail="Open staffing issues"
          icon={ClipboardList}
          tone={departmentIssues.length > 0 ? "danger" : "success"}
        />
      </section>

      <section className="department-detail-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Coverage</p>
              <h2>Staffing by role</h2>
            </div>
          </div>

          <div className="department-role-detail-list">
            {department.requirements.map((requirement) => (
              <div
                className="department-role-detail-row"
                key={requirement.role}
              >
                <div>
                  <h3>{requirement.role}</h3>
                  <p>
                    {requirement.confirmedStaff} confirmed of{" "}
                    {requirement.required} required
                  </p>
                </div>

                <span
                  className={
                    requirement.gap > 0
                      ? "role-gap warning"
                      : "role-gap healthy"
                  }
                >
                  {requirement.gap > 0
                    ? `${requirement.gap} needed`
                    : "Covered"}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Operations</p>
              <h2>Active staffing issues</h2>
            </div>
          </div>

          {departmentIssues.length === 0 ? (
            <div className="empty-results">
              No active staffing issues for this department.
            </div>
          ) : (
            <div className="issue-list">
              {departmentIssues.map((issue) => (
                <div className="department-issue-row" key={issue.id}>
                  <div>
                    <span className="request-id">{issue.id}</span>
                    <strong>{issue.title}</strong>
                    <small>{issue.reason}</small>
                  </div>

                  <Link
                    to={`/operations/${issue.id}`}
                    className="secondary-button"
                  >
                    Open
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="panel department-staff-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Scheduled workforce</p>
            <h2>Detailed employee shifts</h2>
          </div>
        </div>

        {detailedStaff.length === 0 ? (
          <div className="empty-results">
            Detailed employee records are not yet available for the current
            scheduled shifts.
          </div>
        ) : (
          <div className="department-staff-list">
            {detailedStaff.map((shift) => (
              <div className="department-staff-row" key={shift.id}>
                <div>
                  <strong>{shift.employee.name}</strong>
                  <span>{shift.employee.role}</span>
                </div>

                <div>
                  <strong>{formatShiftType(shift.startTime)}</strong>
                  <span>
                    {formatTime(shift.startTime)}–{formatTime(shift.endTime)}
                  </span>
                </div>

                <span className="status-badge">{shift.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={20} />
      </div>

      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function getDepartmentStatus(coveragePercentage, gap) {
  if (gap === 0) {
    return {
      label: "Healthy",
      className: "healthy"
    };
  }

  if (coveragePercentage >= 85) {
    return {
      label: "Watch",
      className: "watch"
    };
  }

  if (coveragePercentage >= 70) {
    return {
      label: "At risk",
      className: "at-risk"
    };
  }

  return {
    label: "Critical",
    className: "critical"
  };
}

function formatShiftType(dateValue) {
  const date = new Date(dateValue);
  const hour = date.getHours();

  return hour >= 18 || hour < 6
    ? "Night shift"
    : "Day shift";
}

function formatTime(dateValue) {
  return new Date(dateValue).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}