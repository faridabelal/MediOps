import {
  CalendarDays,
  Clock3,
  Moon,
  Sun
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useWorkforce } from "../context/WorkforceContext";

export default function MySchedule() {
  const { user } = useAuth();

  const {
    shifts
  } = useWorkforce();

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

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">
            My schedule
          </p>

          <h1>Scheduled shifts</h1>

          <p>
            View your weekday, weekend, day, and night
            assignments.
          </p>
        </div>
      </section>

      <section className="panel">
        {employeeShifts.length === 0 ? (
          <div className="empty-results">
            No shifts are currently scheduled.
          </div>
        ) : (
          <div className="schedule-list">
            {employeeShifts.map((shift) => (
              <ScheduleCard
                key={shift.id}
                shift={shift}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScheduleCard({ shift }) {
  const start = new Date(shift.startTime);
  const end = new Date(shift.endTime);

  const nightShift =
    start.getHours() >= 18 ||
    start.getHours() < 6;

  const weekend =
    start.getDay() === 0 ||
    start.getDay() === 6;

  const ShiftIcon = nightShift ? Moon : Sun;

  return (
    <article className="schedule-card">
      <div
        className={`schedule-icon ${
          nightShift ? "night" : "day"
        }`}
      >
        <ShiftIcon size={20} />
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
            <CalendarDays size={15} />

            {start.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            })}
          </span>

          <span>
            <Clock3 size={15} />

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
            {nightShift
              ? "Night shift"
              : "Day shift"}
          </span>

          <span>
            {weekend
              ? "Weekend"
              : "Weekday"}
          </span>
        </div>
      </div>
    </article>
  );
}