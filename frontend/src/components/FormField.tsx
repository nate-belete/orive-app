import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
  error?: string
  required?: boolean
}

export default function FormField({
  label,
  children,
  error,
  required,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

