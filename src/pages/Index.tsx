import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import Icon from "@/components/ui/icon"
import { getEventsForDate, getYearsAgo, type HistoryEvent } from "@/lib/history-events"
import { useRef, useEffect, useState, useMemo } from "react"

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]
const MONTHS_GEN = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]
const WEEKDAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"]

const CATEGORY_ICONS: Record<string, string> = {
  Россия: "Star",
  Космос: "Rocket",
  Наука: "FlaskConical",
  Культура: "Palette",
  Спорт: "Trophy",
  Образование: "GraduationCap",
  Технологии: "Cpu",
  Экономика: "TrendingUp",
  Природа: "Leaf",
  Мир: "Globe",
}

type Filter = "all" | "russia" | "world"

export default function Index() {
  const [isLoaded, setIsLoaded] = useState(false)
  const shaderContainerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
  const [filter, setFilter] = useState<Filter>("all")
  const [activeEvent, setActiveEvent] = useState<HistoryEvent | null>(null)

  useEffect(() => {
    const check = () => {
      if (shaderContainerRef.current) {
        const c = shaderContainerRef.current.querySelector("canvas")
        if (c && c.width > 0) { setIsLoaded(true); return true }
      }
      return false
    }
    if (check()) return
    const iv = setInterval(() => { if (check()) clearInterval(iv) }, 100)
    const fb = setTimeout(() => setIsLoaded(true), 1500)
    return () => { clearInterval(iv); clearTimeout(fb) }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveEvent(null) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const allEvents: HistoryEvent[] = useMemo(() => getEventsForDate(selectedDate), [selectedDate])
  const events = useMemo(() => {
    if (filter === "russia") return allEvents.filter((e) => e.isRussia)
    if (filter === "world") return allEvents.filter((e) => !e.isRussia)
    return allEvents
  }, [allEvents, filter])

  const calendarDays = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const offset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: (number | null)[] = []
    for (let i = 0; i < offset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [viewYear, viewMonth])

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta, y = viewYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setViewMonth(m); setViewYear(y)
  }

  const selectDay = (day: number) => setSelectedDate(new Date(viewYear, viewMonth, day))
  const isSelected = (day: number) => selectedDate.getDate() === day && selectedDate.getMonth() === viewMonth && selectedDate.getFullYear() === viewYear
  const isToday = (day: number) => today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear

  const eventsRef = useRef<HTMLDivElement>(null)
  const scrollToEvents = () => eventsRef.current?.scrollIntoView({ behavior: "smooth" })

  const russiaCount = allEvents.filter((e) => e.isRussia).length
  const worldCount = allEvents.filter((e) => !e.isRussia).length

  return (
    <main className="relative min-h-screen w-full bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div ref={shaderContainerRef} className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ contain: "strict" }}>
        <Shader className="h-full w-full">
          <Swirl colorA="#1275d8" colorB="#e19136" speed={0.8} detail={0.8} blend={50} coarseX={40} coarseY={40} mediumX={40} mediumY={40} fineX={40} fineY={40} />
          <ChromaFlow baseColor="#0066ff" upColor="#0066ff" downColor="#d1d1d1" leftColor="#e19136" rightColor="#e19136" intensity={0.9} radius={1.8} momentum={25} maskType="alpha" opacity={0.97} />
        </Shader>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Навигация */}
      <nav className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/15 backdrop-blur-md">
            <Icon name="CalendarDays" size={22} className="text-foreground" />
          </div>
          <span className="font-sans text-xl font-semibold tracking-tight text-foreground">Этот день в истории</span>
        </div>
        <MagneticButton variant="secondary" onClick={scrollToEvents}>Смотреть события</MagneticButton>
      </nav>

      <div className={`relative z-10 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        {/* Hero */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center md:px-12">
          <div className="mb-5 inline-block rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md">
            <p className="font-mono text-xs text-foreground/90">Машина времени в вашем кармане</p>
          </div>
          <h1 className="mb-6 max-w-4xl font-sans text-5xl font-light leading-[1.1] tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Что случилось <span className="font-normal">в этот день</span> много лет назад
          </h1>
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-foreground/90 md:text-xl">
            Выберите любую дату в календаре — и узнайте о ярких событиях прошлого. Каждый день хранит свою историю.
          </p>
          <MagneticButton size="lg" variant="primary" onClick={scrollToEvents}>Открыть календарь</MagneticButton>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Icon name="ChevronDown" size={28} className="animate-bounce text-foreground/70" />
          </div>
        </section>

        {/* Основной контент */}
        <section ref={eventsRef} className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 pt-12 md:px-12 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Календарь */}
          <div className="h-fit rounded-3xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-xl lg:sticky lg:top-28">
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => changeMonth(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20">
                <Icon name="ChevronLeft" size={18} />
              </button>
              <div className="text-center">
                <p className="font-sans text-lg font-semibold text-foreground">{MONTHS[viewMonth]}</p>
                <p className="font-mono text-xs text-foreground/60">{viewYear}</p>
              </div>
              <button onClick={() => changeMonth(1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20">
                <Icon name="ChevronRight" size={18} />
              </button>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => <div key={w} className="text-center font-mono text-xs text-foreground/50">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <div key={i} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => selectDay(day)}
                      className={`flex h-full w-full items-center justify-center rounded-xl text-sm transition-all ${isSelected(day) ? "bg-foreground font-semibold text-background" : isToday(day) ? "bg-foreground/15 font-medium text-foreground ring-1 ring-foreground/30" : "text-foreground/80 hover:bg-foreground/10"}`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate())) }}
              className="mt-4 w-full rounded-xl border border-foreground/10 bg-foreground/5 py-2 text-sm text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              Сегодня
            </button>
          </div>

          {/* Лента событий */}
          <div>
            <div className="mb-5">
              <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">События дня</p>
              <h2 className="mt-1 font-sans text-3xl font-light text-foreground md:text-4xl">
                {selectedDate.getDate()} {MONTHS_GEN[selectedDate.getMonth()]}
              </h2>
              <p className="mt-1 text-sm text-foreground/70">{allEvents.length} событий из истории</p>
            </div>

            {/* Фильтр */}
            <div className="mb-6 flex flex-wrap gap-2">
              {([
                { key: "all", label: `Все (${allEvents.length})` },
                { key: "russia", label: `🇷🇺 Россия (${russiaCount})` },
                { key: "world", label: `🌍 Мир (${worldCount})` },
              ] as { key: Filter; label: string }[]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${filter === f.key ? "border-foreground/50 bg-foreground/20 text-foreground" : "border-foreground/10 bg-foreground/5 text-foreground/60 hover:border-foreground/25 hover:text-foreground/90"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Карточки событий */}
            <div className="space-y-3">
              {events.length === 0 && (
                <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-8 text-center text-foreground/50 backdrop-blur-xl">
                  Нет событий по выбранному фильтру
                </div>
              )}
              {events.map((ev, i) => (
                <button
                  key={i}
                  onClick={() => setActiveEvent(ev)}
                  className="group flex w-full gap-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-5 text-left backdrop-blur-xl transition-all hover:border-foreground/30 hover:bg-foreground/10 active:scale-[0.99]"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${ev.isRussia ? "bg-[#e19136]/20 text-[#f0b878]" : "bg-[#1275d8]/20 text-[#7db8f0]"}`}>
                    <Icon name={CATEGORY_ICONS[ev.category] || "Sparkles"} fallback="Sparkles" size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-sans text-lg font-semibold text-foreground">{ev.year}</span>
                      <span className="font-mono text-xs text-foreground/50">{getYearsAgo(ev.year)}</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-foreground/70">{ev.category}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{ev.text}</p>
                  </div>
                  <div className="flex shrink-0 items-center text-foreground/30 transition-colors group-hover:text-foreground/70">
                    <Icon name="ChevronRight" size={18} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-foreground/10 px-6 py-8 text-center md:px-12">
          <p className="font-mono text-xs text-foreground/50">Этот день в истории · машина времени в вашем кармане</p>
        </footer>
      </div>

      {/* Модальное окно с подробностями */}
      {activeEvent && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 md:items-center" onClick={() => setActiveEvent(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg rounded-3xl border border-foreground/15 bg-background/80 p-7 backdrop-blur-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveEvent(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/20 hover:text-foreground"
            >
              <Icon name="X" size={16} />
            </button>

            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${activeEvent.isRussia ? "bg-[#e19136]/25 text-[#f0b878]" : "bg-[#1275d8]/25 text-[#7db8f0]"}`}>
              <Icon name={CATEGORY_ICONS[activeEvent.category] || "Sparkles"} fallback="Sparkles" size={24} />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-sans text-3xl font-bold text-foreground">{activeEvent.year}</span>
              <span className="font-mono text-sm text-foreground/50">{getYearsAgo(activeEvent.year)}</span>
              <span className="rounded-full bg-foreground/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-foreground/70">{activeEvent.category}</span>
            </div>

            <h3 className="mb-4 font-sans text-lg font-semibold leading-snug text-foreground">{activeEvent.text}</h3>
            <p className="text-sm leading-relaxed text-foreground/80">{activeEvent.detail}</p>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-foreground/5 px-4 py-3">
              <Icon name={activeEvent.isRussia ? "Star" : "Globe"} size={16} className={activeEvent.isRussia ? "text-[#f0b878]" : "text-[#7db8f0]"} />
              <span className="text-xs text-foreground/60">
                {activeEvent.isRussia ? "Событие из истории России" : "Мировое историческое событие"}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
