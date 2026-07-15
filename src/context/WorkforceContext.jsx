import {
  createContext,
  useContext,
  useMemo,
  useState
} from "react";

import {
  departments,
  initialActivity,
  initialEmployees,
  initialOffers,
  initialShifts,
  initialSimulationTime
} from "../data/hospitalData";

const WorkforceContext = createContext(null);

const issueIdentifiers = {
  "ER-Registered Nurse": "OPS-1042",
  "ICU-Respiratory Therapist": "OPS-1043",
  "SURG-Anesthesiologist": "OPS-1044",
  "PEDS-Registered Nurse": "OPS-1045"
};

function readSavedValue(key, fallback) {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return fallback;
  }

  try {
    return JSON.parse(savedValue);
  } catch {
    return fallback;
  }
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function isShiftActive(shift, time) {
  const currentTime = new Date(time);
  const shiftStart = new Date(shift.startTime);
  const shiftEnd = new Date(shift.endTime);

  return (
    shift.status === "confirmed" &&
    currentTime >= shiftStart &&
    currentTime < shiftEnd
  );
}

function getPriority(gap) {
  if (gap >= 2) return "Critical";
  if (gap === 1) return "High";
  return "Low";
}

function formatCoverageTime(dateValue) {
  return new Date(dateValue).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export function WorkforceProvider({ children }) {
  const [employees] = useState(() =>
    readSavedValue("pulseops-employees", initialEmployees)
  );

  const [shifts, setShifts] = useState(() =>
    readSavedValue("pulseops-shifts", initialShifts)
  );

  const [offers, setOffers] = useState(() =>
    readSavedValue("pulseops-offers", initialOffers)
  );

  const [activity, setActivity] = useState(() =>
    readSavedValue("pulseops-activity", initialActivity)
  );

  const [manualRequests, setManualRequests] = useState(() =>
    readSavedValue("pulseops-manual-requests", [])
  );

  const [simulationTime, setSimulationTime] = useState(
    () =>
      localStorage.getItem("pulseops-time") ||
      initialSimulationTime
  );

  function saveState({
    nextShifts = shifts,
    nextOffers = offers,
    nextActivity = activity,
    nextManualRequests = manualRequests,
    nextTime = simulationTime
  } = {}) {
    localStorage.setItem(
      "pulseops-employees",
      JSON.stringify(employees)
    );

    localStorage.setItem(
      "pulseops-shifts",
      JSON.stringify(nextShifts)
    );

    localStorage.setItem(
      "pulseops-offers",
      JSON.stringify(nextOffers)
    );

    localStorage.setItem(
      "pulseops-activity",
      JSON.stringify(nextActivity)
    );

    localStorage.setItem(
      "pulseops-manual-requests",
      JSON.stringify(nextManualRequests)
    );

    localStorage.setItem("pulseops-time", nextTime);
  }

  function buildCandidates(departmentCode, role) {
    return employees
      .filter(
        (employee) =>
          employee.role === role &&
          employee.certifications.includes(departmentCode)
      )
      .map((employee) => {
        const availableHours =
          employee.maxHours - employee.weeklyHours;

        const recommendationScore =
          60 +
          (employee.availability === "Available" ? 15 : 0) +
          (employee.overtimeEligible ? 10 : 0) +
          Math.min(15, Math.max(0, availableHours));

        return {
          id: employee.id,
          name: employee.name,
          role: employee.role,
          homeDepartment: employee.homeDepartmentCode,
          status: employee.availability,
          certifications: employee.certifications,
          hoursWorked: employee.weeklyHours,
          maxHours: employee.maxHours,
          overtimeEligible: employee.overtimeEligible,
          recommendationScore: Math.min(
            100,
            recommendationScore
          )
        };
      })
      .sort(
        (first, second) =>
          second.recommendationScore -
          first.recommendationScore
      );
  }

  const departmentCoverage = useMemo(() => {
    return departments.map((department) => {
      const requirements =
        department.staffingRequirements.map((requirement) => {
          const matchingShifts = shifts.filter(
            (shift) =>
              shift.departmentCode === department.code &&
              shift.role === requirement.role &&
              isShiftActive(shift, simulationTime)
          );

          const confirmedStaff = matchingShifts.length;

          const gap = Math.max(
            0,
            requirement.required - confirmedStaff
          );

          const coveragePercentage =
            requirement.required === 0
              ? 100
              : Math.min(
                  100,
                  Math.round(
                    (confirmedStaff / requirement.required) *
                      100
                  )
                );

          return {
            ...requirement,
            confirmedStaff,
            gap,
            coveragePercentage
          };
        });

      const totalRequired = requirements.reduce(
        (sum, requirement) => sum + requirement.required,
        0
      );

      const totalConfirmed = requirements.reduce(
        (sum, requirement) =>
          sum + requirement.confirmedStaff,
        0
      );

      const totalGap = requirements.reduce(
        (sum, requirement) => sum + requirement.gap,
        0
      );

      const coveragePercentage =
        totalRequired === 0
          ? 100
          : Math.min(
              100,
              Math.round(
                (totalConfirmed / totalRequired) * 100
              )
            );

      return {
        ...department,
        requirements,
        totalRequired,
        totalConfirmed,
        totalGap,
        coveragePercentage
      };
    });
  }, [shifts, simulationTime]);

  const automaticIssues = useMemo(() => {
    return departmentCoverage.flatMap((department) =>
      department.requirements
        .filter((requirement) => requirement.gap > 0)
        .map((requirement) => {
          const issueKey = `${department.code}-${requirement.role}`;

          return {
            id:
              issueIdentifiers[issueKey] ||
              `OPS-${department.code}-${requirement.role}`,
            type: "automatic",
            department: department.name,
            departmentCode: department.code,
            title: `${requirement.gap} ${requirement.role}${
              requirement.gap === 1 ? "" : "s"
            } needed`,
            reason:
              "Confirmed staffing is below the requirement",
            priority: getPriority(requirement.gap),
            status: "Open",
            coverageStart: "Today, 6:00 AM",
            coverageEnd: "Today, 6:00 PM",
            coverageStartTime: "2026-07-12T06:00:00",
            coverageEndTime: "2026-07-12T18:00:00",
            currentStaff: requirement.confirmedStaff,
            requiredStaff: requirement.required,
            patientCensus: department.patientCensus,
            expectedAdmissions:
              department.expectedAdmissions,
            createdAt: "6:10 AM",
            owner: "Farida Belal",
            roleNeeded: requirement.role,
            notes: `${department.name} currently has ${requirement.confirmedStaff} confirmed ${requirement.role}${
              requirement.confirmedStaff === 1 ? "" : "s"
            } for a requirement of ${requirement.required}.`,
            candidates: buildCandidates(
              department.code,
              requirement.role
            )
          };
        })
    );
  }, [departmentCoverage, employees]);

  const manualIssues = useMemo(() => {
    return manualRequests
      .filter((request) => request.status === "Open")
      .map((request) => {
        const department = departments.find(
          (item) => item.code === request.departmentCode
        );

        const acceptedCount = offers.filter(
          (offer) =>
            offer.issueId === request.id &&
            offer.status === "accepted"
        ).length;

        const remainingGap = Math.max(
          0,
          request.requiredStaff - acceptedCount
        );

        return {
          id: request.id,
          type: "manual",
          department:
            department?.name ?? request.departmentCode,
          departmentCode: request.departmentCode,
          title: `${remainingGap} ${request.roleNeeded}${
            remainingGap === 1 ? "" : "s"
          } needed`,
          reason: request.reason,
          priority: request.priority,
          status: request.status,
          coverageStart: formatCoverageTime(
            request.coverageStartTime
          ),
          coverageEnd: formatCoverageTime(
            request.coverageEndTime
          ),
          coverageStartTime: request.coverageStartTime,
          coverageEndTime: request.coverageEndTime,
          currentStaff: acceptedCount,
          requiredStaff: request.requiredStaff,
          patientCensus: department?.patientCensus ?? 0,
          expectedAdmissions:
            department?.expectedAdmissions ?? 0,
          createdAt: new Date(
            request.createdAt
          ).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
          }),
          owner: request.owner,
          roleNeeded: request.roleNeeded,
          notes:
            request.notes ||
            "This request was manually created by the staffing coordinator.",
          candidates: buildCandidates(
            request.departmentCode,
            request.roleNeeded
          )
        };
      })
      .filter(
        (request) =>
          request.currentStaff < request.requiredStaff
      );
  }, [manualRequests, offers, employees]);

  const issues = useMemo(
    () => [...automaticIssues, ...manualIssues],
    [automaticIssues, manualIssues]
  );

  const staffOnDuty = useMemo(() => {
    return shifts.filter((shift) =>
      isShiftActive(shift, simulationTime)
    ).length;
  }, [shifts, simulationTime]);

  const metrics = useMemo(() => {
    const activeIssues = issues.length;

    const criticalIssues = issues.filter(
      (issue) => issue.priority === "Critical"
    ).length;

    const departmentsAtRisk = departmentCoverage.filter(
      (department) => department.totalGap > 0
    ).length;

    const requiredStaffNow = departmentCoverage.reduce(
      (sum, department) =>
        sum + department.totalRequired,
      0
    );

    const overallCoverage =
      requiredStaffNow === 0
        ? 100
        : Math.round(
            (staffOnDuty / requiredStaffNow) * 100
          );

    const simulatedDate = simulationTime.slice(0, 10);

    const resolvedToday = activity.filter(
      (item) =>
        item.type === "resolved" &&
        item.timestamp.startsWith(simulatedDate)
    ).length;

    return {
      activeIssues,
      criticalIssues,
      departmentsAtRisk,
      staffOnDuty,
      requiredStaffNow,
      overallCoverage,
      resolvedToday
    };
  }, [
    activity,
    departmentCoverage,
    issues,
    simulationTime,
    staffOnDuty
  ]);

  function createManualRequest(requestData) {
    const requestId = `OPS-M-${Date.now()
      .toString()
      .slice(-6)}`;

    const newRequest = {
      id: requestId,
      type: "manual",
      departmentCode: requestData.departmentCode,
      roleNeeded: requestData.roleNeeded,
      requiredStaff: Number(requestData.requiredStaff),
      coverageStartTime: requestData.coverageStartTime,
      coverageEndTime: requestData.coverageEndTime,
      priority: requestData.priority,
      reason: requestData.reason.trim(),
      notes: requestData.notes.trim(),
      owner: "Farida Belal",
      status: "Open",
      createdAt: simulationTime
    };

    const nextManualRequests = [
      ...manualRequests,
      newRequest
    ];

    const department = departments.find(
      (item) =>
        item.code === requestData.departmentCode
    );

    const activityEntry = {
      id: createId("ACT"),
      timestamp: simulationTime,
      type: "issue",
      issueId: requestId,
      departmentCode: requestData.departmentCode,
      message: `${requestId} was created for ${
        department?.name ?? requestData.departmentCode
      }.`
    };

    const nextActivity = [activityEntry, ...activity];

    setManualRequests(nextManualRequests);
    setActivity(nextActivity);

    saveState({
      nextManualRequests,
      nextActivity
    });

    return requestId;
  }

  function sendCoverageOffer(issueId, employeeId) {
    const issue = issues.find(
      (currentIssue) => currentIssue.id === issueId
    );

    if (!issue) return;

    const employee = employees.find(
      (currentEmployee) =>
        currentEmployee.id === employeeId
    );

    if (!employee) return;

    const existingOffer = offers.find(
      (offer) =>
        offer.issueId === issueId &&
        offer.employeeId === employeeId &&
        ["pending", "accepted"].includes(offer.status)
    );

    if (existingOffer) return;

    const newOffer = {
      id: createId("OFFER"),
      issueId,
      employeeId,
      departmentCode: issue.departmentCode,
      role: issue.roleNeeded,
      coverageStartTime: issue.coverageStartTime,
      coverageEndTime: issue.coverageEndTime,
      status: "pending",
      createdAt: simulationTime
    };

    const nextOffers = [...offers, newOffer];

    const activityEntry = {
      id: createId("ACT"),
      timestamp: simulationTime,
      type: "offer",
      issueId: issue.id,
      employeeId: employee.id,
      departmentCode: issue.departmentCode,
      message: `Coverage offer sent to ${employee.name} for ${issue.department}.`
    };

    const nextActivity = [activityEntry, ...activity];

    setOffers(nextOffers);
    setActivity(nextActivity);

    saveState({
      nextOffers,
      nextActivity
    });
  }

  function respondToOffer(offerId, response) {
    const offer = offers.find(
      (currentOffer) => currentOffer.id === offerId
    );

    if (!offer) return;

    const employee = employees.find(
      (currentEmployee) =>
        currentEmployee.id === offer.employeeId
    );

    if (!employee) return;

    const relatedIssue = issues.find(
      (issue) => issue.id === offer.issueId
    );

    const nextOffers = offers.map((currentOffer) =>
      currentOffer.id === offerId
        ? {
            ...currentOffer,
            status: response,
            respondedAt: simulationTime
          }
        : currentOffer
    );

    let nextShifts = shifts;

    if (response === "accepted") {
      const shiftAlreadyExists = shifts.some(
        (shift) =>
          shift.sourceOfferId === offer.id
      );

      if (!shiftAlreadyExists) {
        const newShift = {
          id: createId("SHIFT"),
          employeeId: offer.employeeId,
          departmentCode: offer.departmentCode,
          role: offer.role,
          startTime: offer.coverageStartTime,
          endTime: offer.coverageEndTime,
          status: "confirmed",
          source: "coverage-offer",
          sourceOfferId: offer.id
        };

        nextShifts = [...shifts, newShift];
      }
    }

    let nextManualRequests = manualRequests;

    const resolvesIssue =
      response === "accepted" &&
      relatedIssue &&
      relatedIssue.currentStaff + 1 >=
        relatedIssue.requiredStaff;

    if (
      resolvesIssue &&
      relatedIssue?.type === "manual"
    ) {
      nextManualRequests = manualRequests.map((request) =>
        request.id === relatedIssue.id
          ? {
              ...request,
              status: "Resolved",
              resolvedAt: simulationTime
            }
          : request
      );
    }

    const responseActivity = {
      id: createId("ACT"),
      timestamp: simulationTime,
      type:
        response === "accepted"
          ? "accepted"
          : "declined",
      issueId: offer.issueId,
      employeeId: employee.id,
      departmentCode: offer.departmentCode,
      message: `${employee.name} ${response} a coverage offer.`
    };

    let nextActivity = [responseActivity, ...activity];

    if (resolvesIssue && relatedIssue) {
      const resolvedActivity = {
        id: createId("ACT"),
        timestamp: simulationTime,
        type: "resolved",
        issueId: relatedIssue.id,
        departmentCode: relatedIssue.departmentCode,
        message: `${relatedIssue.id} was resolved after ${employee.name} accepted coverage for ${relatedIssue.department}.`
      };

      nextActivity = [
        resolvedActivity,
        ...nextActivity
      ];
    }

    setOffers(nextOffers);
    setShifts(nextShifts);
    setManualRequests(nextManualRequests);
    setActivity(nextActivity);

    saveState({
      nextShifts,
      nextOffers,
      nextManualRequests,
      nextActivity
    });
  }

  function advanceTime(minutes) {
    const currentTime = new Date(simulationTime);

    currentTime.setMinutes(
      currentTime.getMinutes() + minutes
    );

    const nextTime = currentTime
      .toISOString()
      .slice(0, 19);

    setSimulationTime(nextTime);

    saveState({
      nextTime
    });
  }

  function resetDemo() {
    setShifts(initialShifts);
    setOffers(initialOffers);
    setActivity(initialActivity);
    setManualRequests([]);
    setSimulationTime(initialSimulationTime);

    localStorage.removeItem("pulseops-employees");
    localStorage.removeItem("pulseops-shifts");
    localStorage.removeItem("pulseops-offers");
    localStorage.removeItem("pulseops-activity");
    localStorage.removeItem(
      "pulseops-manual-requests"
    );
    localStorage.removeItem("pulseops-time");
  }

  return (
    <WorkforceContext.Provider
      value={{
        departments,
        departmentCoverage,
        employees,
        shifts,
        offers,
        issues,
        activity,
        manualRequests,
        simulationTime,
        metrics,
        createManualRequest,
        sendCoverageOffer,
        respondToOffer,
        advanceTime,
        resetDemo
      }}
    >
      {children}
    </WorkforceContext.Provider>
  );
}

export function useWorkforce() {
  const context = useContext(WorkforceContext);

  if (!context) {
    throw new Error(
      "useWorkforce must be used inside WorkforceProvider."
    );
  }

  return context;
}