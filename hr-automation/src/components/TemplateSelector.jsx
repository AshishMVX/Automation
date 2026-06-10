import { TEMPLATES } from '../utils/templates'

const BASE = {
  indigo: 'bg-indigo-50  text-indigo-700  hover:bg-indigo-100  border border-indigo-200',
  yellow: 'bg-yellow-50  text-yellow-700  hover:bg-yellow-100  border border-yellow-200',
  blue:   'bg-blue-50    text-blue-700    hover:bg-blue-100    border border-blue-200',
  red:    'bg-red-50     text-red-700     hover:bg-red-100     border border-red-200',
  green:  'bg-green-50   text-green-700   hover:bg-green-100   border border-green-200',
}

const ACTIVE = {
  indigo: 'bg-indigo-600  text-white  border border-indigo-600  shadow-md',
  yellow: 'bg-yellow-500  text-white  border border-yellow-500  shadow-md',
  blue:   'bg-blue-600    text-white  border border-blue-600    shadow-md',
  red:    'bg-red-600     text-white  border border-red-600     shadow-md',
  green:  'bg-green-600   text-white  border border-green-600   shadow-md',
}

export default function TemplateSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(TEMPLATES).map(([key, tmpl]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === key ? ACTIVE[tmpl.color] : BASE[tmpl.color]
          }`}
        >
          {tmpl.label}
        </button>
      ))}
    </div>
  )
}
