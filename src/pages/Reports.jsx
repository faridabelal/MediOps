import {
  Activity,
  CheckCircle2,
  Clock3,
  MailCheck,
  ShieldAlert,
  Users
} from "lucide-react";

import { useWorkforce } from "../context/WorkforceContext";

export default function Reports() {
  const {
    activity,
    departmentCoverage,
    employees,
    issues,
    metrics,
    offers,
    shifts,
    simulationTime
  } = useWorkforce();

  const acceptedOffers = offers.filter(
    (offer) => offer.status === "accepted"
  ).length;

  const declinedOffers = offers.filter(
    (offer) => offer.status === "declined"
  ).length;

  const pendingOffers = offers.filter(
    (offer) => offer.status === "pending"
  ).length;

  const respondedOffers = acceptedOffers + declinedOffers;

  const acceptanceRate =
    respondedOffers === 0
      ? 0
      : Math.round((acceptedOffers / respondedOffers) * 100);

  const coverageOfferShifts = shifts.filter(
    (shift) => shift.source === "coverage-offer"
  ).length;

  const resolvedActivities = activity.filter(
    (entry) => entry.type === "resolved"
  );

  const offerActivities = activity.filter(
    (entry) => entry.type === "offer"
  );

  const averageResolutionMinutes = calculateAverageResolutionTime(
    activity
  );

  const departmentReport = departmentCoverage
    .map((department) => {
      const departmentIssues = issues.filter(
        (issue) => issue.departmentCode === department.code
      ).length;

      const departmentOffers = offers.filter(
        (offer) => offer.departmentCode === department.code
      );

      const acceptedDepartmentOffers = departmentOffers.filter(
        (offer) => offer.status === "accepted"
      ).length;

      return {
        ...department,
        activeIssues: departmentIssues,
        acceptedOffers: acceptedDepartmentOffers,
        totalOffers: departmentOffers.length
      };
    })
    .sort(
      (first, second) =>
        first.coveragePercentage - second.coveragePercentage
    );

  const roleSummary = buildRoleSummary(employees, offers);

  const shiftTypeSummary = buildShiftTypeSummary(shifts);

  const recentResolvedIssues = resolvedActivities.slice(0, 6);

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Reports</p>

          <h1>Workforce Analytics</h1>

          <p>
            Review staffing coverage, response activity, offer outcomes, and
            operational trends for the current simulation.
          </p>
        </div>

        <div className="report-date">
          <span>Reporting time</span>

          <strong>
            {new Date(simulationTime).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit"
            })}
          </strong>
        </div>
      </section>

      <section className="report-metric-grid">
        <ReportMetric
          label="Overall coverage"
          value={`${metrics.overallCoverage}%`}
          detail={`${metrics.staffOnDuty} of ${metrics.requiredStaffNow} required staff`}
          icon={Users}
          tone="neutral"
        />

        <ReportMetric
          label="Offer acceptance rate"
          value={`${acceptanceRate}%`}
          detail={`${acceptedOffers} accepted of ${respondedOffers} responses`}
          icon={MailCheck}
          tone="success"
        />

        <ReportMetric
          label="Resolved issues"
          value={resolvedActivities.length}
          detail={`${metrics.resolvedToday} resolved today`}
          icon={CheckCircle2}
          tone="success"
        />

        <ReportMetric
          label="Average resolution"
          value={
            averageResolutionMinutes === null
              ? "—"
              : `${averageResolutionMinutes} min`
          }
          detail={
            averageResolutionMinutes === null
              ? "More issue history is needed"
              : "From issue creation to resolution"
          }
          icon={Clock3}
          tone="warning"
        />
      </section>

      <section className="reports-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Department performance</p>
              <h2>Coverage by department</h2>
            </div>
          </div>

          <div className="report-department-list">
            {departmentReport.map((department) => (
              <DepartmentReportRow
                key={department.id}
                department={department}
              />
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Offer outcomes</p>
              <h2>Coverage request responses</h2>
            </div>
          </div>

          <div className="offer-outcome-chart">
            <OfferOutcome
              label="Accepted"
              value={acceptedOffers}
              total={offers.length}
              className="accepted"
            />

            <OfferOutcome
              label="Pending"
              value={pendingOffers}
              total={offers.length}
              className="pending"
            />

            <OfferOutcome
              label="Declined"
              value={declinedOffers}
              total={offers.length}
              className="declined"
            />
          </div>

          <div className="report-callout">
            <MailCheck size={20} />

            <div>
              <strong>{offerActivities.length} offers sent</strong>
              <span>
                {coverageOfferShifts} accepted offers created confirmed shifts.
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="reports-grid reports-grid-secondary">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Workforce mix</p>
              <h2>Employees by role</h2>
            </div>
          </div>

          <div className="role-summary-list">
            {roleSummary.map((role) => (
              <div className="role-summary-row" key={role.name}>
                <div>
                  <strong>{role.name}</strong>
                  <span>{role.employeeCount} employees</span>
                </div>

                <div className="role-summary-stats">
                  <span>{role.acceptedOffers} accepted offers</span>
                  <span>{role.pendingOffers} pending</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Schedule mix</p>
              <h2>Day, night, and weekend shifts</h2>
            </div>
          </div>

          <div className="shift-summary-grid">
            <ShiftSummaryCard
              label="Day shifts"
              value={shiftTypeSummary.day}
            />

            <ShiftSummaryCard
              label="Night shifts"
              value={shiftTypeSummary.night}
            />

            <ShiftSummaryCard
              label="Weekday shifts"
              value={shiftTypeSummary.weekday}
            />

            <ShiftSummaryCard
              label="Weekend shifts"
              value={shiftTypeSummary.weekend}
            />
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Operations history</p>
            <h2>Recently resolved issues</h2>
          </div>
        </div>

        {recentResolvedIssues.length === 0 ? (
          <div className="empty-results">
            No resolved staffing issues have been recorded yet.
          </div>
        ) : (
          <div className="resolved-report-list">
            {recentResolvedIssues.map((entry) => (
              <article
                className="resolved-report-row"
                key={entry.id}
              >
                <div className="resolved-report-icon">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <strong>{entry.message}</strong>

                  <span>
                    {new Date(entry.timestamp).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="report-notice">
        <Activity size={18} />

        <p>
          These reports currently summarize the seeded demonstration data and
          activity saved in this browser. A production version would query
          historical records from the shared hospital database.
        </p>
      </section>
    </div>
  );
}

function ReportMetric({
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

function DepartmentReportRow({ department }) {
  const status = getCoverageStatus(
    department.coveragePercentage,
    department.totalGap
  );

  return (
    <div className="report-department-row">
      <div className="report-department-heading">
        <div>
          <strong>{department.name}</strong>

          <span>
            {department.totalConfirmed} of {department.totalRequired} confirmed
          </span>
        </div>

        <span className={`department-status ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="report-coverage-line">
        <div className="coverage-track">
          <div
            className={`coverage-fill department-fill ${status.className}`}
            style={{
              width: `${department.coveragePercentage}%`
            }}
          />
        </div>

        <strong>{department.coveragePercentage}%</strong>
      </div>

      <div className="report-department-meta">
        <span>{department.totalGap} staff needed</span>
        <span>{department.activeIssues} active issues</span>
        <span>
          {department.acceptedOffers}/{department.totalOffers} offers accepted
        </span>
      </div>
    </div>
  );
}

function OfferOutcome({
  label,
  value,
  total,
  className
}) {
  const percentage =
    total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="offer-outcome-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="offer-outcome-track">
        <div
          className={`offer-outcome-fill ${className}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span>{percentage}%</span>
    </div>
  );
}

function ShiftSummaryCard({ label, value }) {
  return (
    <div className="shift-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildRoleSummary(employees, offers) {
  const roles = [...new Set(employees.map((employee) => employee.role))];

  return roles.map((role) => {
    const roleEmployees = employees.filter(
      (employee) => employee.role === role
    );

    const employeeIds = new Set(
      roleEmployees.map((employee) => employee.id)
    );

    return {
      name: role,
      employeeCount: roleEmployees.length,
      acceptedOffers: offers.filter(
        (offer) =>
          employeeIds.has(offer.employeeId) &&
          offer.status === "accepted"
      ).length,
      pendingOffers: offers.filter(
        (offer) =>
          employeeIds.has(offer.employeeId) &&
          offer.status === "pending"
      ).length
    };
  });
}

function buildShiftTypeSummary(shifts) {
  return shifts.reduce(
    (summary, shift) => {
      const start = new Date(shift.startTime);
      const hour = start.getHours();
      const day = start.getDay();

      const isNight = hour >= 18 || hour < 6;
      const isWeekend = day === 0 || day === 6;

      if (isNight) {
        summary.night += 1;
      } else {
        summary.day += 1;
      }

      if (isWeekend) {
        summary.weekend += 1;
      } else {
        summary.weekday += 1;
      }

      return summary;
    },
    {
      day: 0,
      night: 0,
      weekday: 0,
      weekend: 0
    }
  );
}

function calculateAverageResolutionTime(activity) {
  const resolvedEntries = activity.filter(
    (entry) => entry.type === "resolved" && entry.issueId
  );

  const durations = resolvedEntries
    .map((resolvedEntry) => {
      const createdEntry = activity
        .filter(
          (entry) =>
            entry.issueId === resolvedEntry.issueId &&
            entry.type === "issue"
        )
        .sort(
          (first, second) =>
            new Date(first.timestamp) -
            new Date(second.timestamp)
        )[0];

      if (!createdEntry) {
        return null;
      }

      const difference =
        new Date(resolvedEntry.timestamp) -
        new Date(createdEntry.timestamp);

      return Math.max(0, Math.round(difference / 60000));
    })
    .filter((duration) => duration !== null);

  if (durations.length === 0) {
    return null;
  }

  return Math.round(
    durations.reduce((sum, duration) => sum + duration, 0) /
      durations.length
  );
}

function getCoverageStatus(coveragePercentage, gap) {
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