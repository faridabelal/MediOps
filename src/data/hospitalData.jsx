export const initialSimulationTime = "2026-07-12T06:30:00";

export const departments = [
  {
    id: "DEPT-ER",
    code: "ER",
    name: "Emergency Department",
    patientCensus: 49,
    expectedAdmissions: 18,
    staffingRequirements: [
      {
        role: "Registered Nurse",
        required: 12
      }
    ]
  },
  {
    id: "DEPT-ICU",
    code: "ICU",
    name: "Intensive Care Unit",
    patientCensus: 18,
    expectedAdmissions: 3,
    staffingRequirements: [
      {
        role: "Respiratory Therapist",
        required: 2
      }
    ]
  },
  {
    id: "DEPT-SURG",
    code: "SURG",
    name: "Surgery",
    patientCensus: 8,
    expectedAdmissions: 0,
    staffingRequirements: [
      {
        role: "Anesthesiologist",
        required: 3
      }
    ]
  },
  {
    id: "DEPT-PEDS",
    code: "PEDS",
    name: "Pediatrics",
    patientCensus: 24,
    expectedAdmissions: 5,
    staffingRequirements: [
      {
        role: "Registered Nurse",
        required: 8
      }
    ]
  }
];

export const initialEmployees = [
  {
    id: "EMP-201",
    name: "Maya Chen",
    email: "maya@pulseops.demo",
    role: "Registered Nurse",
    homeDepartmentCode: "FLOAT",
    certifications: ["ER", "ICU"],
    weeklyHours: 28,
    maxHours: 40,
    overtimeEligible: true,
    availability: "Available",
    preferredShift: "Day",
    weekendAvailable: true
  },
  {
    id: "EMP-202",
    name: "Emily Carter",
    email: "emily@pulseops.demo",
    role: "Registered Nurse",
    homeDepartmentCode: "ICU",
    certifications: ["ER", "ICU"],
    weeklyHours: 34,
    maxHours: 40,
    overtimeEligible: true,
    availability: "Available",
    preferredShift: "Night",
    weekendAvailable: true
  },
  {
    id: "EMP-203",
    name: "Jordan Lee",
    email: "jordan@pulseops.demo",
    role: "Registered Nurse",
    homeDepartmentCode: "ER",
    certifications: ["ER"],
    weeklyHours: 38,
    maxHours: 40,
    overtimeEligible: false,
    availability: "On Shift",
    preferredShift: "Day",
    weekendAvailable: false
  },
  {
    id: "EMP-204",
    name: "Amina Hassan",
    email: "amina@pulseops.demo",
    role: "Respiratory Therapist",
    homeDepartmentCode: "ICU",
    certifications: ["ICU", "ER"],
    weeklyHours: 26,
    maxHours: 40,
    overtimeEligible: true,
    availability: "Available",
    preferredShift: "Either",
    weekendAvailable: true
  },
  {
    id: "EMP-205",
    name: "Daniel Brooks",
    email: "daniel@pulseops.demo",
    role: "Anesthesiologist",
    homeDepartmentCode: "SURG",
    certifications: ["SURG"],
    weeklyHours: 30,
    maxHours: 45,
    overtimeEligible: true,
    availability: "Available",
    preferredShift: "Day",
    weekendAvailable: true
  }
];

function createShift({
  id,
  employeeId,
  departmentCode,
  role,
  startTime,
  endTime,
  status = "confirmed",
  source = "schedule"
}) {
  return {
    id,
    employeeId,
    departmentCode,
    role,
    startTime,
    endTime,
    status,
    source
  };
}

const erDayShifts = Array.from({ length: 10 }, (_, index) =>
  createShift({
    id: `SHIFT-ER-DAY-${index + 1}`,
    employeeId:
      index === 0
        ? "EMP-203"
        : `ER-DAY-STAFF-${index + 1}`,
    departmentCode: "ER",
    role: "Registered Nurse",
    startTime: "2026-07-12T06:00:00",
    endTime: "2026-07-12T18:00:00"
  })
);

const erNightShifts = Array.from({ length: 12 }, (_, index) =>
  createShift({
    id: `SHIFT-ER-NIGHT-${index + 1}`,
    employeeId: `ER-NIGHT-STAFF-${index + 1}`,
    departmentCode: "ER",
    role: "Registered Nurse",
    startTime: "2026-07-12T18:00:00",
    endTime: "2026-07-13T06:00:00"
  })
);

const pediatricDayShifts = Array.from({ length: 8 }, (_, index) =>
  createShift({
    id: `SHIFT-PEDS-DAY-${index + 1}`,
    employeeId: `PEDS-DAY-STAFF-${index + 1}`,
    departmentCode: "PEDS",
    role: "Registered Nurse",
    startTime: "2026-07-12T06:00:00",
    endTime: "2026-07-12T18:00:00"
  })
);

const pediatricNightShifts = Array.from({ length: 8 }, (_, index) =>
  createShift({
    id: `SHIFT-PEDS-NIGHT-${index + 1}`,
    employeeId: `PEDS-NIGHT-STAFF-${index + 1}`,
    departmentCode: "PEDS",
    role: "Registered Nurse",
    startTime: "2026-07-12T18:00:00",
    endTime: "2026-07-13T06:00:00"
  })
);

export const initialShifts = [
  ...erDayShifts,
  ...erNightShifts,

  createShift({
    id: "SHIFT-ICU-RT-DAY-1",
    employeeId: "ICU-RT-DAY-1",
    departmentCode: "ICU",
    role: "Respiratory Therapist",
    startTime: "2026-07-12T06:00:00",
    endTime: "2026-07-12T18:00:00"
  }),

  createShift({
    id: "SHIFT-ICU-RT-NIGHT-1",
    employeeId: "ICU-RT-NIGHT-1",
    departmentCode: "ICU",
    role: "Respiratory Therapist",
    startTime: "2026-07-12T18:00:00",
    endTime: "2026-07-13T06:00:00"
  }),

  createShift({
    id: "SHIFT-SURG-DAY-1",
    employeeId: "SURG-ANES-DAY-1",
    departmentCode: "SURG",
    role: "Anesthesiologist",
    startTime: "2026-07-12T06:00:00",
    endTime: "2026-07-12T18:00:00"
  }),

  createShift({
    id: "SHIFT-SURG-DAY-2",
    employeeId: "SURG-ANES-DAY-2",
    departmentCode: "SURG",
    role: "Anesthesiologist",
    startTime: "2026-07-12T06:00:00",
    endTime: "2026-07-12T18:00:00"
  }),

  createShift({
    id: "SHIFT-SURG-NIGHT-1",
    employeeId: "SURG-ANES-NIGHT-1",
    departmentCode: "SURG",
    role: "Anesthesiologist",
    startTime: "2026-07-12T18:00:00",
    endTime: "2026-07-13T06:00:00"
  }),

  createShift({
    id: "SHIFT-SURG-NIGHT-2",
    employeeId: "SURG-ANES-NIGHT-2",
    departmentCode: "SURG",
    role: "Anesthesiologist",
    startTime: "2026-07-12T18:00:00",
    endTime: "2026-07-13T06:00:00"
  }),

  ...pediatricDayShifts,
  ...pediatricNightShifts,

  // Maya: weekend day shift
  createShift({
    id: "SHIFT-MAYA-WEEKEND-DAY",
    employeeId: "EMP-201",
    departmentCode: "ER",
    role: "Registered Nurse",
    startTime: "2026-07-18T07:00:00",
    endTime: "2026-07-18T19:00:00"
  }),

  // Maya: weekday day shift
  createShift({
    id: "SHIFT-MAYA-WEEKDAY-DAY",
    employeeId: "EMP-201",
    departmentCode: "ICU",
    role: "Registered Nurse",
    startTime: "2026-07-20T07:00:00",
    endTime: "2026-07-20T19:00:00"
  }),

  // Emily: weekend night shift
  createShift({
    id: "SHIFT-EMILY-WEEKEND-NIGHT",
    employeeId: "EMP-202",
    departmentCode: "ICU",
    role: "Registered Nurse",
    startTime: "2026-07-18T19:00:00",
    endTime: "2026-07-19T07:00:00"
  }),

  // Emily: weekday night shift
  createShift({
    id: "SHIFT-EMILY-WEEKDAY-NIGHT",
    employeeId: "EMP-202",
    departmentCode: "ER",
    role: "Registered Nurse",
    startTime: "2026-07-21T19:00:00",
    endTime: "2026-07-22T07:00:00"
  }),

  // Jordan: weekday day shift
  createShift({
    id: "SHIFT-JORDAN-WEEKDAY-DAY",
    employeeId: "EMP-203",
    departmentCode: "ER",
    role: "Registered Nurse",
    startTime: "2026-07-13T07:00:00",
    endTime: "2026-07-13T19:00:00"
  })
];

export const initialOffers = [];

export const initialActivity = [
  {
    id: "ACT-001",
    timestamp: "2026-07-12T06:05:00",
    type: "system",
    message: "Morning workforce coverage assessment completed."
  },
  {
    id: "ACT-002",
    timestamp: "2026-07-12T06:10:00",
    type: "issue",
    message:
      "Emergency Department registered nurse coverage gap detected."
  },
  {
    id: "ACT-003",
    timestamp: "2026-07-12T06:12:00",
    type: "issue",
    message:
      "Intensive Care Unit respiratory therapist coverage gap detected."
  },
  {
    id: "ACT-004",
    timestamp: "2026-07-12T06:15:00",
    type: "issue",
    message:
      "Surgery anesthesiologist coverage gap detected."
  }
];