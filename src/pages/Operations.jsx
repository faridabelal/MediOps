import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Filter,
  Plus,
  Search,
  X
} from "lucide-react";

import { useWorkforce } from "../context/WorkforceContext";

export default function Operations() {
  const {
    issues,
    departments,
    employees,
    simulationTime,
    createManualRequest
  } = useWorkforce();

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        issue.title.toLowerCase().includes(searchValue) ||
        issue.department.toLowerCase().includes(searchValue) ||
        issue.id.toLowerCase().includes(searchValue);

      const matchesPriority =
        priority === "All" ||
        issue.priority === priority;

      return matchesSearch && matchesPriority;
    });
  }, [issues, priority, search]);

  const criticalCount = issues.filter(
    (issue) => issue.priority === "Critical"
  ).length;

  const highCount = issues.filter(
    (issue) => issue.priority === "High"
  ).length;

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Operations Queue</h1>

          <p>
            Review and resolve active workforce coverage
            issues.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={17} />
          Create staffing request
        </button>
      </section>

      <section className="operations-summary">
        <div>
          <strong>{issues.length}</strong>
          <span>Active issues</span>
        </div>

        <div>
          <strong>{criticalCount}</strong>
          <span>Critical</span>
        </div>

        <div>
          <strong>{highCount}</strong>
          <span>High priority</span>
        </div>
      </section>

      <section className="panel">
        <div className="operations-toolbar">
          <div className="search-field">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search by issue, department, or ID"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="filter-field">
            <Filter size={17} />

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
            >
              <option value="All">
                All priorities
              </option>
              <option value="Critical">
                Critical
              </option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="operations-table">
          <div className="operations-table-header">
            <span>Issue</span>
            <span>Department</span>
            <span>Coverage</span>
            <span>Priority</span>
            <span>Status</span>
            <span />
          </div>

          {filteredIssues.map((issue) => (
            <article
              className="operations-row"
              key={issue.id}
            >
              <div className="operations-issue">
                <span
                  className={`priority-symbol ${issue.priority.toLowerCase()}`}
                >
                  <AlertTriangle size={16} />
                </span>

                <div>
                  <span className="request-id">
                    {issue.id}
                  </span>

                  <strong>{issue.title}</strong>
                  <small>{issue.reason}</small>
                </div>
              </div>

              <span>{issue.department}</span>

              <span className="coverage-time">
                <Clock3 size={14} />
                {issue.coverageStart}
              </span>

              <span
                className={`priority-badge ${issue.priority.toLowerCase()}`}
              >
                {issue.priority}
              </span>

              <span className="status-badge">
                {issue.status}
              </span>

              <Link
                to={`/operations/${issue.id}`}
                className="open-issue-link"
              >
                Open
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}

          {filteredIssues.length === 0 && (
            <div className="empty-results">
              {issues.length === 0
                ? "All current staffing issues have been resolved."
                : "No issues match the current filters."}
            </div>
          )}
        </div>
      </section>

      {showCreateModal && (
        <CreateRequestModal
          departments={departments}
          employees={employees}
          simulationTime={simulationTime}
          onClose={() => setShowCreateModal(false)}
          onCreate={(requestData) => {
            createManualRequest(requestData);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateRequestModal({
  departments,
  employees,
  simulationTime,
  onClose,
  onCreate
}) {
  const roles = [
    ...new Set(
      employees.map((employee) => employee.role)
    )
  ];

  const startDate = new Date(simulationTime);
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 12);

  const [form, setForm] = useState({
    departmentCode: departments[0]?.code ?? "",
    roleNeeded: roles[0] ?? "",
    requiredStaff: 1,
    coverageStartTime: toLocalInputValue(startDate),
    coverageEndTime: toLocalInputValue(endDate),
    priority: "High",
    reason: "",
    notes: ""
  });

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (
      new Date(form.coverageEndTime) <=
      new Date(form.coverageStartTime)
    ) {
      window.alert(
        "Coverage end time must be after the start time."
      );
      return;
    }

    onCreate(form);
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <form
        className="request-modal"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="request-modal-header">
          <div>
            <p className="eyebrow">
              Manual staffing request
            </p>

            <h2>Create shortage request</h2>

            <p>
              Use this when a staffing need is not already
              detected automatically.
            </p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="request-form-grid">
          <label className="input-group">
            <span>Department</span>

            <select
              value={form.departmentCode}
              onChange={(event) =>
                updateField(
                  "departmentCode",
                  event.target.value
                )
              }
            >
              {departments.map((department) => (
                <option
                  key={department.code}
                  value={department.code}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>Role needed</span>

            <select
              value={form.roleNeeded}
              onChange={(event) =>
                updateField(
                  "roleNeeded",
                  event.target.value
                )
              }
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>Number of staff needed</span>

            <input
              type="number"
              min="1"
              max="25"
              required
              value={form.requiredStaff}
              onChange={(event) =>
                updateField(
                  "requiredStaff",
                  event.target.value
                )
              }
            />
          </label>

          <label className="input-group">
            <span>Priority</span>

            <select
              value={form.priority}
              onChange={(event) =>
                updateField(
                  "priority",
                  event.target.value
                )
              }
            >
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
            </select>
          </label>

          <label className="input-group">
            <span>Coverage starts</span>

            <input
              type="datetime-local"
              required
              value={form.coverageStartTime}
              onChange={(event) =>
                updateField(
                  "coverageStartTime",
                  event.target.value
                )
              }
            />
          </label>

          <label className="input-group">
            <span>Coverage ends</span>

            <input
              type="datetime-local"
              required
              value={form.coverageEndTime}
              onChange={(event) =>
                updateField(
                  "coverageEndTime",
                  event.target.value
                )
              }
            />
          </label>
        </div>

        <label className="input-group">
          <span>Reason for shortage</span>

          <input
            type="text"
            required
            placeholder="Example: Two unexpected callouts"
            value={form.reason}
            onChange={(event) =>
              updateField("reason", event.target.value)
            }
          />
        </label>

        <label className="input-group">
          <span>Additional notes</span>

          <textarea
            rows="4"
            placeholder="Add operational context or special requirements."
            value={form.notes}
            onChange={(event) =>
              updateField("notes", event.target.value)
            }
          />
        </label>

        <div className="request-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
          >
            <Plus size={17} />
            Create request
          </button>
        </div>
      </form>
    </div>
  );
}

function toLocalInputValue(date) {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return adjustedDate.toISOString().slice(0, 16);
}