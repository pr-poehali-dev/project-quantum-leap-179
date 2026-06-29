import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MagneticButton } from "@/components/magnetic-button"
import Icon from "@/components/ui/icon"
import { getEventsForDate, getYearsAgo, type HistoryEvent } from "@/lib/history-events"
import { useRef, useEffect, useState, useMemo } from "react"

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]
const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
]
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

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

export default function Index() {
  const [isLoaded, setIsLoaded] = useState(false)
  const shaderContainerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()))

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }
    if (checkShaderReady()) return
    const intervalId = setInterval(() => {
      if (checkShaderReady()) clearInterval(intervalId)
    }, 100)
    const fallbackTimer = setTimeout(() => setIsLoaded(true), 1500)
    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const events: HistoryEvent[] = useMemo(() => getEventsForDate(selectedDate), [selectedDate])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // Пн = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [viewYear, viewMonth])

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setViewMonth(m)
    setViewYear(y)
  }

  const selectDay = (day: number) => {
    setSelectedDate(new Date(viewYear, viewMonth, day))
  }

  const isSelected = (day: number) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear

  const eventsRef = useRef<HTMLDivElement>(null)
  const scrollToEvents = () => eventsRef.current?.scrollIntoView({ behavior: "smooth" })

  return (
    <main className="relative min-h-screen w-full bg-background">
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
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
        <MagneticButton variant="secondary" onClick={scrollToEvents}>
          Смотреть события
        </MagneticButton>
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
          <MagneticButton size="lg" variant="primary" onClick={scrollToEvents}>
            Открыть календарь
          </MagneticButton>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Icon name="ChevronDown" size={28} className="animate-bounce text-foreground/70" />
          </div>
        </section>

        {/* Календарь + события */}
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
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center font-mono text-xs text-foreground/50">{w}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <div key={i} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => selectDay(day)}
                      className={`flex h-full w-full items-center justify-center rounded-xl text-sm transition-all ${
                        isSelected(day)
                          ? "bg-foreground font-semibold text-background"
                          : isToday(day)
                            ? "bg-foreground/15 font-medium text-foreground ring-1 ring-foreground/30"
                            : "text-foreground/80 hover:bg-foreground/10"
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Лента событий */}
          <div>
            <div className="mb-6">
              <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">События дня</p>
              <h2 className="mt-1 font-sans text-3xl font-light text-foreground md:text-4xl">
                {selectedDate.getDate()} {MONTHS_GEN[selectedDate.getMonth()]}
              </h2>
              <p className="mt-1 text-sm text-foreground/70">{events.length} событий из истории</p>
            </div>

            <div className="space-y-3">
              {events.map((ev, i) => (
                <div
                  key={i}
                  className="group flex gap-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-5 backdrop-blur-xl transition-all hover:border-foreground/25 hover:bg-foreground/10"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ev.isRussia ? "bg-[#e19136]/20 text-[#f0b878]" : "bg-[#1275d8]/20 text-[#7db8f0]"}`}>
                    <Icon name={CATEGORY_ICONS[ev.category] || "Sparkles"} fallback="Sparkles" size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-sans text-lg font-semibold text-foreground">{ev.year}</span>
                      <span className="font-mono text-xs text-foreground/50">{getYearsAgo(ev.year)}</span>
                      <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-foreground/70">{ev.category}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{ev.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-foreground/10 px-6 py-8 text-center md:px-12">
          <p className="font-mono text-xs text-foreground/50">Этот день в истории · машина времени в вашем кармане</p>
        </footer>
      </div>
    </main>
  )
}
