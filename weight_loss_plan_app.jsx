import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Target, Footprints, Apple, Dumbbell, Scale, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const foodPrinciples = [
  "No sugar.",
  "No pasta.",
  "No rice.",
  "Only eat out once a week.",
  "No junk food.",
  "Always eat mom’s food because one day you are not having it.",
  "Always try to find low-calorie options, for example sauces and swaps."
];

const shoppingSuggestions = [
  "Chicken thighs",
  "Protein tortilla wraps",
  "Protein shake",
  "Babybel",
  "Eggs",
  "Spray oil (olive oil)",
  "Tuna",
  "Peri Peri sauce",
  "Fruits: pineapple, grapes",
  "Potatoes or frozen chips with only 2 ingredients",
  "Milk"
];

const motivationalQuotes = [
  "Consistency beats intensity.",
  "A hard day still counts if you stick to the plan.",
  "Do not chase perfect. Chase repeatable.",
  "Every good day makes 85kg more realistic.",
  "The goal is not to feel motivated. The goal is to keep moving."
];

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function buildDateRange() {
  const start = new Date(2026, 2, 23); // 23 March 2026
  const end = new Date(2026, 6, 15); // 15 July 2026
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const knownStatus = {
  "2026-03-23": { type: "off", label: "Off work" },
  "2026-03-24": { type: "off", label: "Off work" },
  "2026-03-25": { type: "work", label: "Working day" },
  "2026-03-26": { type: "work", label: "Working day" },
  "2026-03-27": { type: "work", label: "Working day" },
  "2026-03-28": { type: "work", label: "Working day" },
  "2026-03-29": { type: "work", label: "Working day" },
  "2026-03-30": { type: "off", label: "Off work" },
  "2026-03-31": { type: "off", label: "Off work" },
  "2026-04-01": { type: "wedding", label: "Wedding day" },
  "2026-04-02": { type: "off", label: "Off work" },
  "2026-04-03": { type: "off", label: "Off work" },
  "2026-04-04": { type: "off", label: "Off work" },
  "2026-04-05": { type: "off", label: "Off work" },
  "2026-04-06": { type: "off", label: "Off work" },
  "2026-04-07": { type: "off", label: "Off work" },
  "2026-04-08": { type: "wedding", label: "Wedding day" },
  "2026-04-09": { type: "off", label: "Off work" },
  "2026-04-10": { type: "work", label: "Work 06:45" },
  "2026-04-11": { type: "work", label: "Work 06:45" },
  "2026-04-12": { type: "holiday", label: "Eri holiday" },
  "2026-04-13": { type: "work", label: "Work 06:45" },
  "2026-04-14": { type: "work", label: "Work 06:45" },
  "2026-04-15": { type: "work", label: "Work 06:45" },
  "2026-04-16": { type: "off", label: "Off work" },
  "2026-04-17": { type: "off", label: "Off work" },
  "2026-04-18": { type: "off", label: "Off work" },
  "2026-04-19": { type: "off", label: "Off work" },
  "2026-04-20": { type: "work", label: "Work 06:45" },
  "2026-04-21": { type: "work", label: "Work 06:45" },
  "2026-04-22": { type: "work", label: "Work 06:45" },
  "2026-04-23": { type: "work", label: "Work 06:45" },
  "2026-04-24": { type: "work", label: "Work 16:00" },
  "2026-04-25": { type: "off", label: "Off work" },
  "2026-04-26": { type: "off", label: "Off work" },
  "2026-04-27": { type: "work", label: "Work 06:45" },
  "2026-04-28": { type: "work", label: "Work 06:45" },
  "2026-04-29": { type: "work", label: "Work 06:45" },
  "2026-04-30": { type: "work", label: "Work 06:45" }
};

function getDefaultPlan(dateKey) {
  const dateObj = parseLocalDate(dateKey);
  const isFutureTbd = dateObj >= new Date(2026, 4, 1) && dateObj <= new Date(2026, 6, 15);
  const status = knownStatus[dateKey] || (isFutureTbd ? { type: "tbd", label: "TBD" } : { type: "unknown", label: "Schedule not added yet" });
  return {
    status,
    steps: "15,000",
    workout:
      status.type === "off"
        ? "Choose workout for this off day"
        : status.type === "work"
        ? "Walk target only unless you choose to add a short session"
        : status.type === "wedding"
        ? "Wedding day — no workout planned"
        : status.type === "holiday"
        ? "Eri holiday — no workout planned"
        : status.type === "tbd"
        ? "TBD — waiting for work schedule"
        : "Set work/off status and then plan the day",
    foodFocus: "Stick to the diet principles and build meals around protein + filling carbs + veg",
    water: "2.5 to 3 litres",
    notes: "",
    complete: false
  };
}

const initialPlans = buildDateRange().reduce((acc, date) => {
  acc[toKey(date)] = getDefaultPlan(toKey(date));
  return acc;
}, {});

initialPlans["2026-03-23"].workout = "Mission for today: find a gym and get a gym membership. Keep the 15,000 step target.";
initialPlans["2026-03-24"].workout = "Mission for today: compare gyms if needed, choose one, and get fully set up to start training. Keep the 15,000 step target.";
initialPlans["2026-03-30"].workout = `Push day

1. Bench press — 3 sets of 6–10 reps
Starting weights to try: 40kg / 50kg / 60kg

2. Tricep cable extensions — 3 sets of 6–10 reps

3. Shoulder press — 3 sets of 6–10 reps

4. Extra chest flys — 3 sets of 6–10 reps

5. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Edit this workout as needed.`;
initialPlans["2026-03-31"].workout = `Pull day

1. Lat pulldown close grip — 3 sets of 6–10 reps

2. Rear delt fly — 3 sets of 6–10 reps

3. Preacher curls — 3 sets of 6–10 reps

4. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Edit this workout as needed.`;
initialPlans["2026-04-02"].workout = `Leg day

1. Leg press machine — 3 sets of 6–10 reps

2. Leg extension — 3 sets of 6–10 reps

3. Hamstring curl or barbell Romanian deadlift — 3 sets of 6–10 reps

4. Calf raises — 3 sets of 6–10 reps

Edit this workout as needed.`;
initialPlans["2026-04-03"].workout = `Rest day

No gym workout today.
Still hit the 15,000 step target.

Edit this plan as needed.`;
initialPlans["2026-04-04"].workout = `Push day

1. Bench press — 3 sets of 6–10 reps
Starting weights to try: 40kg / 50kg / 60kg

2. Tricep cable extensions — 3 sets of 6–10 reps

3. Shoulder press — 3 sets of 6–10 reps

4. Extra chest flys — 3 sets of 6–10 reps

5. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Edit this workout as needed.`;
initialPlans["2026-04-05"].workout = `Pull day

1. Lat pulldown close grip — 3 sets of 6–10 reps

2. Rear delt fly — 3 sets of 6–10 reps

3. Preacher curls — 3 sets of 6–10 reps

4. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Edit this workout as needed.`;
initialPlans["2026-04-06"].workout = `Rest day

No gym workout today.
Still hit the 15,000 step target.

Edit this plan as needed.`;
initialPlans["2026-04-07"].workout = `Leg day

1. Leg press machine — 3 sets of 6–10 reps

2. Leg extension — 3 sets of 6–10 reps

3. Hamstring curl or barbell Romanian deadlift — 3 sets of 6–10 reps

4. Calf raises — 3 sets of 6–10 reps

Edit this workout as needed.`;
initialPlans["2026-04-09"].workout = `Push day

1. Bench press — 3 sets of 6–10 reps
Starting weights to try: 40kg / 50kg / 60kg

2. Tricep cable extensions — 3 sets of 6–10 reps

3. Shoulder press — 3 sets of 6–10 reps

4. Extra chest flys — 3 sets of 6–10 reps

5. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Edit this workout as needed.`;
initialPlans["2026-04-16"].workout = `Pull day

1. Lat pulldown close grip — 3 sets of 6–10 reps

2. Rear delt fly — 3 sets of 6–10 reps

3. Preacher curls — 3 sets of 6–10 reps

4. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Bonus note: it’s my birthday.

Edit this workout as needed.`;
initialPlans["2026-04-17"].workout = `Leg day

1. Leg press machine — 3 sets of 6–10 reps

2. Leg extension — 3 sets of 6–10 reps

3. Hamstring curl or barbell Romanian deadlift — 3 sets of 6–10 reps

4. Calf raises — 3 sets of 6–10 reps

Edit this workout as needed.`;
initialPlans["2026-04-18"].workout = `Rest day

No gym workout today.
Still hit the 15,000 step target.

Edit this plan as needed.`;
initialPlans["2026-04-19"].workout = `Push day

1. Bench press — 3 sets of 6–10 reps
Starting weights to try: 40kg / 50kg / 60kg

2. Tricep cable extensions — 3 sets of 6–10 reps

3. Shoulder press — 3 sets of 6–10 reps

4. Extra chest flys — 3 sets of 6–10 reps

5. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Edit this workout as needed.`;
initialPlans["2026-04-25"].workout = `Pull day

1. Lat pulldown close grip — 3 sets of 6–10 reps

2. Rear delt fly — 3 sets of 6–10 reps

3. Preacher curls — 3 sets of 6–10 reps

4. Cardio finisher — incline walk for 30 minutes at incline 7 and pace 3–4

Edit this workout as needed.`;
initialPlans["2026-04-26"].workout = `Leg day

1. Leg press machine — 3 sets of 6–10 reps

2. Leg extension — 3 sets of 6–10 reps

3. Hamstring curl or barbell Romanian deadlift — 3 sets of 6–10 reps

4. Calf raises — 3 sets of 6–10 reps

Edit this workout as needed.`;

function buildMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayIndex);
  const weeks = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function WeightLossPlanApp() {
  const [plans, setPlans] = useState(initialPlans);
  const [selectedDate, setSelectedDate] = useState("2026-03-23");
  const [visibleMonth, setVisibleMonth] = useState({ year: 2026, month: 2 });
  const [activeTab, setActiveTab] = useState("calendar");

  const weeks = useMemo(() => buildMonthMatrix(visibleMonth.year, visibleMonth.month), [visibleMonth]);
  const selectedPlan = plans[selectedDate];
  const selectedDateObj = parseLocalDate(selectedDate);

  const planKeys = Object.keys(plans);
  const completedCount = planKeys.filter((key) => plans[key].complete).length;
  const progressPct = Math.round((completedCount / planKeys.length) * 100);

  const weeklyWeighIns = [
    "2026-03-23",
    "2026-03-30",
    "2026-04-06",
    "2026-04-13",
    "2026-04-20",
    "2026-04-27"
  ];

  const [weighIns, setWeighIns] = useState({
    "2026-03-23": "",
    "2026-03-30": "",
    "2026-04-06": "",
    "2026-04-13": "",
    "2026-04-20": "",
    "2026-04-27": ""
  });

  function updatePlan(field, value) {
    setPlans((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [field]: value
      }
    }));
  }

  function updateStatus(type) {
    const label = type === "off" ? "Off work" : type === "work" ? "Working day" : type === "wedding" ? "Wedding day" : type === "holiday" ? "Eri holiday" : type === "tbd" ? "TBD" : "Schedule not added yet";
    setPlans((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        status: { type, label },
        workout: type === "off" ? "Choose workout for this off day" : type === "work" ? "Walk target only unless you choose to add a short session" : type === "wedding" ? "Wedding day — no workout planned" : type === "holiday" ? "Eri holiday — no workout planned" : type === "tbd" ? "TBD — waiting for work schedule" : "Set work/off status and then plan the day"
      }
    }));
  }

  function moveMonth(direction) {
    setVisibleMonth((prev) => {
      const next = new Date(prev.year, prev.month + direction, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function cellStyle(dateKey, isCurrentMonth) {
    const plan = plans[dateKey];
    if (!plan) return isCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400";
    if (selectedDate === dateKey) return "bg-sky-100 ring-2 ring-sky-500";
    if (plan.status.type === "work") return "bg-amber-50 hover:bg-amber-100";
    if (plan.status.type === "off") return "bg-emerald-50 hover:bg-emerald-100";
    if (plan.status.type === "wedding") return "bg-rose-50 hover:bg-rose-100";
    if (plan.status.type === "holiday") return "bg-violet-50 hover:bg-violet-100";
    if (plan.status.type === "tbd") return "bg-orange-50 hover:bg-orange-100";
    return "bg-white hover:bg-slate-50";
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-md space-y-4 px-3 py-4 md:max-w-7xl md:space-y-6 md:p-8">
        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
          <div className="space-y-4 md:flex md:flex-row md:items-center md:justify-between md:gap-4 md:space-y-0">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-700">Custom plan</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-4xl">Evity09 Plan</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Tap a day to see the plan, steps, diet focus, and notes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Target className="h-4 w-4" /> Goal</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">85kg</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Scale className="h-4 w-4" /> Start</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">95kg</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><Footprints className="h-4 w-4" /> Daily steps</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">15k</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-slate-200 shadow-none">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-4 w-4" /> Progress</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 md:text-xl">{completedCount}/{planKeys.length}</div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-600 md:text-sm">
              <span>Plan completion</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-3" />
          </div>
        </div>

        <div className="space-y-4 md:grid md:gap-6 xl:grid-cols-[1.4fr_1fr] xl:space-y-0">
          <div className="space-y-6">
            <Card className={`${activeTab === "calendar" ? "block" : "hidden"} rounded-[28px] border-slate-200 shadow-sm md:block`}>
              <CardHeader className="pb-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-lg text-slate-900 md:text-xl">Calendar</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => moveMonth(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => moveMonth(1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-center text-xl font-semibold text-slate-900 md:text-lg">
                    {monthNames[visibleMonth.month]} {visibleMonth.year}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-slate-500 md:gap-2 md:text-sm">
                  {dayNames.map((day) => (
                    <div key={day} className="py-2">{day}</div>
                  ))}
                </div>
                <div className="mt-2 space-y-1.5 md:space-y-2">
                  {weeks.map((week, i) => (
                    <div key={i} className="grid grid-cols-7 gap-1.5 md:gap-2">
                      {week.map((date) => {
                        const key = toKey(date);
                        const isCurrentMonth = date.getMonth() === visibleMonth.month;
                        const plan = plans[key];
                        return (
                          <button
                            key={key}
                            onClick={() => plan && setSelectedDate(key)}
                            className={`min-h-[82px] rounded-2xl border border-slate-200 p-2 text-left transition md:min-h-[108px] md:p-3 ${cellStyle(key, isCurrentMonth)} ${!plan ? "cursor-default" : "cursor-pointer"}`}
                          >
                            <div className={`text-xs font-semibold md:text-sm ${isCurrentMonth ? "text-slate-900" : "text-slate-400"}`}>{date.getDate()}</div>
                            {plan && (
                              <div className="mt-2 space-y-1 md:mt-3 md:space-y-2">
                                <Badge variant="secondary" className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-700 md:text-xs">
                                  {plan.status.type === "work" ? "Work" : plan.status.type === "off" ? "Off" : plan.status.type === "wedding" ? "Wedding" : plan.status.type === "holiday" ? "Holiday" : plan.status.type === "tbd" ? "TBD" : "Unset"}
                                </Badge>
                                <div className="text-[10px] leading-tight text-slate-600 md:text-xs">{plan.steps} steps</div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={`${activeTab === "food" ? "block" : "hidden"} rounded-[28px] border-slate-200 shadow-sm md:block`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-slate-900"><Apple className="h-5 w-5 text-sky-700" /> Food rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {foodPrinciples.map((item, index) => (
                    <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
                      <span className="font-semibold text-slate-900">{index + 1}. </span>{item}
                    </div>
                  ))}
                </div>
                <div className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
                  <h3 className="text-base font-semibold text-slate-900">Shopping list</h3>
                  <div className="mt-4 space-y-2">
                    {shoppingSuggestions.map((item) => (
                      <div key={item} className="rounded-xl bg-white p-3 text-sm text-slate-700 ring-1 ring-slate-200">{item}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={`${activeTab === "day" ? "block" : "hidden"} rounded-[28px] border-slate-200 shadow-sm md:sticky md:top-6 md:block`}>
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 md:text-xl">Selected day</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="text-sm text-slate-500">Date</div>
                  <div className="mt-1 text-xl font-semibold leading-tight text-slate-900 md:text-2xl">
                    {selectedDateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">{selectedPlan.status.label}</Badge>
                    <Badge variant="outline" className="rounded-full">15k step target</Badge>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium text-slate-700">Day type</div>
                  <div className="flex gap-2">
                    <Button variant={selectedPlan.status.type === "off" ? "default" : "outline"} className="rounded-full" onClick={() => updateStatus("off")}>Off work</Button>
                    <Button variant={selectedPlan.status.type === "work" ? "default" : "outline"} className="rounded-full" onClick={() => updateStatus("work")}>Working day</Button>
                    <Button variant={selectedPlan.status.type === "wedding" ? "default" : "outline"} className="rounded-full" onClick={() => updateStatus("wedding")}>Wedding day</Button>
                    <Button variant={selectedPlan.status.type === "holiday" ? "default" : "outline"} className="rounded-full" onClick={() => updateStatus("holiday")}>Eri holiday</Button>
                    <Button variant={selectedPlan.status.type === "tbd" ? "default" : "outline"} className="rounded-full" onClick={() => updateStatus("tbd")}>TBD</Button>
                    <Button variant={selectedPlan.status.type === "unknown" ? "default" : "outline"} className="rounded-full" onClick={() => updateStatus("unknown")}>Unset</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Workout plan for the day</label>
                    <Textarea value={selectedPlan.workout} onChange={(e) => updatePlan("workout", e.target.value)} className="min-h-[120px] rounded-2xl" placeholder="Write the full workout for this day here. For example: 30 min incline walk + push session + stretching" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Diet focus for the day</label>
                    <Textarea value={selectedPlan.foodFocus} onChange={(e) => updatePlan("foodFocus", e.target.value)} className="min-h-[96px] rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Step goal</label>
                      <Input value={selectedPlan.steps} onChange={(e) => updatePlan("steps", e.target.value)} className="rounded-2xl" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Water target</label>
                      <Input value={selectedPlan.water} onChange={(e) => updatePlan("water", e.target.value)} className="rounded-2xl" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                    <Textarea value={selectedPlan.notes} onChange={(e) => updatePlan("notes", e.target.value)} className="min-h-[110px] rounded-2xl" placeholder="Add anything useful for this day" />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700"><Dumbbell className="h-4 w-4" /> Daily checklist</div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div>• Hit step target</div>
                    <div>• Follow protein-first meals</div>
                    <div>• Stay within plan and avoid random snacking</div>
                    <div>• Drink full water target</div>
                  </div>
                  <Button className="mt-4 w-full rounded-2xl" variant={selectedPlan.complete ? "secondary" : "default"} onClick={() => updatePlan("complete", !selectedPlan.complete)}>
                    {selectedPlan.complete ? "Marked complete" : "Mark day complete"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`${activeTab === "progress" ? "block" : "hidden"} rounded-[28px] border-slate-200 shadow-sm md:block`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-slate-900"><Scale className="h-5 w-5 text-sky-700" /> Weekly weigh-ins</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklyWeighIns.map((dateKey, index) => {
                  const value = weighIns[dateKey];
                  const current = parseFloat(value);
                  const previousKey = index > 0 ? weeklyWeighIns[index - 1] : null;
                  const previous = previousKey ? parseFloat(weighIns[previousKey]) : NaN;
                  const hasComparison = Number.isFinite(current) && Number.isFinite(previous);
                  const trendClass = !hasComparison
                    ? "bg-slate-50 ring-slate-200"
                    : current < previous
                    ? "bg-emerald-50 ring-emerald-200"
                    : current > previous
                    ? "bg-rose-50 ring-rose-200"
                    : "bg-amber-50 ring-amber-200";

                  return (
                    <div key={dateKey} className={`flex items-center justify-between rounded-2xl p-4 ring-1 ${trendClass}`}>
                      <div>
                        <div className="font-medium text-slate-900">{parseLocalDate(dateKey).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</div>
                        <div className="text-sm text-slate-500">
                          {index === 0 ? "Starting weigh-in" : hasComparison ? current < previous ? "Weight down" : current > previous ? "Weight up" : "No change" : "Weekly check-in"}
                        </div>
                      </div>
                      <Input
                        placeholder="kg"
                        value={value}
                        onChange={(e) => setWeighIns((prev) => ({ ...prev, [dateKey]: e.target.value }))}
                        className="w-24 rounded-2xl bg-white"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className={`${activeTab === "progress" ? "block" : "hidden"} rounded-[28px] border-slate-200 shadow-sm md:block`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-slate-900"><Quote className="h-5 w-5 text-sky-700" /> Motivation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {motivationalQuotes.map((quote) => (
                  <div key={quote} className="rounded-2xl bg-sky-50 p-4 text-sm text-slate-700 ring-1 ring-sky-100">{quote}</div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
              <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
            <Button variant={activeTab === "calendar" ? "default" : "outline"} className="rounded-2xl text-xs" onClick={() => setActiveTab("calendar")}>Calendar</Button>
            <Button variant={activeTab === "day" ? "default" : "outline"} className="rounded-2xl text-xs" onClick={() => setActiveTab("day")}>Day</Button>
            <Button variant={activeTab === "food" ? "default" : "outline"} className="rounded-2xl text-xs" onClick={() => setActiveTab("food")}>Food</Button>
            <Button variant={activeTab === "progress" ? "default" : "outline"} className="rounded-2xl text-xs" onClick={() => setActiveTab("progress")}>Progress</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
