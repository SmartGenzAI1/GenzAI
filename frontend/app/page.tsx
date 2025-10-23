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
  Download,
  Play,
  Camera,
  Volume2
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
  const [streaming, setStreaming] = useState(false)
  const [currentStream, setCurrentStream] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentStream])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreaming(true)
    setCurrentStream('')

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input, stream: false })
      })

      if (!response.ok) throw new Error('Failed to get response')
      
      const data = await response.json()
      const aiMessage: Message = { 
        role: 'assistant', 
        content: data.answer,
        source: data.source
      }
      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please check if the backend is running and try again.' 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setStreaming(false)
      setCurrentStream('')
    }
  }

  const handleImageGeneration = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: `Generate image: ${input}` }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, size: "1024x1024" })
      })
      
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
        throw new Error(data.error)
      }
    } catch (error) {
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
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: "Rachel" })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'
    }`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative p-6 border-b border-white/10 glass"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                GenzAI Pro
              </h1>
              <p className="text-sm opacity-70 flex items-center space-x-1">
                <Zap className="w-3 h-3 text-green-400" />
                <span>Multi-Modal AI Assistant</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-2xl glass shadow-lg ${
                darkMode ? 'text-yellow-400' : 'text-purple-600'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full glass"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400 font-medium">AI Active</span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-3 mb-8 overflow-x-auto pb-2"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex-shrink-0 shine ${
                activeTab === tab.id
                  ? `${getColorClass(tab.color)} text-white shadow-xl`
                  : `glass text-white/70 hover:text-white hover:bg-white/10`
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </motion.button>
          ))}
        </motion.nav>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <motion.div 
            layout
            className="lg:col-span-3 rounded-3xl glass p-8 shadow-2xl"
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
                  <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
                    {messages.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                            y: [0, -10, 0]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                        >
                          <Brain className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-4 gradient-text">Welcome to GenzAI Pro! 🚀</h3>
                        <p className="text-lg opacity-80 mb-2">Your advanced AI assistant is ready to help.</p>
                        <p className="opacity-70">Ask anything - I'll find the best answer using multiple AI models!</p>
                        
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                          {[
                            "Explain quantum computing",
                            "Generate a python script",
                            "Create marketing content"
                          ].map((suggestion, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setInput(suggestion)}
                              className="p-3 rounded-xl glass text-sm opacity-80 hover:opacity-100 transition-opacity"
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
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
                          <div className={`flex items-start space-x-4 max-w-[85%] ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                              message.role === 'user' 
                                ? 'bg-blue-500' 
                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="w-5 h-5 text-white" />
                              ) : (
                                <Bot className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`rounded-2xl p-5 shadow-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'glass rounded-bl-none'
                              }`}
                            >
                              {message.imageUrl ? (
                                <div className="space-y-3">
                                  <p>{message.content}</p>
                                  <img 
                                    src={message.imageUrl} 
                                    alt="Generated" 
                                    className="rounded-2xl max-w-full h-auto shadow-md"
                                  />
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
                              
                              {message.source && (
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                                  <span className="text-xs opacity-70">
                                    Source: <span className="font-semibold">{message.source}</span>
                                  </span>
                                  {message.role === 'assistant' && !message.imageUrl && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleTextToSpeech(message.content)}
                                      className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors"
                                      title="Listen to this message"
                                    >
                                      <Volume2 className="w-3 h-3 text-green-400" />
                                    </motion.button>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      ))
                    )}
                    
                    {/* Loading Indicator */}
                    {isLoading && !streaming && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start space-x-4 max-w-[85%]">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                          <div className="glass rounded-2xl rounded-bl-none p-5">
                            <div className="flex space-x-2">
                              {[0, 1, 2].map(i => (
                                <motion.div
                                  key={i}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              ))}
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
                      placeholder="Ask me anything... (Press Enter to send)"
                      className="flex-1 glass border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg placeholder-white/50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl px-8 py-4 font-semibold disabled:opacity-50 flex items-center space-x-3 shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                      <span>Send</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Image Generation Tab */}
              {activeTab === 'image' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[600px] flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto mb-6">
                    <div className="text-center mb-8">
                      <motion.div
                        animate={{ float: true }}
                        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      >
                        <Camera className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">AI Image Generation</h3>
                      <p className="opacity-70">Create amazing images with DALL-E 3</p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Describe the image you want to create..."
                          className="flex-1 glass border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleImageGeneration}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl px-8 py-4 font-semibold disabled:opacity-50 flex items-center space-x-3"
                        >
                          <Image className="w-5 h-5" />
                          <span>Generate</span>
                        </motion.button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "A futuristic city with flying cars",
                          "A beautiful sunset over mountains",
                          "A cute robot playing guitar",
                          "An abstract art piece with vibrant colors"
                        ].map((prompt, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setInput(prompt)}
                            className="p-4 rounded-xl glass text-left hover:bg-white/10 transition-colors"
                          >
                            <div className="text-sm opacity-80">{prompt}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Other Tabs */}
              {!['chat', 'image'].includes(activeTab) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[600px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                        y: [0, -10, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    >
                      {tabs.find(tab => tab.id === activeTab)?.icon && 
                        React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, { 
                          className: "w-12 h-12 text-white" 
                        })
                      }
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-4 gradient-text">
                      {tabs.find(tab => tab.id === activeTab)?.name}
                    </h3>
                    <p className="text-lg opacity-70 max-w-md mx-auto">
                      This advanced feature is coming soon! We're working hard to bring you the best AI experience.
                    </p>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 inline-flex items-center space-x-2 px-6 py-3 rounded-2xl glass"
                    >
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">Under Active Development</span>
                    </motion.div>
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
            className="rounded-3xl glass p-6 shadow-2xl"
          >
            <h3 className="font-bold text-lg mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>AI Services</span>
            </h3>
            
            <div className="space-y-4 mb-8">
              {[
                { name: 'OpenAI GPT-4', status: 'active', usage: 'Primary AI' },
                { name: 'Perplexity AI', status: 'active', usage: 'Web Search' },
                { name: 'DALL-E 3', status: 'active', usage: 'Image Generation' },
                { name: 'ElevenLabs', status: 'active', usage: 'Text-to-Speech' },
                { name: 'OpenRoute', status: 'ready', usage: 'Navigation' }
              ].map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs opacity-70">{service.usage}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                    }`} />
                    <span className="text-xs opacity-70">{service.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 mb-6">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Smart Routing</span>
              </h4>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '94%' }}
                  transition={{ duration: 2, delay: 1 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs opacity-70">
                <span>AI Accuracy</span>
                <span className="font-bold text-green-400">94%</span>
              </div>
            </div>

            {/* Features Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20">
              <h4 className="font-semibold mb-3">Features</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Multi-AI', 'Smart Routing', 'Image Gen', 'Voice',
                  'Real-time', 'Streaming', 'Navigation', 'Learning'
                ].map((feature, idx) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + idx * 0.1 }}
                    className="flex items-center space-x-1 p-2 rounded-lg bg-white/5"
                  >
                    <div className="w-1 h-1 bg-green-400 rounded-full" />
                    <span className="opacity-80">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
