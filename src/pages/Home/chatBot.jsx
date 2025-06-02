import React, { useState, useEffect, useRef } from 'react';
import styles from './chatBot.module.css'; // Importamos el CSS Module


// ----- MessageBubble Component -----
const MessageBubble = ({ message }) => {

    
 

  const { text, sender, timestamp, isError } = message;
  const messageClass = sender === 'user' ? styles.userMessage : styles.botMessage;
  const bubbleStyle = isError ? { backgroundColor: '#ffe0e0', color: '#d8000c', border: '1px solid #d8000c' } : {};

  return (
    <div className={`${styles.messageBubble} ${messageClass}`} style={bubbleStyle}>
      <p className={styles.messageText}>{text}</p>
      {timestamp && (
        <span className={styles.messageTimestamp}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

// ----- ChatInput Component -----
const ChatInput = ({ onSendMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.chatInputForm}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Escribe tu mensaje..."
        disabled={disabled}
        aria-label="Mensaje"
        className={styles.chatInput}
      />
      <button type="submit" disabled={disabled} className={styles.sendButton}>
        Enviar
      </button>
    </form>
  );
};

// ----- ChatWindow Component -----
const ChatWindow = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]); // Auto-scroll cuando llegan nuevos mensajes

  return (
    <div className={styles.chatWindow}>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <div className={styles.typingIndicator}>Bot está escribiendo...</div>}
      <div ref={messagesEndRef} /> {/* Elemento invisible para el auto-scroll */}
    </div>
  );
};

// ----- Función para llamar a la API real de OpenAI -----
// Aquí es donde usamos la variable de entorno REACT_APP_OPENAI_API_KEY
const sendMessageToOpenAI = async (history) => {
   const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!API_KEY) {
    throw new Error('Falta configurar la variable REACT_APP_OPENAI_API_KEY en .env');
  }

  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: 'gpt-3.5-turbo',       // O el modelo que prefieras usar
    messages: history,            // La historia de mensajes en formato [{ role, content }, …]
    temperature: 0.7,             // Puedes ajustar temperatura, max_tokens, etc.
    max_tokens: 1000
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  // La respuesta de Chat Completion está en data.choices[0].message.content
  return data.choices[0].message.content;
};

// ----- ChatModal Component -----
const ChatModal = ({ onClose, initialMessage }) => {
  const [messages, setMessages] = useState([
    {
      id: 'initial',
      text: initialMessage || '¡Hola! Soy tu asistente virtual. ¿Cómo puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (inputText) => {
    if (!inputText.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    // 1) Agregamos el mensaje del usuario a la UI
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      // 2) Preparamos el historial para enviar a OpenAI
      const historyForAPI = [
        ...messages.map((msg) => ({
          role: msg.sender === 'bot' ? 'assistant' : 'user',
          content: msg.text
        })),
        { role: 'user', content: newUserMessage.text }
      ];

      // 3) Llamamos a la función que interactúa con OpenAI
      const botResponseText = await sendMessageToOpenAI(historyForAPI);

      // 4) Agregamos la respuesta del bot a la UI
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error('Error al contactar la API de OpenAI:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu solicitud. Inténtalo de nuevo.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 5) Manejar la tecla Escape para cerrar el modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className={styles.chatModalBackdrop} onClick={onClose}>
      <div className={styles.chatModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.chatModalHeader}>
          <h2>Asistente Virtual</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar chat">&times;</button>
        </div>
        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatModal;
