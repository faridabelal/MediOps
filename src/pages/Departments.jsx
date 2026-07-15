import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BedDouble,
  Users
} from "lucide-react";

import { useWorkforce } from "../context/WorkforceContext";

export default function Departments() {
  const {
    departmentCoverage,
    issues
  } = useWorkforce();

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Departments</p>

          <h1>Department Coverage</h1>

          <p>
            Monitor staffing coverage, patient demand, and current workforce
            risk across the hospital.
          </p>
        </div>
      </section>

      <section className="department-summary-grid">
        <SummaryCard
          label="Tracked departments"
          value={departmentCoverage.length}
          detail="Hospital units included in the model"
          icon={Activity}
          tone="neutral"
        />

        <SummaryCard
          label="Fully covered"
          value={
            departmentCoverage.filter(
              (department) => department.totalGap === 0
            ).length
          }
          detail="No active staffing gap"
          icon={Users}
          tone="success"
        />

        <SummaryCard
          label="At risk"
          value={
            departmentCoverage.filter(
              (department) =>
                department.totalGap > 0 &&
                department.coveragePercentage >= 70
            ).length
          }
          detail="Coverage below requirement"
          icon={AlertTriangle}
          tone="warning"
        />

        <SummaryCard
          label="Critical"
          value={
            departmentCoverage.filter(
              (department) =>
                department.totalGap > 0 &&
                department.coveragePercentage < 70
            ).length
          }
          detail="Immediate intervention required"
          icon={BedDouble}
          tone="danger"
        />
      </section>

      <section className="department-grid">
        {departmentCoverage.map((department) => {
          const activeIssues = issues.filter(
            (issue) =>
              issue.departmentCode === department.code
          );

          const status = getDepartmentStatus(
            department.coveragePercentage,
            department.totalGap
          );

          return (
            <article
              className="department-card"
              key={department.id}
            >
              <div className="department-card-header">
                <div>
                  <span className="department-code">
                    {department.code}
                  </span>

                  <h2>{department.name}</h2>
                </div>

                <span
                  className={`department-status ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="department-coverage-block">
                <div className="department-coverage-heading">
                  <span>Current coverage</span>
                  <strong>
                    {department.coveragePercentage}%
                  </strong>
                </div>

                <div className="coverage-track">
                  <div
                    className={`coverage-fill department-fill ${status.className}`}
                    style={{
                      width: `${department.coveragePercentage}%`
                    }}
                  />
                </div>
              </div>

              <div className="department-metrics">
                <DepartmentMetric
                  label="Required staff"
                  value={department.totalRequired}
                />

                <DepartmentMetric
                  label="Confirmed staff"
                  value={department.totalConfirmed}
                />

                <DepartmentMetric
                  label="Coverage gap"
                  value={department.totalGap}
                  warning={department.totalGap > 0}
                />

                <DepartmentMetric
                  label="Patient census"
                  value={department.patientCensus}
                />
              </div>

              <div className="department-demand">
                <div>
                  <span>Expected admissions</span>
                  <strong>
                    {department.expectedAdmissions}
                  </strong>
                </div>

                <div>
                  <span>Active issues</span>
                  <strong>{activeIssues.length}</strong>
                </div>
              </div>

              <div className="department-role-list">
                <h3>Coverage by role</h3>

                {department.requirements.map((requirement) => (
                  <div
                    className="department-role-row"
                    key={requirement.role}
                  >
                    <div>
                      <strong>{requirement.role}</strong>

                      <span>
                        {requirement.confirmedStaff} of{" "}
                        {requirement.required} confirmed
                      </span>
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

              <div className="department-card-footer">
                {activeIssues.length > 0 ? (
                  <Link
                    to={`/operations/${activeIssues[0].id}`}
                    className="secondary-button"
                  >
                    Open staffing issue
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <span className="department-no-issues">
                    No active staffing issues
                  </span>
                )}

                <Link
                  to={`/departments/${department.code}`}
                  className="text-button"
                >
                  View department
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone
}) {
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

function DepartmentMetric({
  label,
  value,
  warning = false
}) {
  return (
    <div className="department-metric">
      <span>{label}</span>

      <strong className={warning ? "metric-warning" : ""}>
        {value}
      </strong>
    </div>
  );
}

function getDepartmentStatus(
  coveragePercentage,
  gap
) {
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