import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MailWarning,
  ShieldCheck,
  UserCheck,
  XCircle
} from "lucide-react";

import { useWorkforce } from "../context/WorkforceContext";

export default function EmployeeDetails() {
  const { employeeId } = useParams();

  const {
    employees,
    shifts,
    offers,
    activity,
    simulationTime
  } = useWorkforce();

  const employee = employees.find(
    (item) => item.id === employeeId
  );

  if (!employee) {
    return (
      <div className="empty-page">
        <h1>Employee not found</h1>

        <Link to="/employees" className="text-button">
          Return to Employee Directory
        </Link>
      </div>
    );
  }

  const employeeShifts = shifts
    .filter(
      (shift) => shift.employeeId === employee.id
    )
    .sort(
      (first, second) =>
        new Date(first.startTime) -
        new Date(second.startTime)
    );

  const employeeOffers = offers
    .filter(
      (offer) => offer.employeeId === employee.id
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt) -
        new Date(first.createdAt)
    );

  const employeeActivity = activity
    .filter(
      (entry) => entry.employeeId === employee.id
    )
    .slice(0, 8);

  const currentStatus = getEmployeeStatus(
    employee,
    employeeShifts,
    simulationTime
  );

  const pendingOffers = employeeOffers.filter(
    (offer) => offer.status === "pending"
  ).length;

  const acceptedOffers = employeeOffers.filter(
    (offer) => offer.status === "accepted"
  ).length;

  const declinedOffers = employeeOffers.filter(
    (offer) => offer.status === "declined"
  ).length;

  return (
    <div>
      <Link to="/employees" className="back-link">
        <ArrowLeft size={17} />
        Back to Employee Directory
      </Link>

      <section className="employee-profile-heading">
        <div className="employee-profile-main">
          <div className="employee-profile-avatar">
            {getInitials(employee.name)}
          </div>

          <div>
            <p className="eyebrow">{employee.id}</p>
            <h1>{employee.name}</h1>
            <p>
              {employee.role} ·{" "}
              {formatDepartment(
                employee.homeDepartmentCode
              )}
            </p>
          </div>
        </div>

        <span
          className={`employee-availability ${getAvailabilityClass(
            currentStatus
          )}`}
        >
          {currentStatus}
        </span>
      </section>

      <section className="metric-grid">
        <ProfileMetric
          label="Weekly hours"
          value={`${employee.weeklyHours}/${employee.maxHours}`}
          detail="Current scheduling period"
          icon={Clock3}
          tone="neutral"
        />

        <ProfileMetric
          label="Pending offers"
          value={pendingOffers}
          detail="Awaiting employee response"
          icon={MailWarning}
          tone="warning"
        />

        <ProfileMetric
          label="Accepted offers"
          value={acceptedOffers}
          detail="Additional coverage accepted"
          icon={CheckCircle2}
          tone="success"
        />

        <ProfileMetric
          label="Declined offers"
          value={declinedOffers}
          detail="Coverage requests declined"
          icon={XCircle}
          tone="danger"
        />
      </section>

      <section className="employee-profile-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Qualifications</p>
              <h2>Workforce eligibility</h2>
            </div>
          </div>

          <dl className="employee-profile-details">
            <div>
              <dt>Role</dt>
              <dd>{employee.role}</dd>
            </div>

            <div>
              <dt>Home department</dt>
              <dd>
                {formatDepartment(
                  employee.homeDepartmentCode
                )}
              </dd>
            </div>

            <div>
              <dt>Preferred shift</dt>
              <dd>
                {employee.preferredShift ?? "Either"}
              </dd>
            </div>

            <div>
              <dt>Weekend coverage</dt>
              <dd>
                {employee.weekendAvailable
                  ? "Available"
                  : "Not available"}
              </dd>
            </div>

            <div>
              <dt>Overtime eligible</dt>
              <dd>
                {employee.overtimeEligible
                  ? "Yes"
                  : "No"}
              </dd>
            </div>

            <div>
              <dt>Current availability</dt>
              <dd>{employee.availability}</dd>
            </div>
          </dl>

          <div className="employee-certifications">
            <h3>Certifications</h3>

            <div>
              {employee.certifications.map(
                (certification) => (
                  <span key={certification}>
                    <ShieldCheck size={14} />
                    {certification}
                  </span>
                )
              )}
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Offer history</p>
              <h2>Coverage requests</h2>
            </div>
          </div>

          {employeeOffers.length === 0 ? (
            <div className="empty-results">
              No coverage offers have been sent to this
              employee.
            </div>
          ) : (
            <div className="employee-offer-history">
              {employeeOffers.map((offer) => (
                <div
                  className="employee-offer-history-row"
                  key={offer.id}
                >
                  <div>
                    <strong>
                      {offer.departmentCode}
                    </strong>
                    <span>{offer.role}</span>
                    <small>
                      {formatDateTime(
                        offer.coverageStartTime
                      )}
                    </small>
                  </div>

                  <span
                    className={`status-badge offer-${offer.status}`}
                  >
                    {capitalize(offer.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="panel employee-schedule-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Schedule</p>
            <h2>Assigned shifts</h2>
          </div>
        </div>

        {employeeShifts.length === 0 ? (
          <div className="empty-results">
            This employee has no scheduled shifts.
          </div>
        ) : (
          <div className="schedule-list">
            {employeeShifts.map((shift) => (
              <EmployeeShiftRow
                key={shift.id}
                shift={shift}
              />
            ))}
          </div>
        )}
      </section>

      <section className="panel employee-activity-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Activity</p>
            <h2>Recent workforce activity</h2>
          </div>
        </div>

        {employeeActivity.length === 0 ? (
          <div className="empty-results">
            No recent activity is recorded for this employee.
          </div>
        ) : (
          <div className="employee-activity-list">
            {employeeActivity.map((entry) => (
              <div
                className="employee-activity-row"
                key={entry.id}
              >
                <UserCheck size={17} />

                <div>
                  <strong>{entry.message}</strong>
                  <span>
                    {formatDateTime(entry.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfileMetric({
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

function EmployeeShiftRow({ shift }) {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);

  const nightShift =
    start.getHours() >= 18 ||
    start.getHours() < 6;

  const weekend =
    start.getDay() === 0 ||
    start.getDay() === 6;

  return (
    <article className="schedule-card">
      <div
        className={`schedule-icon ${
          nightShift ? "night" : "day"
        }`}
      >
        <CalendarDays size={20} />
      </div>

      <div className="schedule-main">
        <div className="schedule-heading">
          <div>
            <h3>{shift.departmentCode}</h3>
            <p>{shift.role}</p>
          </div>

          <span className="status-badge">
            {shift.status}
          </span>
        </div>

        <div className="schedule-details">
          <span>
            {start.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </span>

          <span>
            {start.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit"
            })}
            {" – "}
            {end.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit"
            })}
          </span>

          <span>
            {nightShift ? "Night shift" : "Day shift"}
          </span>

          <span>
            {weekend ? "Weekend" : "Weekday"}
          </span>

          <span>
            Source:{" "}
            {shift.source === "coverage-offer"
              ? "Accepted coverage offer"
              : "Standard schedule"}
          </span>
        </div>
      </div>
    </article>
  );
}

function getEmployeeStatus(
  employee,
  employeeShifts,
  simulationTime
) {
  const now = new Date(simulationTime);

  const activeShift = employeeShifts.some(
    (shift) =>
      shift.status === "confirmed" &&
      now >= new Date(shift.startTime) &&
      now < new Date(shift.endTime)
  );

  return activeShift ? "On Shift" : employee.availability;
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function getAvailabilityClass(status) {
  if (status === "Available") return "available";
  if (status === "On Shift") return "on-shift";
  return "unavailable";
}

function formatDepartment(code) {
  if (code === "FLOAT") return "Float Pool";
  return code;
}

function formatDateTime(dateValue) {
  return new Date(dateValue).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}