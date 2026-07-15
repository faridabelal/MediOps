import {
  useState
} from "react";

import {
  CheckCircle2
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useWorkforce } from "../context/WorkforceContext";

export default function Availability() {
  const { user } = useAuth();

  const {
    employees
  } = useWorkforce();

  const employee = employees.find(
    (item) => item.id === user.employeeId
  );

  const [availability, setAvailability] =
    useState(
      employee?.availability ?? "Unavailable"
    );

  const [preferredShift, setPreferredShift] =
    useState("Day");

  const [weekends, setWeekends] =
    useState(true);

  const [saved, setSaved] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <div>
      <section className="page-heading">
        <div>
          <p className="eyebrow">
            Availability
          </p>

          <h1>Coverage preferences</h1>

          <p>
            Indicate when you are available for additional
            staffing requests.
          </p>
        </div>
      </section>

      <form
        className="panel availability-form"
        onSubmit={handleSubmit}
      >
        <label className="input-group">
          <span>Current availability</span>

          <select
            value={availability}
            onChange={(event) =>
              setAvailability(event.target.value)
            }
          >
            <option>Available</option>
            <option>Unavailable</option>
            <option>Available for emergencies only</option>
          </select>
        </label>

        <label className="input-group">
          <span>Preferred additional shift</span>

          <select
            value={preferredShift}
            onChange={(event) =>
              setPreferredShift(event.target.value)
            }
          >
            <option>Day</option>
            <option>Night</option>
            <option>Either</option>
          </select>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={weekends}
            onChange={(event) =>
              setWeekends(event.target.checked)
            }
          />

          <span>
            Available for weekend coverage
          </span>
        </label>

        <button
          type="submit"
          className="primary-button"
        >
          Save availability
        </button>

        {saved && (
          <p className="availability-success">
            <CheckCircle2 size={17} />
            Availability preferences saved for this
            session.
          </p>
        )}
      </form>
    </div>
  );
}