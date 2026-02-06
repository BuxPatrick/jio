import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle, XCircle, FileText, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { VisaType, Question, checkEligibility, getNextQuestion } from '../data/visaData';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  type?: 'welcome' | 'question' | 'answer' | 'result' | 'requirements';
  options?: string[];
}

interface VisaChatAgentProps {
  visa: VisaType;
  onBack: () => void;
}

export function VisaChatAgent({ visa, onBack }: VisaChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: `Hello! I'm your visa eligibility assistant for the **${visa.name}**. I'll ask you a few questions to determine if you might be eligible for this visa type.\n\n${visa.description}`,
      sender: 'bot',
      type: 'welcome'
    };
    setMessages([welcomeMessage]);

    // Start with first question after a short delay
    setTimeout(() => {
      const firstQuestion = visa.questions[0];
      if (firstQuestion) {
        setCurrentQuestion(firstQuestion);
        addMessage({
          id: firstQuestion.id,
          text: firstQuestion.text,
          sender: 'bot',
          type: 'question',
          options: firstQuestion.options
        });
      }
    }, 1000);
  }, [visa]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;

    // Add user answer
    const answerMessage: Message = {
      id: `answer-${currentQuestion.id}`,
      text: answer,
      sender: 'user',
      type: 'answer'
    };
    addMessage(answerMessage);

    // Store answer
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Check if there are more questions
    const nextQuestionIndex = visa.questions.findIndex(q => !newAnswers[q.id]);
    
    if (nextQuestionIndex !== -1) {
      // Ask next question
      const nextQuestion = visa.questions[nextQuestionIndex];
      setTimeout(() => {
        setCurrentQuestion(nextQuestion);
        addMessage({
          id: nextQuestion.id,
          text: nextQuestion.text,
          sender: 'bot',
          type: 'question',
          options: nextQuestion.options
        });
      }, 500);
    } else {
      // All questions answered - show result
      setTimeout(() => {
        showEligibilityResult(newAnswers);
      }, 500);
    }
  };

  const showEligibilityResult = (finalAnswers: Record<string, string>) => {
    const result = checkEligibility(visa, finalAnswers);
    setIsComplete(true);
    setCurrentQuestion(null);

    if (result.eligible) {
      const resultMessage: Message = {
        id: 'result-eligible',
        text: `🎉 **Great news!** Based on your answers, you may be eligible for the ${visa.name}.\n\nHere are the documents and requirements you'll need:`,
        sender: 'bot',
        type: 'result'
      };
      addMessage(resultMessage);

      // Show requirements
      setTimeout(() => {
        const requirementsMessage: Message = {
          id: 'requirements',
          text: `**Required Documents:**\n${visa.requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}\n\n**Processing Time:** ${visa.processingTime}\n\n**Fees:** ${visa.fee}`,
          sender: 'bot',
          type: 'requirements'
        };
        addMessage(requirementsMessage);
      }, 500);
    } else {
      const resultMessage: Message = {
        id: 'result-ineligible',
        text: `❌ **Based on your answers, you may not be eligible** for the ${visa.name} at this time.\n\n**Reasons:**\n${result.disqualifyingReasons.map(r => `• ${r}`).join('\n')}\n\n**Recommendations:**\n• Consider consulting with an immigration attorney\n• Explore other visa categories that may better fit your situation\n• Address the disqualifying factors before applying`,
        sender: 'bot',
        type: 'result'
      };
      addMessage(resultMessage);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && currentQuestion?.type === 'text') {
      handleAnswer(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Back to visa list"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="text-2xl">{visa.emoji}</span>
              {visa.name}
            </h3>
            <p className="text-blue-100 text-sm">Eligibility Check</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-100">
          <Bot size={18} />
          <span>Visa Agent</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
              } ${message.type === 'result' ? 'max-w-[90%]' : ''}`}
            >
              <div className="flex items-start gap-2">
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  
                  {/* Show options for questions */}
                  {message.type === 'question' && message.options && !isComplete && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-sm transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {message.type === 'question' && !message.options && currentQuestion?.type === 'boolean' && !isComplete && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleAnswer('yes')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleAnswer('no')}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {!isComplete && currentQuestion && messages[messages.length - 1]?.sender === 'user' && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-blue-600" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete && currentQuestion?.type === 'text' && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Completion Actions */}
      {isComplete && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setAnswers({});
                setIsComplete(false);
                setMessages([]);
                // Restart
                const welcomeMessage: Message = {
                  id: 'welcome-restart',
                  text: `Let's check your eligibility for the **${visa.name}** again.`,
                  sender: 'bot',
                  type: 'welcome'
                };
                setMessages([welcomeMessage]);
                setTimeout(() => {
                  const firstQuestion = visa.questions[0];
                  if (firstQuestion) {
                    setCurrentQuestion(firstQuestion);
                    addMessage({
                      id: firstQuestion.id,
                      text: firstQuestion.text,
                      sender: 'bot',
                      type: 'question',
                      options: firstQuestion.options
                    });
                  }
                }, 1000);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Check Another Person
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Choose Different Visa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
