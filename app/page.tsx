"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type TaskContext = "Work" | "Personal";

interface Task {
  id: string;
  title: string;
  context: TaskContext;
  energy: "Deep" | "Light" | "Admin";
  due?: string;
  completed: boolean;
}

interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location?: string;
}

interface Habit {
  id: string;
  label: string;
  completed: boolean;
}

interface DashboardState {
  focus: string;
  tasks: Task[];
  events: ScheduleEvent[];
  habits: Habit[];
  note: string;
  water: number;
  sleep: number;
  mood: string;
}

const STORAGE_KEY = "dayflow-dashboard-state";

const createId = () => Math.random().toString(36).slice(2, 10);

const initialState: DashboardState = {
  focus: "Shape the day with clarity",
  note: "",
  mood: "Grounded",
  water: 5,
  sleep: 7,
  tasks: [
    {
      id: createId(),
      title: "Deep work: strategy outline",
      context: "Work",
      energy: "Deep",
      due: "09:30",
      completed: false
    },
    {
      id: createId(),
      title: "Inbox zero + weekly update",
      context: "Work",
      energy: "Admin",
      due: "11:30",
      completed: false
    },
    {
      id: createId(),
      title: "Walk + podcast episode",
      context: "Personal",
      energy: "Light",
      due: "13:00",
      completed: true
    },
    {
      id: createId(),
      title: "Prep dinner ingredients",
      context: "Personal",
      energy: "Light",
      due: "18:00",
      completed: false
    }
  ],
  events: [
    {
      id: createId(),
      title: "Stand-up with product",
      time: "09:00",
      location: "Zoom"
    },
    {
      id: createId(),
      title: "Deep focus block",
      time: "10:00",
      location: "Studio"
    },
    {
      id: createId(),
      title: "Dinner with Sam",
      time: "19:00",
      location: "Maison"
    }
  ],
  habits: [
    {
      id: createId(),
      label: "Morning reset",
      completed: true
    },
    {
      id: createId(),
      label: "Movement break",
      completed: false
    },
    {
      id: createId(),
      label: "Digital sunset",
      completed: false
    }
  ]
};

const moodPalette = ["Grounded", "Curious", "Energized", "Rested", "Playful"] as const;

export default function Home() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    context: "Work" as TaskContext,
    energy: "Deep" as Task["energy"],
    due: ""
  });
  const [eventDraft, setEventDraft] = useState({ title: "", time: "", location: "" });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DashboardState;
        setState({
          ...initialState,
          ...parsed,
          tasks: parsed.tasks?.length ? parsed.tasks : initialState.tasks,
          habits: parsed.habits?.length ? parsed.habits : initialState.habits,
          events: parsed.events?.length ? parsed.events : initialState.events
        });
      } catch (error) {
        console.warn("Failed to parse saved state", error);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        weekday: "long",
        month: "long",
        day: "numeric"
      }).format(new Date()),
    []
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  }, []);

  const tasksCompleted = state.tasks.filter((task) => task.completed).length;
  const taskCompletion = state.tasks.length
    ? Math.round((tasksCompleted / state.tasks.length) * 100)
    : 0;

  const habitsCompleted = state.habits.filter((habit) => habit.completed).length;
  const hydrationPercent = Math.min(100, Math.round((state.water / 8) * 100));

  const tasksByContext = useMemo(
    () =>
      state.tasks.reduce<Record<TaskContext, Task[]>>(
        (acc, task) => {
          acc[task.context].push(task);
          return acc;
        },
        { Work: [], Personal: [] }
      ),
    [state.tasks]
  );

  const handleFocusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, focus: event.target.value }));
  };

  const toggleTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const toggleHabit = (id: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    }));
  };

  const handleMoodSelect = (mood: string) => {
    setState((prev) => ({ ...prev, mood }));
  };

  const handleTaskDraftChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setTaskDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskDraft.title.trim()) {
      return;
    }
    setState((prev) => ({
      ...prev,
      tasks: [
        {
          id: createId(),
          title: taskDraft.title.trim(),
          context: taskDraft.context,
          energy: taskDraft.energy,
          due: taskDraft.due || undefined,
          completed: false
        },
        ...prev.tasks
      ]
    }));
    setTaskDraft({
      title: "",
      context: taskDraft.context,
      energy: taskDraft.energy,
      due: ""
    });
  };

  const handleEventDraftChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setEventDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!eventDraft.title.trim() || !eventDraft.time.trim()) {
      return;
    }
    setState((prev) => ({
      ...prev,
      events: [...prev.events, { ...eventDraft, id: createId(), title: eventDraft.title.trim() }]
    }));
    setEventDraft({ title: "", time: "", location: eventDraft.location });
  };

  const handleNoteChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({ ...prev, note: event.target.value }));
  };

  const handleWaterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, water: Number(event.target.value) }));
  };

  const handleSleepChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, sleep: Number(event.target.value) }));
  };

  return (
    <main>
      <header className="card" style={{ padding: "32px" }}>
        <div className="label">Today · {todayLabel}</div>
        <h1 style={{ fontSize: "2.1rem", letterSpacing: "-0.02em", marginTop: "12px" }}>
          Good {greeting}, keep the day light and intentional.
        </h1>
        <div className="flex-row" style={{ marginTop: "24px", flexWrap: "wrap" }}>
          <div className="badge">Mood: {state.mood}</div>
          <div className="badge">Flow: {taskCompletion}% tasks</div>
          <div className="badge">Hydration: {hydrationPercent}%</div>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="card">
          <h2>
            Daily Focus
            <span className="badge">Single priority</span>
          </h2>
          <input
            className="input"
            placeholder="What anchors today?"
            value={state.focus}
            onChange={handleFocusChange}
          />
          <div className="surface-muted">
            <div className="label">Quiet reminder</div>
            <p style={{ marginTop: "12px", lineHeight: 1.5, color: "var(--text-muted)" }}>
              Protect a 90-minute block and move distractions to a later window.
            </p>
          </div>
          <div>
            <div className="label">Mood palette</div>
            <div className="flex-row" style={{ flexWrap: "wrap", marginTop: "16px" }}>
              {moodPalette.map((moodOption) => (
                <button
                  key={moodOption}
                  type="button"
                  className="badge"
                  style={{
                    cursor: "pointer",
                    background:
                      state.mood === moodOption
                        ? "var(--accent)"
                        : "var(--accent-soft)",
                    color: state.mood === moodOption ? "#fff" : "var(--text-muted)",
                    border: "none"
                  }}
                  onClick={() => handleMoodSelect(moodOption)}
                >
                  {moodOption}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <h2>
            Task Canvas
            <span className="badge">{tasksCompleted}/{state.tasks.length} done</span>
          </h2>
          <div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${taskCompletion}%` }} />
            </div>
          </div>
          <form onSubmit={handleAddTask} className="surface-muted" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="label">Add task</div>
            <input
              className="input"
              name="title"
              placeholder="Task title"
              value={taskDraft.title}
              onChange={handleTaskDraftChange}
            />
            <div className="flex-row" style={{ gap: "10px" }}>
              <select
                className="input"
                name="context"
                value={taskDraft.context}
                onChange={handleTaskDraftChange}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
              </select>
              <select
                className="input"
                name="energy"
                value={taskDraft.energy}
                onChange={handleTaskDraftChange}
              >
                <option value="Deep">Deep</option>
                <option value="Light">Light</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                className="input"
                style={{ minWidth: "96px" }}
                type="time"
                name="due"
                value={taskDraft.due}
                onChange={handleTaskDraftChange}
              />
            </div>
            <button className="primary" type="submit">
              Capture task
            </button>
          </form>
          {(["Work", "Personal"] as TaskContext[]).map((context) => (
            <div key={context}>
              <div className="label" style={{ marginBottom: "12px" }}>
                {context}
              </div>
              <ul>
                {tasksByContext[context].map((task) => (
                  <li key={task.id} className={`task-item${task.completed ? " completed" : ""}`}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <div className="task-details">
                      <span style={{ fontWeight: 600 }}>{task.title}</span>
                      <span>
                        {task.energy} energy
                        {task.due ? ` · ${task.due}` : ""}
                      </span>
                    </div>
                  </li>
                ))}
                {tasksByContext[context].length === 0 && (
                  <li style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Empty for now — leave it light.
                  </li>
                )}
              </ul>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>
            Rhythm Board
            <span className="badge">{state.events.length} blocks</span>
          </h2>
          <ul>
            {state.events.map((eventItem) => (
              <li key={eventItem.id} className="task-item" style={{ background: "rgba(17, 24, 39, 0.04)" }}>
                <div style={{ fontWeight: 600, minWidth: "60px" }}>{eventItem.time}</div>
                <div className="task-details">
                  <span style={{ fontWeight: 600 }}>{eventItem.title}</span>
                  <span>{eventItem.location || ""}</span>
                </div>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddEvent} className="surface-muted" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="label">Plan another block</div>
            <input
              className="input"
              name="title"
              placeholder="Activity"
              value={eventDraft.title}
              onChange={handleEventDraftChange}
            />
            <div className="flex-row" style={{ gap: "12px" }}>
              <input
                className="input"
                type="time"
                name="time"
                value={eventDraft.time}
                onChange={handleEventDraftChange}
                style={{ minWidth: "96px" }}
              />
              <input
                className="input"
                name="location"
                placeholder="Where"
                value={eventDraft.location}
                onChange={handleEventDraftChange}
              />
            </div>
            <button className="primary" type="submit">
              Save block
            </button>
          </form>
        </section>

        <section className="card">
          <h2>
            Energy & Care
            <span className="badge">{habitsCompleted}/{state.habits.length} rituals</span>
          </h2>
          <div className="surface-muted" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div className="flex-between">
                <span className="label">Water</span>
                <span>{state.water} / 8 cups</span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={1}
                value={state.water}
                onChange={handleWaterChange}
                style={{ width: "100%", marginTop: "12px" }}
              />
            </div>
            <div>
              <div className="flex-between">
                <span className="label">Sleep (hrs)</span>
                <span>{state.sleep.toFixed(1)} hrs</span>
              </div>
              <input
                type="range"
                min={5}
                max={9}
                step={0.5}
                value={state.sleep}
                onChange={handleSleepChange}
                style={{ width: "100%", marginTop: "12px" }}
              />
            </div>
          </div>
          <ul>
            {state.habits.map((habit) => (
              <li key={habit.id} className="task-item" style={{ justifyContent: "space-between" }}>
                <div>{habit.label}</div>
                <button
                  type="button"
                  className="ghost"
                  style={{
                    border: habit.completed ? "1px solid rgba(13, 148, 136, 0.4)" : "1px solid var(--border)",
                    background: habit.completed ? "rgba(13, 148, 136, 0.1)" : "transparent",
                    padding: "8px 14px",
                    borderRadius: "12px",
                    color: habit.completed ? "var(--success)" : "var(--text-muted)"
                  }}
                  onClick={() => toggleHabit(habit.id)}
                >
                  {habit.completed ? "Complete" : "Mark"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>
            Notes & Reflection
            <span className="badge">Capture tone</span>
          </h2>
          <textarea
            className="note-area"
            placeholder="Quick reflections, highlights, or reminders..."
            value={state.note}
            onChange={handleNoteChange}
          />
          <div className="surface-muted">
            <div className="label">Prompt</div>
            <p style={{ marginTop: "12px", lineHeight: 1.6, color: "var(--text-muted)" }}>
              What felt energizing today? What can wait until tomorrow without stress?
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
