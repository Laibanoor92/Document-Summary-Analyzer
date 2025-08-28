import '../utils/shims.js'
import fs from 'fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

// Read text from a PDF file
export async function extractPdfText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath))
  const task = getDocument({ data, useWorkerFetch: false })
  const pdf = await task.promise

  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const parts = content.items.map(it => it.str)
    text += parts.join(' ') + '\n\n'
  }
  return text
}
