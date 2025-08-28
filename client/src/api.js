import axios from 'axios'

// where the server is running
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// send a file to the server to read text
export const uploadFile = async (file) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post(`${BASE_URL}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// ask the server to summarize text
export const summarizeText = async (text, length) => {
  const { data } = await axios.post(`${BASE_URL}/summarize`, { text, length })
  return data
}
