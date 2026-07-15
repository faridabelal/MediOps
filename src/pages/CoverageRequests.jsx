import {
  Check,
  Clock3,
  X
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useWorkforce } from "../context/WorkforceContext";

export default function CoverageRequests() {
  const { user } = useAuth();

  const {
    offers,
    issues,
    respondToOffer
  } = useWorkforce();

  const employeeOffers = offers
    .filter(
      (offer) =>
        offer.employeeId === user.employeeId
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt) -
        new Date(first.createdAt)
    );

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">
            Coverage requests
          </p>

          <h1>Shift offers</h1>

          <p>
            Accept or decline additional hospital coverage
            requests.
          </p>
        </div>
      </section>

      <section className="panel">
        {employeeOffers.length === 0 ? (
          <div className="empty-results">
            No coverage requests have been sent to you.
          </div>
        ) : (
          <div className="offer-list">
            {employeeOffers.map((offer) => {
              const issue = issues.find(
                (item) =>
                  item.id === offer.issueId
              );

              const start = new Date(
                offer.coverageStartTime
              );

              const end = new Date(
                offer.coverageEndTime
              );

              return (
                <article
                  className="offer-card"
                  key={offer.id}
                >
                  <div>
                    <span
                      className={`status-badge offer-${offer.status}`}
                    >
                      {formatStatus(offer.status)}
                    </span>

                    <h3>
                      {issue?.department ??
                        offer.departmentCode}
                    </h3>

                    <p>
                      {issue?.roleNeeded ??
                        offer.role}
                    </p>

                    <span className="coverage-time">
                      <Clock3 size={15} />

                      {start.toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                      })}

                      {" – "}

                      {end.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {offer.status === "pending" && (
                    <div className="offer-actions">
                      <button
                        type="button"
                        className="decline-button"
                        onClick={() =>
                          respondToOffer(
                            offer.id,
                            "declined"
                          )
                        }
                      >
                        <X size={17} />
                        Decline
                      </button>

                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          respondToOffer(
                            offer.id,
                            "accepted"
                          )
                        }
                      >
                        <Check size={17} />
                        Accept shift
                      </button>
                    </div>
                  )}

                  {offer.status === "accepted" && (
                    <strong className="accepted-message">
                      Shift accepted and added to your
                      schedule
                    </strong>
                  )}

                  {offer.status === "declined" && (
                    <strong className="declined-message">
                      You declined this coverage request
                    </strong>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function formatStatus(status) {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}