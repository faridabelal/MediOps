import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MailWarning
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useWorkforce } from "../context/WorkforceContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const {
    employees,
    shifts,
    offers,
    issues,
    simulationTime
  } = useWorkforce();

  const employee = employees.find(
    (item) => item.id === user.employeeId
  );

  const employeeShifts = shifts
    .filter(
      (shift) =>
        shift.employeeId === user.employeeId
    )
    .sort(
      (first, second) =>
        new Date(first.startTime) -
        new Date(second.startTime)
    );

  const pendingOffers = offers.filter(
    (offer) =>
      offer.employeeId === user.employeeId &&
      offer.status === "pending"
  );

  const acceptedOffers = offers.filter(
    (offer) =>
      offer.employeeId === user.employeeId &&
      offer.status === "accepted"
  );

  const nextShift = employeeShifts.find(
    (shift) =>
      new Date(shift.endTime) >
      new Date(simulationTime)
  );

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">
            Employee portal
          </p>

          <h1>Welcome, {user.name}</h1>

          <p>
            Review your schedule, coverage offers, and
            current availability.
          </p>
        </div>
      </section>

      <section className="metric-grid employee-metric-grid">
        <EmployeeMetric
          label="Pending offers"
          value={pendingOffers.length}
          detail="Coverage requests awaiting response"
          icon={MailWarning}
          tone="warning"
        />

        <EmployeeMetric
          label="Confirmed shifts"
          value={employeeShifts.filter(
            (shift) =>
              shift.status === "confirmed"
          ).length}
          detail="Currently on your schedule"
          icon={CalendarDays}
          tone="neutral"
        />

        <EmployeeMetric
          label="Accepted coverage"
          value={acceptedOffers.length}
          detail="Additional shifts accepted"
          icon={CheckCircle2}
          tone="success"
        />

        <EmployeeMetric
          label="Weekly hours"
          value={employee?.weeklyHours ?? 0}
          detail={`Maximum: ${
            employee?.maxHours ?? 0
          } hours`}
          icon={Clock3}
          tone="neutral"
        />
      </section>

      <section className="employee-dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                Upcoming
              </p>

              <h2>Next scheduled shift</h2>
            </div>

            <Link
              to="/employee/schedule"
              className="text-button"
            >
              View full schedule
            </Link>
          </div>

          {nextShift ? (
            <ShiftSummary shift={nextShift} />
          ) : (
            <div className="empty-results">
              No upcoming shifts are scheduled.
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                Coverage requests
              </p>

              <h2>Needs your response</h2>
            </div>
          </div>

          {pendingOffers.length === 0 ? (
            <div className="empty-results">
              You have no pending coverage requests.
            </div>
          ) : (
            pendingOffers.map((offer) => {
              const issue = issues.find(
                (item) =>
                  item.id === offer.issueId
              );

              return (
                <Link
                  key={offer.id}
                  to="/employee/offers"
                  className="employee-offer-preview"
                >
                  <strong>
                    {issue?.department ??
                      offer.departmentCode}
                  </strong>

                  <span>
                    {issue?.roleNeeded ??
                      offer.role}
                  </span>

                  <small>
                    Response requested
                  </small>
                </Link>
              );
            })
          )}
        </article>
      </section>
    </div>
  );
}

function EmployeeMetric({
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

function ShiftSummary({ shift }) {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);

  return (
    <div className="next-shift-card">
      <div>
        <span className="shift-type-badge">
          {getShiftType(start)}
        </span>

        <h3>{shift.departmentCode}</h3>

        <p>{shift.role}</p>
      </div>

      <dl>
        <div>
          <dt>Date</dt>
          <dd>
            {start.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric"
            })}
          </dd>
        </div>

        <div>
          <dt>Time</dt>
          <dd>
            {formatTime(start)}–{formatTime(end)}
          </dd>
        </div>

        <div>
          <dt>Schedule type</dt>
          <dd>
            {getDayCategory(start)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function getShiftType(date) {
  const hour = date.getHours();

  if (hour >= 18 || hour < 6) {
    return "Night shift";
  }

  return "Day shift";
}

function getDayCategory(date) {
  const day = date.getDay();

  return day === 0 || day === 6
    ? "Weekend"
    : "Weekday";
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}