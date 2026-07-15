import { Link } from "react-router-dom";
import { useWorkforce } from "../context/WorkforceContext";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  RotateCcw,
  ShieldAlert,
  Users
} from "lucide-react";

export default function Dashboard() {
  const {
    issues,
    departmentCoverage,
    metrics,
    simulationTime,
    advanceTime,
    resetDemo
  } = useWorkforce();

  const currentSimulationDate = new Date(simulationTime);

  const immediateIssues = issues
    .filter((issue) =>
      ["Critical", "High"].includes(issue.priority)
    )
    .slice(0, 3);

  const immediateActionCount = issues.filter((issue) =>
    ["Critical", "High"].includes(issue.priority)
  ).length;

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">
            {currentSimulationDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </p>

          <h1>Good morning, Farida</h1>

          <p>
            Here is what needs attention across the hospital workforce today.
          </p>
        </div>

        <Link to="/operations" className="primary-button">
          View operations queue
        </Link>
      </section>

      <section className="simulation-panel">
        <div>
          <p className="eyebrow">Demo simulation</p>

          <h3>
            Current simulated time:{" "}
            {currentSimulationDate.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit"
            })}
          </h3>

          <p>
            Staffing metrics are calculated from confirmed shifts active at
            this simulated time.
          </p>
        </div>

        <div className="simulation-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => advanceTime(30)}
          >
            Advance 30 minutes
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => advanceTime(60)}
          >
            Advance 1 hour
          </button>

          <button
            type="button"
            className="text-button"
            onClick={resetDemo}
          >
            <RotateCcw size={16} />
            Reset demo
          </button>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          label="Active issues"
          value={metrics.activeIssues}
          detail={`${immediateActionCount} require immediate action`}
          icon={AlertTriangle}
          tone="danger"
        />

        <MetricCard
          label="Departments at risk"
          value={metrics.departmentsAtRisk}
          detail={`Out of ${departmentCoverage.length} tracked departments`}
          icon={ShieldAlert}
          tone="warning"
        />

        <MetricCard
          label="Staff on duty"
          value={metrics.staffOnDuty}
          detail={`${metrics.overallCoverage}% overall coverage`}
          icon={Users}
          tone="neutral"
        />

        <MetricCard
          label="Resolved today"
          value={metrics.resolvedToday}
          detail="Based on completed staffing issues"
          icon={CheckCircle2}
          tone="success"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Operations queue</p>
              <h2>Immediate attention</h2>
            </div>

            <Link to="/operations" className="text-button">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="issue-list">
            {immediateIssues.length === 0 ? (
              <div className="empty-results">
                No critical or high-priority staffing issues currently require
                action.
              </div>
            ) : (
              immediateIssues.map((issue) => (
                <article className="issue-card" key={issue.id}>
                  <div className="issue-status-column">
                    <span
                      className={`priority-dot ${issue.priority.toLowerCase()}`}
                    />
                  </div>

                  <div className="issue-body">
                    <div className="issue-header">
                      <div>
                        <span className="request-id">{issue.id}</span>
                        <h3>{issue.title}</h3>
                      </div>

                      <span
                        className={`priority-badge ${issue.priority.toLowerCase()}`}
                      >
                        {issue.priority}
                      </span>
                    </div>

                    <p className="department-name">
                      {issue.department}
                    </p>

                    <p className="issue-reason">
                      {issue.reason}
                    </p>

                    <div className="issue-footer">
                      <span>
                        <Clock3 size={15} />
                        {issue.coverageStart}
                      </span>

                      <Link
                        to={`/operations/${issue.id}`}
                        className="secondary-button"
                      >
                        Open issue
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Shift health</p>
              <h2>Department coverage</h2>
            </div>
          </div>

          {departmentCoverage.map((department) => (
            <CoverageRow
              key={department.id}
              name={department.name}
              score={department.coveragePercentage}
              status={getCoverageStatus(
                department.coveragePercentage
              )}
            />
          ))}
        </aside>
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

function CoverageRow({ name, score, status }) {
  return (
    <div className="coverage-row">
      <div className="coverage-heading">
        <div>
          <strong>{name}</strong>
          <span>{status}</span>
        </div>

        <strong>{score}%</strong>
      </div>

      <div className="coverage-track">
        <div
          className="coverage-fill"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function getCoverageStatus(score) {
  if (score >= 100) {
    return "Healthy";
  }

  if (score >= 85) {
    return "Watch";
  }

  if (score >= 70) {
    return "At risk";
  }

  return "Critical";
}