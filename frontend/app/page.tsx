// frontend/app/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Code, 
  Image, 
  Settings, 
  Send, 
  User, 
  Bot,
  Zap,
  Brain,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      })
      
      const data = await response.json()
      const aiMessage = { role: 'assistant', content: data.answer }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'chat', name: 'Chat', icon: MessageSquare, color: 'blue' },
    { id: 'code', name: 'Code', icon: Code, color: 'green' },
    { id: 'image', name: 'Image', icon: Image, color: 'purple' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'gray' }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
    }`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 border-b border-white/10"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                GenzAI
              </h1>
              <p className="text-sm opacity-70">Your Intelligent Learning Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-purple-500 text-white'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            
            <motion.div
              animate={{ pulse: 1 }}
              className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full"
            >
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Learning Active</span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tab Navigation */}
        <motion.nav 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-2 mb-8"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500 text-white shadow-lg`
                  : `bg-white/10 hover:bg-white/20 text-white/70`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </motion.button>
          ))}
        </motion.nav>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <motion.div 
            layout
            className={`lg:col-span-3 rounded-2xl p-6 backdrop-blur-lg border ${
              darkMode 
                ? 'bg-black/20 border-white/10' 
                : 'bg-white/80 border-gray-200'
            }`}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'chat' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-[600px] flex flex-col"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        >
                          <Brain className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">Welcome to GenzAI!</h3>
                        <p className="opacity-70">I'm your AI assistant that learns and improves over time.</p>
                        <p className="opacity-70">Ask me anything - I'll find the best answer for you!</p>
                      </motion.div>
                    ) : (
                      messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: message.role === 'user' ? 50 : -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-3 max-w-[80%] ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === 'user' 
                                ? 'bg-blue-500' 
                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`rounded-2xl p-4 ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-white/10 rounded-bl-none'
                              }`}
                            >
                              {message.content}
                            </motion.div>
                          </div>
                        </motion.div>
                      ))
                    )}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start space-x-3 max-w-[80%]">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white/10 rounded-2xl rounded-bl-none p-4">
                            <div className="flex space-x-2">
                              <motion.div
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                              <motion.div
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl px-6 py-3 font-semibold disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Other Tabs */}
              {activeTab !== 'chat' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[600px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      {tabs.find(tab => tab.id === activeTab)?.icon && 
                        React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, { 
                          className: "w-10 h-10 text-white" 
                        })
                      }
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">
                      {tabs.find(tab => tab.id === activeTab)?.name} Feature
                    </h3>
                    <p className="opacity-70">Coming soon! This feature is under development.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl p-6 backdrop-blur-lg border ${
              darkMode 
                ? 'bg-black/20 border-white/10' 
                : 'bg-white/80 border-gray-200'
            }`}
          >
            <h3 className="font-semibold mb-4">AI Models Status</h3>
            <div className="space-y-3">
              {['ChatGPT', 'Claude', 'DeepSeek', 'Perplexity'].map((model, index) => (
                <motion.div
                  key={model}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <span className="text-sm">{model}</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
              <h4 className="font-semibold mb-2">Learning Progress</h4>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  transition={{ duration: 2, delay: 1 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                />
              </div>
              <p className="text-xs mt-2 opacity-70">45% - Collecting training data</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
