import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

function requireEnv(name: string, value: string | undefined): string {
  if (typeof value === 'string' && value.length > 0) return value
  throw new Error(`Missing required env var: ${name}`)
}

const supabaseUrl = requireEnv('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = requireEnv('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
