import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseMedical,
  Clock3,
  Filter,
  Search,
  ShieldCheck,
  UserCheck
} from "lucide-react";

import { useWorkforce } from "../context/WorkforceContext";

export default function Employees() {
  const {
    employees,
    shifts,
    offers,
    simulationTime
  } = useWorkforce();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("All");

  const roles = [
    ...new Set(employees.map((employee) => employee.role))
  ];

  const filteredEmployees = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchValue) ||
        employee.role.toLowerCase().includes(searchValue) ||
        employee.homeDepartmentCode
          .toLowerCase()
          .includes(searchValue) ||
        employee.certifications.some((certification) =>
          certification.toLowerCase().includes(searchValue)
        );

      const matchesRole =
        roleFilter === "All" ||
        employee.role === roleFilter;

      const matchesAvailability =
        availabilityFilter === "All" ||
        employee.availability === availabilityFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesAvailability
      );
    });
  }, [
    employees,
    search,
    roleFilter,
    availabilityFilter
  ]);

  const availableEmployees = employees.filter(
    (employee) => employee.availability === "Available"
  ).length;

  const overtimeEligibleEmployees = employees.filter(
    (employee) => employee.overtimeEligible
  ).length;

  const onShiftEmployees = employees.filter(
    (employee) =>
      getEmployeeStatus(
        employee,
        shifts,
        simulationTime
      ) === "On Shift"
  ).length;

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Workforce</p>
          <h1>Employee Directory</h1>

          <p>
            Review staff availability, qualifications, schedules,
            weekly hours, and active coverage requests.
          </p>
        </div>
      </section>

      <section className="employee-summary-grid">
        <SummaryCard
          label="Employees"
          value={employees.length}
          detail="Detailed workforce records"
          icon={BriefcaseMedical}
          tone="neutral"
        />

        <SummaryCard
          label="Available"
          value={availableEmployees}
          detail="Available for additional coverage"
          icon={UserCheck}
          tone="success"
        />

        <SummaryCard
          label="Currently on shift"
          value={onShiftEmployees}
          detail="Based on simulated time"
          icon={Clock3}
          tone="neutral"
        />

        <SummaryCard
          label="Overtime eligible"
          value={overtimeEligibleEmployees}
          detail="Within current eligibility rules"
          icon={ShieldCheck}
          tone="warning"
        />
      </section>

      <section className="panel">
        <div className="employee-toolbar">
          <div className="search-field">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search employees, roles, departments, or certifications"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="employee-filters">
            <div className="filter-field">
              <Filter size={17} />

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
              >
                <option value="All">All roles</option>

                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <select
                value={availabilityFilter}
                onChange={(event) =>
                  setAvailabilityFilter(event.target.value)
                }
              >
                <option value="All">
                  All availability
                </option>
                <option value="Available">
                  Available
                </option>
                <option value="On Shift">
                  On Shift
                </option>
                <option value="Unavailable">
                  Unavailable
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="employee-table">
          <div className="employee-table-header">
            <span>Employee</span>
            <span>Availability</span>
            <span>Weekly hours</span>
            <span>Preferred shift</span>
            <span>Next shift</span>
            <span>Offers</span>
            <span />
          </div>

          {filteredEmployees.map((employee) => {
            const employeeStatus = getEmployeeStatus(
              employee,
              shifts,
              simulationTime
            );

            const nextShift = getNextShift(
              employee.id,
              shifts,
              simulationTime
            );

            const pendingOffers = offers.filter(
              (offer) =>
                offer.employeeId === employee.id &&
                offer.status === "pending"
            ).length;

            const hoursPercentage = Math.min(
              100,
              Math.round(
                (employee.weeklyHours /
                  employee.maxHours) *
                  100
              )
            );

            return (
              <article
                className="employee-row"
                key={employee.id}
              >
                <div className="employee-identity">
                  <div className="employee-avatar">
                    {getInitials(employee.name)}
                  </div>

                  <div>
                    <strong>{employee.name}</strong>
                    <span>{employee.role}</span>
                    <small>
                      Home unit:{" "}
                      {formatDepartment(
                        employee.homeDepartmentCode
                      )}
                    </small>
                  </div>
                </div>

                <span
                  className={`employee-availability ${getAvailabilityClass(
                    employeeStatus
                  )}`}
                >
                  {employeeStatus}
                </span>

                <div className="employee-hours">
                  <div>
                    <strong>
                      {employee.weeklyHours}/
                      {employee.maxHours}
                    </strong>
                    <span>hours</span>
                  </div>

                  <div className="employee-hours-track">
                    <div
                      className="employee-hours-fill"
                      style={{
                        width: `${hoursPercentage}%`
                      }}
                    />
                  </div>
                </div>

                <div className="employee-shift-preference">
                  <strong>
                    {employee.preferredShift ?? "Either"}
                  </strong>

                  <span>
                    {employee.weekendAvailable
                      ? "Weekend available"
                      : "Weekdays only"}
                  </span>
                </div>

                <div className="employee-next-shift">
                  {nextShift ? (
                    <>
                      <strong>
                        {formatShiftDate(
                          nextShift.startTime
                        )}
                      </strong>

                      <span>
                        {formatShiftTime(
                          nextShift.startTime,
                          nextShift.endTime
                        )}
                      </span>

                      <small>
                        {nextShift.departmentCode}
                      </small>
                    </>
                  ) : (
                    <span>No upcoming shift</span>
                  )}
                </div>

                <span
                  className={
                    pendingOffers > 0
                      ? "pending-offer-count active"
                      : "pending-offer-count"
                  }
                >
                  {pendingOffers}
                </span>

                <Link
                  to={`/employees/${employee.id}`}
                  className="open-issue-link"
                >
                  View
                  <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div className="empty-results">
              No employees match the current filters.
            </div>
          )}
        </div>
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

function getEmployeeStatus(
  employee,
  shifts,
  simulationTime
) {
  const now = new Date(simulationTime);

  const activeShift = shifts.some((shift) => {
    return (
      shift.employeeId === employee.id &&
      shift.status === "confirmed" &&
      now >= new Date(shift.startTime) &&
      now < new Date(shift.endTime)
    );
  });

  return activeShift ? "On Shift" : employee.availability;
}

function getNextShift(
  employeeId,
  shifts,
  simulationTime
) {
  const now = new Date(simulationTime);

  return shifts
    .filter(
      (shift) =>
        shift.employeeId === employeeId &&
        shift.status === "confirmed" &&
        new Date(shift.endTime) > now
    )
    .sort(
      (first, second) =>
        new Date(first.startTime) -
        new Date(second.startTime)
    )[0];
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

function formatShiftDate(dateValue) {
  return new Date(dateValue).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric"
    }
  );
}

function formatShiftTime(startValue, endValue) {
  const start = new Date(startValue);
  const end = new Date(endValue);

  return `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  })}–${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  })}`;
}