import { useState } from 'react'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const [token, setToken] = useState('')
  const [botInfo, setBotInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [commands, setCommands] = useState([])

  // Send message form
  const [chatId, setChatId] = useState('')
  const [text, setText] = useState('')
  const [sendResult, setSendResult] = useState(null)

  // Generic call form
  const [method, setMethod] = useState('getMe')
  const [params, setParams] = useState('{}')
  const [callResult, setCallResult] = useState(null)

  const resetFeedback = () => {
    setError('')
  }

  const validateToken = async () => {
    resetFeedback()
    setLoading(true)
    setBotInfo(null)
    setCommands([])
    try {
      const res = await fetch(`${baseUrl}/api/telegram/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail?.description || JSON.stringify(data))
      setBotInfo(data.result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommands = async () => {
    resetFeedback()
    setLoading(true)
    setCommands([])
    try {
      const res = await fetch(`${baseUrl}/api/telegram/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail?.description || JSON.stringify(data))
      setCommands(data.result || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    resetFeedback()
    setLoading(true)
    setSendResult(null)
    try {
      const res = await fetch(`${baseUrl}/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, chat_id: chatId, text })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail?.description || JSON.stringify(data))
      setSendResult(data.result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const callMethod = async () => {
    resetFeedback()
    setLoading(true)
    setCallResult(null)
    try {
      let parsed = {}
      if (params.trim()) {
        try {
          parsed = JSON.parse(params)
        } catch (e) {
          throw new Error('Params must be valid JSON')
        }
      }
      const res = await fetch(`${baseUrl}/api/telegram/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, method, params: parsed })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail?.description || JSON.stringify(data))
      setCallResult(data.result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Turn Telegram Bots into Apps</h1>
          <p className="text-gray-600 mt-2">Connect your bot and interact with it through a simple web interface.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Connect</h2>
              <label className="block text-sm text-gray-600 mb-1">Bot Token</label>
              <input
                type="password"
                placeholder="123456:ABC-DEF..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={validateToken}
                disabled={!token || loading}
                className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Checking…' : 'Validate & Fetch Bot Info'}
              </button>

              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                  {error}
                </div>
              )}

              {botInfo && (
                <div className="mt-4 text-sm text-gray-700">
                  <p><span className="font-semibold">ID:</span> {botInfo.id}</p>
                  <p><span className="font-semibold">Name:</span> {botInfo.first_name}</p>
                  <p><span className="font-semibold">Username:</span> @{botInfo.username}</p>
                  <p><span className="font-semibold">Is Bot:</span> {botInfo.is_bot ? 'Yes' : 'No'}</p>
                </div>
              )}

              <button
                onClick={fetchCommands}
                disabled={!token || loading}
                className="mt-4 w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-md disabled:opacity-50"
              >
                Load Commands
              </button>

              {commands && commands.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Commands</h3>
                  <ul className="text-sm text-gray-700 bg-gray-50 rounded p-2 space-y-1">
                    {commands.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-indigo-700">/{c.command}</span>
                        <span className="text-gray-600">— {c.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Send Message</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Chat ID</label>
                  <input
                    type="text"
                    placeholder="@channelusername or 12345678"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Text</label>
                  <input
                    type="text"
                    placeholder="Hello from my web app!"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!token || !chatId || !text || loading}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
              >
                Send
              </button>
              {sendResult && (
                <pre className="mt-3 text-xs bg-gray-50 rounded p-3 overflow-auto max-h-60">{JSON.stringify(sendResult, null, 2)}</pre>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Advanced Call</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Method</label>
                  <input
                    type="text"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Params (JSON)</label>
                  <textarea
                    rows={4}
                    value={params}
                    onChange={(e) => setParams(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={callMethod}
                disabled={!token || !method || loading}
                className="mt-3 bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
              >
                Run
              </button>
              {callResult && (
                <pre className="mt-3 text-xs bg-gray-50 rounded p-3 overflow-auto max-h-60">{JSON.stringify(callResult, null, 2)}</pre>
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p><span className="font-semibold">Backend:</span> {baseUrl}</p>
              <p className="mt-1">Tip: Use @RawDataBot or a private chat to find your chat ID.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
