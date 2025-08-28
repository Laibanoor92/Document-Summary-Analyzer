import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadFile, summarizeText } from './api'
import { getInitialTheme, toggleTheme, applyTheme } from './theme'

const lengthOptions = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
]

function Spinner() {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span>Processing...</span>
    </div>
  )
}

export default function App() {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [summary, setSummary] = useState('')
  const [length, setLength] = useState('medium')
  const [loadingExtract, setLoadingExtract] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(getInitialTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      setFile(acceptedFiles[0])
      setExtractedText('')
      setSummary('')
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    }
  })

  const border = useMemo(() => {
    if (isDragReject) return 'border-red-400'
    if (isDragActive) return 'border-blue-400'
    return 'border-gray-300'
  }, [isDragActive, isDragReject])

  const handleExtract = async () => {
    try {
      setError('')
      setLoadingExtract(true)
      const { text } = await uploadFile(file)
      setExtractedText(text)
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to extract text')
    } finally {
      setLoadingExtract(false)
    }
  }

  const handleSummarize = async () => {
    try {
      setError('')
      setLoadingSummary(true)
      const { summary } = await summarizeText(extractedText, length)
      setSummary(summary)
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to summarize')
    } finally {
      setLoadingSummary(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-[#0b1220] transition-colors">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">Document Summary Assistant</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">Upload a PDF/Image, extract text, and summarize with Gemini.</p>
          </div>
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(toggleTheme())}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-200/70 dark:border-slate-700 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              {theme === 'dark' ? (
                <path d="M21.64 13A9 9 0 1111 2.36a7 7 0 1010.64 10.64z" />
              ) : (
                <path d="M12 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zm0 14a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm9-5a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM6 12a1 1 0 01-1 1H3a1 1 0 110-2h2a1 1 0 011 1zm11.657-6.657a1 1 0 010 1.414L16.243 8.17a1 1 0 11-1.414-1.415l1.414-1.414a1 1 0 011.414 0zM9.172 16.243a1 1 0 010 1.414L7.757 19.07a1 1 0 01-1.414-1.414l1.415-1.414a1 1 0 011.414 0zm9.9 1.414a1 1 0 00-1.414 0l-1.415 1.414a1 1 0 101.415 1.414l1.414-1.414a1 1 0 000-1.414zM8.586 5.757a1 1 0 00-1.414 0L5.757 7.171A1 1 0 107.17 8.586l1.415-1.415a1 1 0 000-1.414z" />
              )}
            </svg>
            <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div {...getRootProps()} className={`p-6 border-2 ${border} border-dashed rounded-xl bg-white dark:bg-slate-900/60 dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-900 transition cursor-pointer` }>
              <input {...getInputProps()} />
              <div className="text-center">
                <p className="text-gray-800 dark:text-gray-100 font-medium">Drag & drop your file here</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">or click to choose a file (PDF/PNG/JPG)</p>
              </div>
            </div>

            {file && (
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-200">Selected: <span className="font-medium">{file.name}</span></div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Summary length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full border border-gray-300 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-900 dark:text-gray-100">
                {lengthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md disabled:opacity-50 shadow-sm"
                onClick={handleExtract}
                disabled={!file || loadingExtract}
              >
                {loadingExtract ? 'Extracting…' : 'Extract Text'}
              </button>
              <button
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50 shadow-sm"
                onClick={handleSummarize}
                disabled={!extractedText || loadingSummary}
              >
                {loadingSummary ? 'Summarizing…' : 'Generate Summary'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-sm">{error}</div>
            )}
          </div>

          <div className="md:col-span-2 grid gap-6">
            <section className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Extracted Text</h2>
              {loadingExtract && <Spinner />}
              <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-100 text-sm min-h-[8rem]">{extractedText || '—'}</div>
            </section>

            <section className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Summary</h2>
              {loadingSummary && <Spinner />}
              <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-100 text-sm min-h-[8rem]">{summary || '—'}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
