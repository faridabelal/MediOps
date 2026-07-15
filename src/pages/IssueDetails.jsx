import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserCheck,
  Users
} from "lucide-react";
import { useWorkforce } from "../context/WorkforceContext";

export default function IssueDetails() {
  const { issueId } = useParams();

  const {
    issues,
    offers,
    sendCoverageOffer
  } = useWorkforce();

  const issue = issues.find((item) => item.id === issueId);

  if (!issue) {
    return (
      <div className="empty-page">
        <h1>Issue not found</h1>

        <Link to="/operations" className="text-button">
          Return to Operations Queue
        </Link>
      </div>
    );
  }

  const remainingGap = Math.max(
    0,
    issue.requiredStaff - issue.currentStaff
  );

  function getCandidateOffer(candidateId) {
    return offers.find(
      (offer) =>
        offer.issueId === issue.id &&
        offer.employeeId === candidateId &&
        ["pending", "accepted", "declined"].includes(offer.status)
    );
  }

  return (
    <div>
      <Link to="/operations" className="back-link">
        <ArrowLeft size={17} />
        Back to Operations Queue
      </Link>

      <section className="issue-detail-heading">
        <div>
          <div className="issue-heading-meta">
            <span className="request-id">{issue.id}</span>

            <span
              className={`priority-badge ${issue.priority.toLowerCase()}`}
            >
              {issue.priority}
            </span>

            <span className="status-badge">{issue.status}</span>
          </div>

          <h1>{issue.title}</h1>
          <p>{issue.department}</p>
        </div>

        <button type="button" className="secondary-button">
          Escalate issue
        </button>
      </section>

      <section className="issue-detail-grid">
        <div className="issue-main-column">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Staffing assessment</p>
                <h2>Coverage gap</h2>
              </div>
            </div>

            <div className="coverage-metrics">
              <CoverageMetric
                label="Required staff"
                value={issue.requiredStaff}
              />

              <CoverageMetric
                label="Current staff"
                value={issue.currentStaff}
              />

              <CoverageMetric
                label="Remaining gap"
                value={remainingGap}
                emphasized
              />

              <CoverageMetric
                label="Patient census"
                value={issue.patientCensus}
              />
            </div>

            <div className="issue-explanation">
              <h3>Why this issue was created</h3>
              <p>{issue.reason}</p>
              <p>{issue.notes}</p>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Decision support</p>
                <h2>Recommended candidates</h2>
              </div>

              <span className="candidate-count">
                {issue.candidates.length} candidates found
              </span>
            </div>

            {issue.candidates.length === 0 ? (
              <div className="empty-results">
                No eligible candidates were automatically identified.
              </div>
            ) : (
              <div className="candidate-list">
                {issue.candidates.map((candidate) => {
                  const candidateOffer = getCandidateOffer(candidate.id);

                  const unavailable = candidate.status === "On Shift";
                  const isPending = candidateOffer?.status === "pending";
                  const isAccepted = candidateOffer?.status === "accepted";
                  const isDeclined = candidateOffer?.status === "declined";

                  return (
                    <article className="candidate-card" key={candidate.id}>
                      <div className="candidate-avatar">
                        {candidate.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>

                      <div className="candidate-information">
                        <div className="candidate-heading">
                          <div>
                            <h3>{candidate.name}</h3>

                            <p>
                              {candidate.role} · {candidate.homeDepartment}
                            </p>
                          </div>

                          <strong>
                            {candidate.recommendationScore}% match
                          </strong>
                        </div>

                        <div className="candidate-reasons">
                          <span>
                            <ShieldCheck size={15} />
                            {issue.departmentCode} certified
                          </span>

                          <span>
                            <Clock3 size={15} />
                            {candidate.hoursWorked}/{candidate.maxHours} hours
                          </span>

                          <span>
                            <UserCheck size={15} />
                            {candidate.status}
                          </span>

                          <span>
                            <CheckCircle2 size={15} />
                            {candidate.overtimeEligible
                              ? "Overtime eligible"
                              : "Not overtime eligible"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={
                          isAccepted
                            ? "assigned-button"
                            : isPending
                              ? "pending-button"
                              : "primary-button"
                        }
                        disabled={isAccepted || isPending || unavailable}
                        onClick={() =>
                          sendCoverageOffer(issue.id, candidate.id)
                        }
                      >
                        {isAccepted
                          ? "Accepted"
                          : isPending
                            ? "Awaiting Response"
                            : isDeclined
                              ? "Send Again"
                              : unavailable
                                ? "Unavailable"
                                : "Send Offer"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </article>
        </div>

        <aside className="issue-side-column">
          <article className="panel">
            <p className="eyebrow">Request details</p>

            <dl className="request-details">
              <div>
                <dt>Role needed</dt>
                <dd>{issue.roleNeeded}</dd>
              </div>

              <div>
                <dt>Coverage starts</dt>
                <dd>{issue.coverageStart}</dd>
              </div>

              <div>
                <dt>Coverage ends</dt>
                <dd>{issue.coverageEnd}</dd>
              </div>

              <div>
                <dt>Created</dt>
                <dd>{issue.createdAt}</dd>
              </div>

              <div>
                <dt>Owner</dt>
                <dd>{issue.owner}</dd>
              </div>
            </dl>
          </article>

          <article
            className={`resolution-card ${
              remainingGap === 0 ? "resolved" : ""
            }`}
          >
            <Users size={22} />

            <div>
              <h3>
                {remainingGap === 0
                  ? "Coverage restored"
                  : `${remainingGap} staff member${
                      remainingGap === 1 ? "" : "s"
                    } still needed`}
              </h3>

              <p>
                {remainingGap === 0
                  ? "The staffing requirement has been met."
                  : "Send coverage offers to eligible candidates or escalate for additional support."}
              </p>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

function CoverageMetric({ label, value, emphasized = false }) {
  return (
    <div className={`coverage-metric ${emphasized ? "emphasized" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}