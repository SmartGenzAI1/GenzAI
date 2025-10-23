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
  Sun,
  Mic,
  Map,
  Play,
  Camera,
  Volume2,
  Wifi,
  WifiOff
} from 'lucide-react'

interface Message {
  role: string;
  content: string;
  source?: string;
  imageUrl?: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [backendOnline, setBackendOnline] = useState(false)
  const [connectionTesting, setConnectionTesting] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Test backend connection on component mount
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        setConnectionTesting(true)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://genz-ai-backend4.onrender.com'
        console.log('Testing backend connection to:', backendUrl)
        
        const response = await fetch(`${backendUrl}/health`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        
        const data = await response.json()
        console.log('Backend health response:', data)
        setBackendOnline(data.status === 'healthy')
      } catch (error) {
        console.error('Backend connection failed:', error)
        setBackendOnline(false)
      } finally {
        setConnectionTesting(false)
      }
    }
    
    testBackendConnection()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !backendOnline) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://genz-ai-backend4.onrender.com'
      console.log('Sending request to:', `${backendUrl}/ask`)
      
      const response = await fetch(`${backendUrl}/ask`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ question: input })
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('AI Response:', data)
      
      const aiMessage: Message = { 
        role: 'assistant', 
        content: data.answer,
        source: data.source
      }
      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('API Error:', error)
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error while connecting to the AI services. Please try again in a moment.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageGeneration = async () => {
    if (!input.trim() || !backendOnline) return

    const userMessage: Message = { role: 'user', content: `Generate image: ${input}` }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://genz-ai-backend4.onrender.com'
      const response = await fetch(`${backendUrl}/generate-image`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt: input, size: "1024x1024" })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      if (data.success) {
        const aiMessage: Message = { 
          role: 'assistant', 
          content: 'Here is your generated image:',
          imageUrl: data.image_url,
          source: data.source
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || 'Image generation failed')
      }
    } catch (error) {
      console.error('Image generation error:', error)
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Image generation failed. Please try again with a different prompt.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextToSpeech = async (text: string) => {
    if (!backendOnline) return
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://genz-ai-backend4.onrender.com'
      const response = await fetch(`${backendUrl}/text-to-speech`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text, voice_id: "Rachel" })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
      } else {
        console.error('TTS failed with status:', response.status)
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error)
    }
  }

  const tabs = [
    { id: 'chat', name: 'AI Chat', icon: MessageSquare, color: 'blue' },
    { id: 'image', name: 'Image Gen', icon: Image, color: 'purple' },
    { id: 'voice', name: 'Voice', icon: Mic, color: 'green' },
    { id: 'code', name: 'Code', icon: Code, color: 'yellow' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'gray' }
  ]

  const getColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      gray: 'bg-gray-500'
    }
    return colors[color] || 'bg-blue-500'
  }

  // Quick test prompts
  const quickPrompts = [
    "Hello, how are you?",
    "Explain quantum computing in simple terms",
    "Write a Python function to calculate factorial",
    "What are the benefits of meditation?"
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
    }`}>
      {/* Header - Responsive */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-4 sm:p-6 border-b border-white/10 sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                GenzAI Pro
              </h1>
              <p className="text-xs sm:text-sm opacity-70 flex items-center space-x-1">
                <Zap className="w-3 h-3 text-green-400" />
                <span>Multi-Modal AI Assistant</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* Connection Status */}
            <motion.div
              animate={{ scale: connectionTesting ? [1, 1.1, 1] : 1 }}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                connectionTesting 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : backendOnline 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
              }`}
            >
              {connectionTesting ? (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span>Testing...</span>
                </>
              ) : backendOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Disconnected</span>
                </>
              )}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 ${
                darkMode ? 'text-yellow-400' : 'text-purple-600'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Tab Navigation - Scrollable on mobile */}
        <motion.nav 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-2 sm:space-x-3 mb-6 sm:mb-8 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl font-semibold transition-all duration-300 flex-shrink-0 text-sm sm:text-base ${
                activeTab === tab.id
                  ? `${getColorClass(tab.color)} text-white shadow-xl`
                  : `bg-white/10 backdrop-blur-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/20`
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{tab.name}</span>
            </motion.button>
          ))}
        </motion.nav>

        {/* Main Content Area - Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Chat Area - Full width on mobile, 3/4 on desktop */}
          <div className="xl:col-span-3 rounded-3xl bg-black/20 backdrop-blur-lg border border-white/10 p-4 sm:p-6 lg:p-8 shadow-2xl">
            <AnimatePresence mode="wait">
              {activeTab === 'chat' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-[60vh] sm:h-[70vh] lg:h-[600px] flex flex-col"
                >
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 mb-4 sm:mb-6 pr-2">
                    {messages.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 sm:py-16"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                            y: [0, -10, 0]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                        >
                          <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </motion.div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                          {backendOnline ? 'Welcome to GenzAI Pro! 🚀' : 'Checking Connection...'}
                        </h3>
                        
                        {backendOnline ? (
                          <>
                            <p className="text-sm sm:text-lg opacity-80 mb-2">Your AI assistant is ready to help!</p>
                            <p className="text-xs sm:text-base opacity-70 mb-6">Ask anything - I'll find the best answer using multiple AI models!</p>
                            
                            {/* Quick Prompts */}
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                              {quickPrompts.map((suggestion, idx) => (
                                <motion.button
                                  key={idx}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setInput(suggestion)}
                                  className="p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-xs sm:text-sm opacity-80 hover:opacity-100 transition-all text-left hover:bg-white/20"
                                >
                                  {suggestion}
                                </motion.button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm sm:text-lg opacity-80">Connecting to AI services...</p>
                            {!connectionTesting && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl max-w-md mx-auto"
                              >
                                <div className="flex items-center space-x-2 text-red-400 justify-center">
                                  <WifiOff className="w-4 h-4" />
                                  <span className="text-sm font-medium">Connection failed</span>
                                </div>
                                <p className="text-xs text-red-300/80 mt-1 text-center">
                                  Please refresh the page or check your connection
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: message.role === 'user' ? 50 : -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-2 sm:space-x-4 max-w-[90%] sm:max-w-[85%] ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                              message.role === 'user' 
                                ? 'bg-blue-500' 
                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              )}
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              className={`rounded-2xl p-3 sm:p-4 shadow-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-white/10 backdrop-blur-lg border border-white/20 rounded-bl-none'
                              }`}
                            >
                              {message.imageUrl ? (
                                <div className="space-y-2 sm:space-y-3">
                                  <p className="text-sm sm:text-base">{message.content}</p>
                                  <img 
                                    src={message.imageUrl} 
                                    alt="Generated" 
                                    className="rounded-2xl max-w-full h-auto shadow-md"
                                  />
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap text-sm sm:text-base">{message.content}</p>
                              )}
                              
                              {message.source && message.source !== 'system' && (
                                <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20">
                                  <span className="text-xs opacity-70">
                                    Source: <span className="font-semibold">{message.source}</span>
                                  </span>
                                  {message.role === 'assistant' && !message.imageUrl && backendOnline && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleTextToSpeech(message.content)}
                                      className="p-1 sm:p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
                                      title="Listen to this message"
                                    >
                                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
               
