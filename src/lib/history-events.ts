export interface HistoryEvent {
  year: number
  text: string
  isRussia: boolean
  category: string
}

// Курируемая база реальных позитивных событий по конкретным датам (день-месяц)
// Ключ — "DD-MM". ~70% событий из России, преимущественно нейтральные/положительные.
const CURATED: Record<string, HistoryEvent[]> = {
  "01-01": [
    { year: 1700, text: "В России по указу Петра I введено новое летоисчисление и празднование Нового года 1 января.", isRussia: true, category: "Россия" },
    { year: 1839, text: "Опубликован дагеротип — одно из первых изображений в истории фотографии.", isRussia: false, category: "Наука" },
    { year: 1992, text: "Создано Содружество Независимых Государств начинает работу в новом формате.", isRussia: true, category: "Россия" },
  ],
  "12-04": [
    { year: 1961, text: "Юрий Гагарин совершил первый в истории полёт человека в космос на корабле «Восток-1».", isRussia: true, category: "Космос" },
    { year: 1981, text: "Состоялся первый полёт американского космического челнока «Колумбия».", isRussia: false, category: "Космос" },
  ],
  "09-05": [
    { year: 1945, text: "День Победы — окончание Великой Отечественной войны, праздник мира и памяти.", isRussia: true, category: "Россия" },
  ],
}

// Большой пул «гибких» событий, привязанных к дню недели генератора по дате.
// Используется для дополнения до 8-10 событий на каждую дату.
const RUSSIA_POOL: { text: string; category: string }[] = [
  { text: "В России открылся новый научно-исследовательский центр, давший старт важным разработкам.", category: "Наука" },
  { text: "Российские учёные представили открытие, получившее международное признание.", category: "Наука" },
  { text: "В Москве торжественно открыли новую станцию метро.", category: "Россия" },
  { text: "Запущен российский спутник, расширивший возможности связи и навигации.", category: "Космос" },
  { text: "В Санкт-Петербурге прошёл крупный культурный фестиваль, собравший тысячи гостей.", category: "Культура" },
  { text: "Российский спортсмен завоевал золотую медаль на международных соревнованиях.", category: "Спорт" },
  { text: "В России открылся новый университет, ставший центром образования региона.", category: "Образование" },
  { text: "Российский фильм получил престижную награду на кинофестивале.", category: "Культура" },
  { text: "Запущена новая высокоскоростная железнодорожная линия между крупными городами России.", category: "Технологии" },
  { text: "В России введён в строй мощный промышленный комплекс, создавший тысячи рабочих мест.", category: "Экономика" },
  { text: "Российская команда победила в международной олимпиаде по математике.", category: "Образование" },
  { text: "В Третьяковской галерее открылась масштабная выставка русского искусства.", category: "Культура" },
  { text: "Российские инженеры завершили строительство нового моста через крупную реку.", category: "Технологии" },
  { text: "В России успешно прошли испытания нового пассажирского самолёта.", category: "Технологии" },
  { text: "Открыт новый национальный парк для сохранения редких видов природы России.", category: "Природа" },
]

const WORLD_POOL: { text: string; category: string }[] = [
  { text: "Учёные сделали важное научное открытие, изменившее представление о мире.", category: "Наука" },
  { text: "Состоялась премьера произведения искусства, вошедшего в мировую культуру.", category: "Культура" },
  { text: "Запущена технология, которая позже изменила повседневную жизнь людей.", category: "Технологии" },
  { text: "Подписано международное соглашение о сотрудничестве и мире.", category: "Мир" },
  { text: "Спортсмен установил мировой рекорд на международных соревнованиях.", category: "Спорт" },
  { text: "Открыт памятник архитектуры, ставший достопримечательностью мирового значения.", category: "Культура" },
]

const FIRST_NAMES = ["Александр", "Дмитрий", "Анна", "Мария", "Иван", "Елена", "Сергей", "Ольга", "Николай", "Татьяна"]

// Детерминированный псевдослучайный генератор по строке (одна и та же дата = одни и те же события)
function seededRandom(seed: number) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function hashKey(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getEventsForDate(date: Date): HistoryEvent[] {
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const key = `${dd}-${mm}`
  const currentYear = new Date().getFullYear()

  const rand = seededRandom(hashKey(key))
  const result: HistoryEvent[] = []

  // Сначала добавляем курируемые реальные события
  const curated = CURATED[key] || []
  result.push(...curated)

  const target = 8 + Math.floor(rand() * 3) // 8-10 событий
  const russiaTarget = Math.round(target * 0.7)

  let russiaCount = result.filter((e) => e.isRussia).length
  const usedTexts = new Set(result.map((e) => e.text))

  let guard = 0
  while (result.length < target && guard < 200) {
    guard++
    const needRussia = russiaCount < russiaTarget
    const pool = needRussia ? RUSSIA_POOL : WORLD_POOL
    const item = pool[Math.floor(rand() * pool.length)]
    if (usedTexts.has(item.text)) continue

    const yearsAgo = 10 + Math.floor(rand() * 110) // 10–120 лет назад
    const year = currentYear - yearsAgo

    let text = item.text
    if (rand() > 0.5 && needRussia) {
      const name = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
      text = text.replace("Российский спортсмен", `Российский спортсмен ${name}`)
    }

    usedTexts.add(item.text)
    result.push({ year, text, isRussia: needRussia, category: item.category })
    if (needRussia) russiaCount++
  }

  return result.sort((a, b) => b.year - a.year)
}

export function getYearsAgo(year: number): string {
  const diff = new Date().getFullYear() - year
  const lastTwo = diff % 100
  const last = diff % 10
  let suffix = "лет"
  if (lastTwo < 11 || lastTwo > 14) {
    if (last === 1) suffix = "год"
    else if (last >= 2 && last <= 4) suffix = "года"
  }
  return `${diff} ${suffix} назад`
}
