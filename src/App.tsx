import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Download,
  FileText,
  Mail,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'

type Competitor = {
  name: string
  link: string
  likedStyle: string
  avoid: string
}

type BrandBrief = {
  companyBasics: {
    brandName: string
    links: string
    description: string
    category: string
    geography: string
    stage: string
  }
  brandEssence: {
    whatCompanyDoes: string
    problemSolved: string
    whyChoose: string
    brandWords: string[]
    promise: string
    desiredFeeling: string
  }
  targetAudience: {
    audience: string
    ageRange: string
    lifestyle: string
    needs: string
    fears: string
    choiceFactors: string
  }
  competitors: {
    items: Competitor[]
    admiredBrands: string
  }
  visualDirection: {
    logoType: string
    mood: Record<string, number>
    preferredColors: string
    forbiddenColors: string
    typography: string
    references: string
    uploadedReferences: string[]
    clichesToAvoid: string
  }
  practicalUsage: {
    placements: string[]
    darkLightVersions: string
    smallSizeReadability: string
    printReadyFiles: string
    futureAnimation: string
  }
  scopeAndDeliverables: {
    deliverables: string[]
    deadline: string
    budget: string
    decisionMakers: string
    comments: string
  }
}

type FieldErrors = Record<string, string>
type StepInfo = {
  id: string
  title: string
  shortTitle: string
  microcopy: string
}

const storageKey = 'brand-brief-questionnaire-draft'
const recipientEmail = 'v.demidov@urc.org.ua'

const initialBrief: BrandBrief = {
  companyBasics: {
    brandName: '',
    links: '',
    description: '',
    category: '',
    geography: '',
    stage: '',
  },
  brandEssence: {
    whatCompanyDoes: '',
    problemSolved: '',
    whyChoose: '',
    brandWords: [],
    promise: '',
    desiredFeeling: '',
  },
  targetAudience: {
    audience: '',
    ageRange: '',
    lifestyle: '',
    needs: '',
    fears: '',
    choiceFactors: '',
  },
  competitors: {
    items: [{ name: '', link: '', likedStyle: '', avoid: '' }],
    admiredBrands: '',
  },
  visualDirection: {
    logoType: '',
    mood: {
      minimalExpressive: 50,
      premiumAccessible: 50,
      seriousFriendly: 50,
      classicModern: 50,
      softSharp: 50,
      localInternational: 50,
    },
    preferredColors: '',
    forbiddenColors: '',
    typography: '',
    references: '',
    uploadedReferences: [],
    clichesToAvoid: '',
  },
  practicalUsage: {
    placements: [],
    darkLightVersions: '',
    smallSizeReadability: '',
    printReadyFiles: '',
    futureAnimation: '',
  },
  scopeAndDeliverables: {
    deliverables: [],
    deadline: '',
    budget: '',
    decisionMakers: '',
    comments: '',
  },
}

const steps: StepInfo[] = [
  {
    id: 'companyBasics',
    title: 'Основна інформація',
    shortTitle: 'Компанія',
    microcopy:
      'Це допомагає зрозуміти контекст бренду: хто ви, де працюєте і на якому етапі розвитку перебуваєте.',
  },
  {
    id: 'brandEssence',
    title: 'Суть бренду',
    shortTitle: 'Суть',
    microcopy:
      'Тут ми шукаємо не красиві слова, а ясну причину довіри: що бренд робить, для кого і чому це важливо.',
  },
  {
    id: 'targetAudience',
    title: 'Цільова аудиторія',
    shortTitle: 'Аудиторія',
    microcopy:
      'Візуальна мова має бути природною для людей, до яких звертається бренд.',
  },
  {
    id: 'competitors',
    title: 'Конкуренти та орієнтири',
    shortTitle: 'Конкуренти',
    microcopy:
      'Цей блок допомагає знайти простір для відмінності та уникнути візуальних повторів у категорії.',
  },
  {
    id: 'visualDirection',
    title: 'Візуальний напрям',
    shortTitle: 'Візуал',
    microcopy:
      'Не потрібно знати дизайн-терміни. Відповідайте інтуїтивно, а ми перекладемо це у візуальні рішення.',
  },
  {
    id: 'practicalUsage',
    title: 'Практичне використання',
    shortTitle: 'Використання',
    microcopy:
      'Логотип має працювати у реальних носіях: від аватарки до друку, презентацій чи пакування.',
  },
  {
    id: 'scopeAndDeliverables',
    title: 'Обсяг робіт',
    shortTitle: 'Обсяг',
    microcopy:
      'Це допомагає оцінити пріоритети, терміни та потрібний формат фінальних матеріалів.',
  },
]

const logoTypes = [
  'Текстовий логотип',
  'Знак + назва',
  'Монограма',
  'Абстрактний знак',
  'Емблема',
  'Не впевнений/не впевнена',
]

const typographyOptions = [
  'Геометрична',
  'Елегантна',
  'Смілива',
  'Гуманістична',
  'Технічна',
  'Не впевнений/не впевнена',
]

const usageOptions = [
  'Сайт',
  'Соціальні мережі',
  'Документи',
  'Презентації',
  'Пакування',
  'Вивіска',
  'Форма',
  'Мерч',
  'Іконка застосунку',
  'Стікери',
  'Інше',
]

const deliverableOptions = [
  'Тільки логотип',
  'Логотип + кольори + шрифти',
  'Повна візуальна ідентичність',
  'Брендбук / гайдлайн',
  'Шаблони для соцмереж',
  'Шаблон презентації',
  'Пакування',
  'Напрям для сайту',
]

const yesNoUnsure = ['Так', 'Ні', 'Не впевнений/не впевнена']

function updateNested<TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
  brief: BrandBrief,
  section: TSection,
  key: TKey,
  value: BrandBrief[TSection][TKey],
) {
  return {
    ...brief,
    [section]: {
      ...brief[section],
      [key]: value,
    },
  }
}

function App() {
  const [brief, setBrief] = useState<BrandBrief>(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return initialBrief

    try {
      return { ...initialBrief, ...JSON.parse(saved) } as BrandBrief
    } catch {
      return initialBrief
    }
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState('')
  const [isSending, setIsSending] = useState(false)

  const isSummary = currentStep === steps.length
  const progress = Math.round(((currentStep + 1) / (steps.length + 1)) * 100)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(brief))
  }, [brief])

  const setField = <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => {
    setBrief((current) => updateNested(current, section, key, value))
    setErrors((current) => {
      const next = { ...current }
      delete next[String(key)]
      return next
    })
  }

  const validateStep = () => {
    const nextErrors: FieldErrors = {}

    if (currentStep === 0) {
      if (!brief.companyBasics.brandName.trim()) nextErrors.brandName = 'Вкажіть назву бренду.'
      if (!brief.companyBasics.description.trim()) nextErrors.description = 'Коротко опишіть компанію.'
      if (!brief.companyBasics.stage) nextErrors.stage = 'Оберіть поточний етап.'
    }

    if (currentStep === 1) {
      if (!brief.brandEssence.whatCompanyDoes.trim()) {
        nextErrors.whatCompanyDoes = 'Опишіть, що робить компанія.'
      }
      if (!brief.brandEssence.whyChoose.trim()) {
        nextErrors.whyChoose = 'Додайте причину, чому клієнти мають обрати бренд.'
      }
    }

    if (currentStep === 2 && !brief.targetAudience.audience.trim()) {
      nextErrors.audience = 'Опишіть основну аудиторію.'
    }

    if (currentStep === 4 && !brief.visualDirection.logoType) {
      nextErrors.logoType = 'Оберіть тип логотипа або варіант “не впевнений/не впевнена”.'
    }

    if (currentStep === 5 && brief.practicalUsage.placements.length === 0) {
      nextErrors.placements = 'Оберіть хоча б один варіант використання.'
    }

    if (currentStep === 6) {
      if (brief.scopeAndDeliverables.deliverables.length === 0) {
        nextErrors.deliverables = 'Оберіть, що потрібно підготувати.'
      }
      if (!brief.scopeAndDeliverables.decisionMakers.trim()) {
        nextErrors.decisionMakers = 'Вкажіть, хто ухвалює рішення.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const goNext = () => {
    if (!isSummary && !validateStep()) return
    setCurrentStep((step) => Math.min(step + 1, steps.length))
    setStatus('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0))
    setStatus('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveDraft = () => {
    localStorage.setItem(storageKey, JSON.stringify(brief))
    setStatus('Чернетку збережено на цьому пристрої.')
  }

  const submitBrief = async () => {
    setIsSending(true)
    setStatus('')

    try {
      const response = await fetch('/api/send-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { message?: string } | null
        if (response.status === 404) {
          throw new Error('Локальний режим npm run dev не запускає поштову функцію. Для тесту відправки запустіть Vercel Dev або опублікуйте проект із SMTP-змінними.')
        }
        throw new Error(result?.message || 'Не вдалося надіслати бриф.')
      }

      console.log('Brand brief submitted', brief)
      setStatus(`Готово. Бриф надіслано на ${recipientEmail}.`)
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Не вдалося надіслати бриф. Перевірте налаштування пошти.',
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-[#23231f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="rounded-[28px] bg-[#22251f] px-5 py-6 text-white shadow-2xl shadow-black/10 sm:px-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-[#c8d2ad]">
                Бриф для логотипа та айдентики
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
                Анкета, яка допомагає побачити бренд ясно.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
                Відповідайте простою мовою. Ми зберемо контекст про те, хто бренд, до кого він
                звертається і чому аудиторія має йому довіряти.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/68">Прогрес</span>
                <span className="text-sm font-semibold text-[#d6e2b9]">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
              <p className="mt-4 text-sm leading-6 text-white/64">
                Чернетка автоматично зберігається в браузері. Фінальний бриф можна надіслати,
                скопіювати або завантажити.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[270px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <Stepper currentStep={currentStep} steps={steps} onStepClick={setCurrentStep} />
          </aside>

          <section className="min-w-0">
            {!isSummary ? (
              <SectionCard
                kicker={`Крок ${currentStep + 1} з ${steps.length}`}
                title={steps[currentStep].title}
                microcopy={steps[currentStep].microcopy}
              >
                {currentStep === 0 && (
                  <CompanyBasicsStep brief={brief} errors={errors} setField={setField} />
                )}
                {currentStep === 1 && (
                  <BrandEssenceStep brief={brief} errors={errors} setField={setField} />
                )}
                {currentStep === 2 && (
                  <TargetAudienceStep brief={brief} errors={errors} setField={setField} />
                )}
                {currentStep === 3 && (
                  <CompetitorsStep brief={brief} setField={setField} setBrief={setBrief} />
                )}
                {currentStep === 4 && (
                  <VisualDirectionStep brief={brief} errors={errors} setField={setField} />
                )}
                {currentStep === 5 && (
                  <PracticalUsageStep brief={brief} errors={errors} setField={setField} />
                )}
                {currentStep === 6 && (
                  <ScopeStep brief={brief} errors={errors} setField={setField} />
                )}
              </SectionCard>
            ) : (
              <SummaryPage
                brief={brief}
                isSending={isSending}
                onEditSection={setCurrentStep}
                onSubmit={submitBrief}
              />
            )}

            {status && (
              <p className="mt-4 rounded-2xl border border-[#d7dcc9] bg-white px-4 py-3 text-sm text-[#4b5543] shadow-sm">
                {status}
              </p>
            )}

            <nav className="mt-5 flex flex-col gap-3 rounded-3xl border border-[#dedbd0] bg-white/80 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d4c8] px-4 py-3 text-sm font-semibold text-[#3a3d35] transition hover:bg-[#f2f0e8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={18} />
                Назад
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d4c8] px-4 py-3 text-sm font-semibold text-[#3a3d35] transition hover:bg-[#f2f0e8]"
                >
                  <Save size={18} />
                  Зберегти чернетку
                </button>
                {!isSummary ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#30362b] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#30362b]/20 transition hover:bg-[#424b39]"
                  >
                    Далі
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitBrief}
                    disabled={isSending}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#30362b] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#30362b]/20 transition hover:bg-[#424b39] disabled:cursor-wait disabled:opacity-70"
                  >
                    <Send size={18} />
                    {isSending ? 'Надсилаємо...' : 'Надіслати бриф'}
                  </button>
                )}
              </div>
            </nav>
          </section>
        </div>
      </div>
    </main>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/14" aria-hidden="true">
      <div
        className="h-full rounded-full bg-[#c8d2ad] transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function Stepper({
  currentStep,
  steps: stepItems,
  onStepClick,
}: {
  currentStep: number
  steps: StepInfo[]
  onStepClick: (step: number) => void
}) {
  return (
    <div className="rounded-3xl border border-[#dedbd0] bg-white p-3 shadow-sm">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {stepItems.map((step, index) => {
          const isActive = currentStep === index
          const isDone = currentStep > index
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(index)}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                isActive
                  ? 'bg-[#30362b] text-white shadow-md'
                  : 'text-[#5f6259] hover:bg-[#f3f1ea]'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-white text-[#30362b]'
                    : isDone
                      ? 'bg-[#dfe8c7] text-[#30362b]'
                      : 'bg-[#eeebe1] text-[#6f7168]'
                }`}
              >
                {isDone ? <Check size={14} /> : index + 1}
              </span>
              <span className="min-w-0 truncate font-semibold">{step.shortTitle}</span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => onStepClick(stepItems.length)}
          className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
            currentStep === stepItems.length
              ? 'bg-[#30362b] text-white shadow-md'
              : 'text-[#5f6259] hover:bg-[#f3f1ea]'
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eeebe1] text-xs font-bold text-[#30362b]">
            <FileText size={14} />
          </span>
          <span className="min-w-0 truncate font-semibold">Підсумок</span>
        </button>
      </div>
    </div>
  )
}

function SectionCard({
  kicker,
  title,
  microcopy,
  children,
}: {
  kicker: string
  title: string
  microcopy: string
  children: ReactNode
}) {
  return (
    <article className="rounded-[28px] border border-[#dedbd0] bg-white p-5 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#66714f]">{kicker}</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#22251f] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66695f]">{microcopy}</p>
      <div className="mt-7 grid gap-5">{children}</div>
    </article>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  helper,
  error,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helper?: string
  error?: string
  type?: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#30332d]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`rounded-2xl border bg-[#fbfaf7] px-4 py-3 text-base text-[#22251f] outline-none transition placeholder:text-[#a19d92] focus:border-[#66714f] focus:bg-white focus:ring-4 focus:ring-[#dfe8c7] ${
          error ? 'border-red-300' : 'border-[#d8d4c8]'
        }`}
      />
      {helper && <span className="text-sm leading-5 text-[#777970]">{helper}</span>}
      {error && <span className="text-sm font-medium text-red-700">{error}</span>}
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  helper,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helper?: string
  error?: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#30332d]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className={`min-h-32 resize-y rounded-2xl border bg-[#fbfaf7] px-4 py-3 text-base leading-7 text-[#22251f] outline-none transition placeholder:text-[#a19d92] focus:border-[#66714f] focus:bg-white focus:ring-4 focus:ring-[#dfe8c7] ${
          error ? 'border-red-300' : 'border-[#d8d4c8]'
        }`}
      />
      {helper && <span className="text-sm leading-5 text-[#777970]">{helper}</span>}
      {error && <span className="text-sm font-medium text-red-700">{error}</span>}
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Оберіть варіант',
  helper,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  helper?: string
  error?: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#30332d]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`rounded-2xl border bg-[#fbfaf7] px-4 py-3 text-base text-[#22251f] outline-none transition focus:border-[#66714f] focus:bg-white focus:ring-4 focus:ring-[#dfe8c7] ${
          error ? 'border-red-300' : 'border-[#d8d4c8]'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helper && <span className="text-sm leading-5 text-[#777970]">{helper}</span>}
      {error && <span className="text-sm font-medium text-red-700">{error}</span>}
    </label>
  )
}

function MultiSelect({
  label,
  values,
  options,
  onChange,
  helper,
  error,
}: {
  label: string
  values: string[]
  options: string[]
  onChange: (values: string[]) => void
  helper?: string
  error?: string
}) {
  const toggle = (option: string) => {
    onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option])
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-[#30332d]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? 'border-[#30362b] bg-[#30362b] text-white'
                  : 'border-[#d8d4c8] bg-[#fbfaf7] text-[#4f524a] hover:bg-[#f1efe7]'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      {helper && <span className="text-sm leading-5 text-[#777970]">{helper}</span>}
      {error && <span className="text-sm font-medium text-red-700">{error}</span>}
    </div>
  )
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
  helper,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  helper?: string
}) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const tags = draft
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
    if (!tags.length) return
    onChange(Array.from(new Set([...values, ...tags])).slice(0, 5))
    setDraft('')
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-[#30332d]">{label}</span>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={addTag}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-2xl border border-[#d8d4c8] bg-[#fbfaf7] px-4 py-3 text-base outline-none transition placeholder:text-[#a19d92] focus:border-[#66714f] focus:bg-white focus:ring-4 focus:ring-[#dfe8c7]"
        />
        <button
          type="button"
          onClick={addTag}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#30362b] text-white"
          aria-label="Додати слово"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(values.filter((value) => value !== tag))}
            className="rounded-full bg-[#dfe8c7] px-3 py-1 text-sm font-semibold text-[#30362b]"
          >
            {tag}
          </button>
        ))}
      </div>
      {helper && <span className="text-sm leading-5 text-[#777970]">{helper}</span>}
    </div>
  )
}

function MoodSlider({
  labelLeft,
  labelRight,
  value,
  onChange,
}: {
  labelLeft: string
  labelRight: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="grid gap-3 rounded-2xl border border-[#e3dfd3] bg-[#fbfaf7] p-4">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#3f4438]">
        <span>{labelLeft}</span>
        <span>{labelRight}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-[#30362b]"
      />
    </label>
  )
}

function FileUpload({
  files,
  onChange,
}: {
  files: string[]
  onChange: (files: string[]) => void
}) {
  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []).map((file) => file.name)
    onChange(Array.from(new Set([...files, ...selected])))
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-[#30332d]">Візуальні референси</span>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#b9b7aa] bg-[#fbfaf7] px-4 py-8 text-center transition hover:bg-[#f1efe7]">
        <Upload size={22} className="text-[#66714f]" />
        <span className="text-sm font-semibold text-[#3f4438]">Додати файли</span>
        <span className="max-w-md text-sm leading-5 text-[#777970]">
          Файли зберігаються як назви у чернетці. Для відправки реальних файлів краще додати
          посилання на Google Drive, Pinterest, Behance або сайт.
        </span>
        <input type="file" multiple className="sr-only" onChange={handleFiles} />
      </label>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <button
              key={file}
              type="button"
              onClick={() => onChange(files.filter((item) => item !== file))}
              className="rounded-full bg-[#eeebe1] px-3 py-1 text-sm font-semibold text-[#4f524a]"
            >
              {file}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyBasicsStep({
  brief,
  errors,
  setField,
}: {
  brief: BrandBrief
  errors: FieldErrors
  setField: <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => void
}) {
  return (
    <>
      <TextInput
        label="Назва компанії або бренду"
        value={brief.companyBasics.brandName}
        onChange={(value) => setField('companyBasics', 'brandName', value)}
        placeholder="Наприклад: Terra Studio"
        error={errors.brandName}
      />
      <TextInput
        label="Сайт або соціальні мережі"
        value={brief.companyBasics.links}
        onChange={(value) => setField('companyBasics', 'links', value)}
        placeholder="https://site.com, Instagram, LinkedIn"
        helper="Додайте все, що допоможе побачити бренд у реальному контексті."
      />
      <TextArea
        label="Коротко опишіть компанію"
        value={brief.companyBasics.description}
        onChange={(value) => setField('companyBasics', 'description', value)}
        placeholder="Чим ви займаєтесь, для кого працюєте, що вже існує?"
        error={errors.description}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Категорія продукту або послуги"
          value={brief.companyBasics.category}
          onChange={(value) => setField('companyBasics', 'category', value)}
          placeholder="Освіта, IT, ресторан, нерухомість..."
        />
        <TextInput
          label="Географія ринку"
          value={brief.companyBasics.geography}
          onChange={(value) => setField('companyBasics', 'geography', value)}
          placeholder="Україна, Європа, локальне місто..."
        />
      </div>
      <SelectField
        label="Поточний етап"
        value={brief.companyBasics.stage}
        onChange={(value) => setField('companyBasics', 'stage', value)}
        options={['Новий бренд', 'Редизайн', 'Ребрендинг', 'Розширення']}
        error={errors.stage}
      />
    </>
  )
}

function BrandEssenceStep({
  brief,
  errors,
  setField,
}: {
  brief: BrandBrief
  errors: FieldErrors
  setField: <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => void
}) {
  return (
    <>
      <TextArea
        label="Що робить компанія?"
        value={brief.brandEssence.whatCompanyDoes}
        onChange={(value) => setField('brandEssence', 'whatCompanyDoes', value)}
        placeholder="Опишіть простими словами, без презентаційної мови."
        error={errors.whatCompanyDoes}
      />
      <TextArea
        label="Яку проблему вона вирішує?"
        value={brief.brandEssence.problemSolved}
        onChange={(value) => setField('brandEssence', 'problemSolved', value)}
        placeholder="Наприклад: допомагає власникам бізнесу швидше запускати продажі."
      />
      <TextArea
        label="Чому люди мають обрати саме цей бренд?"
        value={brief.brandEssence.whyChoose}
        onChange={(value) => setField('brandEssence', 'whyChoose', value)}
        placeholder="Що створює довіру: досвід, підхід, ціна, сервіс, результат?"
        error={errors.whyChoose}
      />
      <TagInput
        label="3–5 слів, які описують бренд"
        values={brief.brandEssence.brandWords}
        onChange={(values) => setField('brandEssence', 'brandWords', values)}
        placeholder="Наприклад: спокійний, точний, людяний"
        helper="Натисніть Enter або введіть кілька слів через кому."
      />
      <TextArea
        label="Головна обіцянка бренду"
        value={brief.brandEssence.promise}
        onChange={(value) => setField('brandEssence', 'promise', value)}
        placeholder="Що людина отримує, коли обирає вас?"
      />
      <TextArea
        label="Що люди мають відчути, коли бачать логотип?"
        value={brief.brandEssence.desiredFeeling}
        onChange={(value) => setField('brandEssence', 'desiredFeeling', value)}
        placeholder="Наприклад: впевненість, турботу, експертність, легкість."
      />
    </>
  )
}

function TargetAudienceStep({
  brief,
  errors,
  setField,
}: {
  brief: BrandBrief
  errors: FieldErrors
  setField: <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => void
}) {
  return (
    <>
      <TextArea
        label="Основна цільова аудиторія"
        value={brief.targetAudience.audience}
        onChange={(value) => setField('targetAudience', 'audience', value)}
        placeholder="Хто ці люди або компанії? Що їх об'єднує?"
        helper="Це допомагає визначити, яка візуальна мова буде для них природною."
        error={errors.audience}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Вік"
          value={brief.targetAudience.ageRange}
          onChange={(value) => setField('targetAudience', 'ageRange', value)}
          placeholder="25–40, B2B-рішення, різний вік..."
        />
        <TextInput
          label="Професія або стиль життя"
          value={brief.targetAudience.lifestyle}
          onChange={(value) => setField('targetAudience', 'lifestyle', value)}
          placeholder="Підприємці, молоді батьки, команди HR..."
        />
      </div>
      <TextArea
        label="Ключові потреби"
        value={brief.targetAudience.needs}
        onChange={(value) => setField('targetAudience', 'needs', value)}
        placeholder="Що вони намагаються отримати або змінити?"
      />
      <TextArea
        label="Страхи або заперечення"
        value={brief.targetAudience.fears}
        onChange={(value) => setField('targetAudience', 'fears', value)}
        placeholder="Що може завадити їм обрати бренд?"
      />
      <TextArea
        label="Що для клієнта найважливіше при виборі?"
        value={brief.targetAudience.choiceFactors}
        onChange={(value) => setField('targetAudience', 'choiceFactors', value)}
        placeholder="Ціна, швидкість, статус, безпека, сервіс, результат..."
      />
    </>
  )
}

function CompetitorsStep({
  brief,
  setField,
  setBrief,
}: {
  brief: BrandBrief
  setField: <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => void
  setBrief: React.Dispatch<React.SetStateAction<BrandBrief>>
}) {
  const updateCompetitor = (index: number, key: keyof Competitor, value: string) => {
    setBrief((current) => {
      const items = current.competitors.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      )
      return updateNested(current, 'competitors', 'items', items)
    })
  }

  return (
    <>
      <CompetitorRepeater
        competitors={brief.competitors.items}
        onAdd={() =>
          setField('competitors', 'items', [
            ...brief.competitors.items,
            { name: '', link: '', likedStyle: '', avoid: '' },
          ])
        }
        onRemove={(index) =>
          setField(
            'competitors',
            'items',
            brief.competitors.items.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        onChange={updateCompetitor}
      />
      <TextArea
        label="Бренди, які вам подобаються поза вашим ринком"
        value={brief.competitors.admiredBrands}
        onChange={(value) => setField('competitors', 'admiredBrands', value)}
        placeholder="Це можуть бути кафе, технологічні компанії, медіа, культурні проєкти."
      />
    </>
  )
}

function CompetitorRepeater({
  competitors,
  onAdd,
  onRemove,
  onChange,
}: {
  competitors: Competitor[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, key: keyof Competitor, value: string) => void
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#30332d]">Основні конкуренти</h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-[#dfe8c7] px-3 py-2 text-sm font-semibold text-[#30362b]"
        >
          <Plus size={16} />
          Додати
        </button>
      </div>
      {competitors.map((competitor, index) => (
        <div key={index} className="grid gap-4 rounded-3xl border border-[#e3dfd3] bg-[#fbfaf7] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#66714f]">Конкурент {index + 1}</p>
            {competitors.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#7a5148] transition hover:bg-[#f0e1dc]"
                aria-label="Видалити конкурента"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Назва"
              value={competitor.name}
              onChange={(value) => onChange(index, 'name', value)}
              placeholder="Назва конкурента"
            />
            <TextInput
              label="Посилання"
              value={competitor.link}
              onChange={(value) => onChange(index, 'link', value)}
              placeholder="Сайт або соцмережі"
            />
          </div>
          <TextArea
            label="Що подобається в їхньому візуальному стилі?"
            value={competitor.likedStyle}
            onChange={(value) => onChange(index, 'likedStyle', value)}
            placeholder="Наприклад: структура, простота, кольори, відчуття преміальності."
          />
          <TextArea
            label="Чого варто уникнути?"
            value={competitor.avoid}
            onChange={(value) => onChange(index, 'avoid', value)}
            placeholder="Наприклад: надто типовий символ, агресивні кольори, складний знак."
          />
        </div>
      ))}
    </div>
  )
}

function VisualDirectionStep({
  brief,
  errors,
  setField,
}: {
  brief: BrandBrief
  errors: FieldErrors
  setField: <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => void
}) {
  const setMood = (key: string, value: number) => {
    setField('visualDirection', 'mood', { ...brief.visualDirection.mood, [key]: value })
  }

  return (
    <>
      <SelectField
        label="Бажаний тип логотипа"
        value={brief.visualDirection.logoType}
        onChange={(value) => setField('visualDirection', 'logoType', value)}
        options={logoTypes}
        helper="Якщо не знаєте, оберіть “не впевнений/не впевнена”. Це нормальна відповідь."
        error={errors.logoType}
      />
      <div className="grid gap-4">
        <h3 className="text-base font-semibold text-[#30332d]">Настрій бренду</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <MoodSlider
            labelLeft="Мінімальний"
            labelRight="Виразний"
            value={brief.visualDirection.mood.minimalExpressive}
            onChange={(value) => setMood('minimalExpressive', value)}
          />
          <MoodSlider
            labelLeft="Преміальний"
            labelRight="Доступний"
            value={brief.visualDirection.mood.premiumAccessible}
            onChange={(value) => setMood('premiumAccessible', value)}
          />
          <MoodSlider
            labelLeft="Серйозний"
            labelRight="Дружній"
            value={brief.visualDirection.mood.seriousFriendly}
            onChange={(value) => setMood('seriousFriendly', value)}
          />
          <MoodSlider
            labelLeft="Класичний"
            labelRight="Сучасний"
            value={brief.visualDirection.mood.classicModern}
            onChange={(value) => setMood('classicModern', value)}
          />
          <MoodSlider
            labelLeft="М'який"
            labelRight="Гострий"
            value={brief.visualDirection.mood.softSharp}
            onChange={(value) => setMood('softSharp', value)}
          />
          <MoodSlider
            labelLeft="Локальний"
            labelRight="Міжнародний"
            value={brief.visualDirection.mood.localInternational}
            onChange={(value) => setMood('localInternational', value)}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Бажані кольори"
          value={brief.visualDirection.preferredColors}
          onChange={(value) => setField('visualDirection', 'preferredColors', value)}
          placeholder="Оливковий, графіт, молочний..."
        />
        <TextInput
          label="Заборонені кольори"
          value={brief.visualDirection.forbiddenColors}
          onChange={(value) => setField('visualDirection', 'forbiddenColors', value)}
          placeholder="Кольори, які точно не підходять"
        />
      </div>
      <SelectField
        label="Бажана типографіка"
        value={brief.visualDirection.typography}
        onChange={(value) => setField('visualDirection', 'typography', value)}
        options={typographyOptions}
      />
      <FileUpload
        files={brief.visualDirection.uploadedReferences}
        onChange={(files) => setField('visualDirection', 'uploadedReferences', files)}
      />
      <TextArea
        label="Посилання на референси"
        value={brief.visualDirection.references}
        onChange={(value) => setField('visualDirection', 'references', value)}
        placeholder="Посилання на Pinterest, Behance, Drive, сайти або бренди."
      />
      <TextArea
        label="Яких візуальних кліше варто уникнути?"
        value={brief.visualDirection.clichesToAvoid}
        onChange={(value) => setField('visualDirection', 'clichesToAvoid', value)}
        placeholder="Наприклад: листочки для еко-бренду, будинки для нерухомості, глобуси для міжнародності."
      />
    </>
  )
}

function PracticalUsageStep({
  brief,
  errors,
  setField,
}: {
  brief: BrandBrief
  errors: FieldErrors
  setField: <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => void
}) {
  return (
    <>
      <MultiSelect
        label="Де буде використовуватися логотип?"
        values={brief.practicalUsage.placements}
        options={usageOptions}
        onChange={(values) => setField('practicalUsage', 'placements', values)}
        helper="Це впливає на деталізацію знака, читабельність і набір фінальних файлів."
        error={errors.placements}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Потрібні версії для темного і світлого фону?"
          value={brief.practicalUsage.darkLightVersions}
          onChange={(value) => setField('practicalUsage', 'darkLightVersions', value)}
          options={yesNoUnsure}
        />
        <SelectField
          label="Потрібна добра читабельність у малому розмірі?"
          value={brief.practicalUsage.smallSizeReadability}
          onChange={(value) => setField('practicalUsage', 'smallSizeReadability', value)}
          options={yesNoUnsure}
        />
        <SelectField
          label="Потрібні файли для друку?"
          value={brief.practicalUsage.printReadyFiles}
          onChange={(value) => setField('practicalUsage', 'printReadyFiles', value)}
          options={yesNoUnsure}
        />
        <SelectField
          label="Може знадобитися анімація в майбутньому?"
          value={brief.practicalUsage.futureAnimation}
          onChange={(value) => setField('practicalUsage', 'futureAnimation', value)}
          options={yesNoUnsure}
        />
      </div>
    </>
  )
}

function ScopeStep({
  brief,
  errors,
  setField,
}: {
  brief: BrandBrief
  errors: FieldErrors
  setField: <TSection extends keyof BrandBrief, TKey extends keyof BrandBrief[TSection]>(
    section: TSection,
    key: TKey,
    value: BrandBrief[TSection][TKey],
  ) => void
}) {
  return (
    <>
      <MultiSelect
        label="Що потрібно підготувати?"
        values={brief.scopeAndDeliverables.deliverables}
        options={deliverableOptions}
        onChange={(values) => setField('scopeAndDeliverables', 'deliverables', values)}
        error={errors.deliverables}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          label="Бажаний дедлайн"
          type="date"
          value={brief.scopeAndDeliverables.deadline}
          onChange={(value) => setField('scopeAndDeliverables', 'deadline', value)}
        />
        <SelectField
          label="Бюджетний діапазон"
          value={brief.scopeAndDeliverables.budget}
          onChange={(value) => setField('scopeAndDeliverables', 'budget', value)}
          options={['До $500', '$500–1000', '$1000–2500', '$2500+', 'Потрібна оцінка']}
        />
      </div>
      <TextArea
        label="Хто ухвалює рішення?"
        value={brief.scopeAndDeliverables.decisionMakers}
        onChange={(value) => setField('scopeAndDeliverables', 'decisionMakers', value)}
        placeholder="Імена, ролі або команда, яка буде погоджувати рішення."
        error={errors.decisionMakers}
      />
      <TextArea
        label="Додаткові коментарі"
        value={brief.scopeAndDeliverables.comments}
        onChange={(value) => setField('scopeAndDeliverables', 'comments', value)}
        placeholder="Будь-який контекст, який може бути важливим."
      />
    </>
  )
}

function SummaryPage({
  brief,
  isSending,
  onEditSection,
  onSubmit,
}: {
  brief: BrandBrief
  isSending: boolean
  onEditSection: (step: number) => void
  onSubmit: () => void
}) {
  const json = useMemo(() => JSON.stringify(brief, null, 2), [brief])

  return (
    <article className="rounded-[28px] border border-[#dedbd0] bg-white p-5 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#66714f]">
        Фінальний перегляд
      </p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#22251f] sm:text-3xl">
        Перевірте бриф перед відправкою
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66695f]">
        Якщо все виглядає правильно, надішліть бриф на {recipientEmail} або завантажте копію.
      </p>

      <DownloadButtons brief={brief} json={json} />

      <div className="mt-7 grid gap-4">
        {steps.map((step, index) => (
          <SummarySection
            key={step.id}
            title={step.title}
            onEdit={() => onEditSection(index)}
            content={sectionToRows(brief, index)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#30362b] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#30362b]/20 transition hover:bg-[#424b39] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        <Mail size={18} />
        {isSending ? 'Надсилаємо...' : 'Надіслати бриф'}
      </button>
    </article>
  )
}

function SummarySection({
  title,
  content,
  onEdit,
}: {
  title: string
  content: Array<[string, string]>
  onEdit: () => void
}) {
  return (
    <section className="rounded-3xl border border-[#e3dfd3] bg-[#fbfaf7] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#30332d]">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-[#d8d4c8] px-3 py-2 text-sm font-semibold text-[#4f524a] transition hover:bg-white"
        >
          Редагувати
        </button>
      </div>
      <dl className="grid gap-3">
        {content.map(([label, value]) => (
          <div key={label} className="grid gap-1 sm:grid-cols-[220px_1fr]">
            <dt className="text-sm font-semibold text-[#6c7065]">{label}</dt>
            <dd className="whitespace-pre-wrap text-sm leading-6 text-[#2b2e28]">
              {value || 'Не заповнено'}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function DownloadButtons({ brief, json }: { brief: BrandBrief; json: string }) {
  const [copied, setCopied] = useState(false)

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={copyJson}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d4c8] px-4 py-3 text-sm font-semibold text-[#3a3d35] transition hover:bg-[#f2f0e8]"
      >
        <Clipboard size={18} />
        {copied ? 'Скопійовано' : 'Скопіювати JSON'}
      </button>
      <button
        type="button"
        onClick={() => download(json, 'brand-brief.json', 'application/json')}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d4c8] px-4 py-3 text-sm font-semibold text-[#3a3d35] transition hover:bg-[#f2f0e8]"
      >
        <Download size={18} />
        Завантажити JSON
      </button>
      <button
        type="button"
        onClick={() => download(briefToText(brief), 'brand-brief.txt', 'text/plain')}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8d4c8] px-4 py-3 text-sm font-semibold text-[#3a3d35] transition hover:bg-[#f2f0e8]"
      >
        <Download size={18} />
        Завантажити TXT
      </button>
    </div>
  )
}

function sectionToRows(brief: BrandBrief, index: number): Array<[string, string]> {
  const join = (items: string[]) => items.join(', ')

  if (index === 0) {
    return [
      ['Назва бренду', brief.companyBasics.brandName],
      ['Посилання', brief.companyBasics.links],
      ['Опис', brief.companyBasics.description],
      ['Категорія', brief.companyBasics.category],
      ['Географія', brief.companyBasics.geography],
      ['Етап', brief.companyBasics.stage],
    ]
  }

  if (index === 1) {
    return [
      ['Що робить компанія', brief.brandEssence.whatCompanyDoes],
      ['Проблема', brief.brandEssence.problemSolved],
      ['Чому обрати бренд', brief.brandEssence.whyChoose],
      ['Слова бренду', join(brief.brandEssence.brandWords)],
      ['Обіцянка', brief.brandEssence.promise],
      ['Бажане відчуття', brief.brandEssence.desiredFeeling],
    ]
  }

  if (index === 2) {
    return [
      ['Аудиторія', brief.targetAudience.audience],
      ['Вік', brief.targetAudience.ageRange],
      ['Стиль життя', brief.targetAudience.lifestyle],
      ['Потреби', brief.targetAudience.needs],
      ['Страхи', brief.targetAudience.fears],
      ['Фактори вибору', brief.targetAudience.choiceFactors],
    ]
  }

  if (index === 3) {
    return [
      [
        'Конкуренти',
        brief.competitors.items
          .map((item) =>
            [item.name, item.link, item.likedStyle && `Подобається: ${item.likedStyle}`, item.avoid && `Уникати: ${item.avoid}`]
              .filter(Boolean)
              .join('\n'),
          )
          .filter(Boolean)
          .join('\n\n'),
      ],
      ['Бренди-орієнтири', brief.competitors.admiredBrands],
    ]
  }

  if (index === 4) {
    return [
      ['Тип логотипа', brief.visualDirection.logoType],
      ['Настрій', JSON.stringify(brief.visualDirection.mood, null, 2)],
      ['Бажані кольори', brief.visualDirection.preferredColors],
      ['Заборонені кольори', brief.visualDirection.forbiddenColors],
      ['Типографіка', brief.visualDirection.typography],
      ['Файли', join(brief.visualDirection.uploadedReferences)],
      ['Посилання на референси', brief.visualDirection.references],
      ['Кліше, яких уникати', brief.visualDirection.clichesToAvoid],
    ]
  }

  if (index === 5) {
    return [
      ['Носії', join(brief.practicalUsage.placements)],
      ['Темний / світлий фон', brief.practicalUsage.darkLightVersions],
      ['Малий розмір', brief.practicalUsage.smallSizeReadability],
      ['Друк', brief.practicalUsage.printReadyFiles],
      ['Анімація', brief.practicalUsage.futureAnimation],
    ]
  }

  return [
    ['Матеріали', join(brief.scopeAndDeliverables.deliverables)],
    ['Дедлайн', brief.scopeAndDeliverables.deadline],
    ['Бюджет', brief.scopeAndDeliverables.budget],
    ['Хто ухвалює рішення', brief.scopeAndDeliverables.decisionMakers],
    ['Коментарі', brief.scopeAndDeliverables.comments],
  ]
}

function briefToText(brief: BrandBrief) {
  return steps
    .map((step, index) => {
      const rows = sectionToRows(brief, index)
        .map(([label, value]) => `${label}: ${value || 'Не заповнено'}`)
        .join('\n')
      return `${step.title}\n${rows}`
    })
    .join('\n\n')
}

export default App
