// Основной класс чат-бота
class GoogleChatBot {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.settings = {
            botName: 'Google Assistant',
            theme: 'light',
            soundEnabled: true
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applyTheme();
        this.loadMessages();
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const voiceBtn = document.getElementById('voiceBtn');
        const clearChatBtn = document.getElementById('clearChat');
        const settingsBtn = document.getElementById('settings');
        const closeSettingsBtn = document.getElementById('closeSettings');
        const settingsModal = document.getElementById('settingsModal');
        const quickActions = document.querySelectorAll('.quick-action');

        // Отправка сообщения по Enter
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Отправка сообщения по клику
        sendBtn.addEventListener('click', () => this.sendMessage());

        // Голосовой ввод
        voiceBtn.addEventListener('click', () => this.startVoiceInput());

        // Очистка чата
        clearChatBtn.addEventListener('click', () => this.clearChat());

        // Настройки
        settingsBtn.addEventListener('click', () => this.openSettings());
        closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) this.closeSettings();
        });

        // Быстрые действия
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Настройки в модальном окне
        document.getElementById('botName').addEventListener('change', (e) => {
            this.settings.botName = e.target.value;
            this.saveSettings();
            this.updateBotName();
        });

        document.getElementById('theme').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.saveSettings();
            this.applyTheme();
        });

        document.getElementById('soundEnabled').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            this.saveSettings();
        });
    }

    // Отправка сообщения
    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;

        // Добавляем сообщение пользователя
        this.addMessage(message, 'user');
        messageInput.value = '';

        // Показываем индикатор печати
        this.showTypingIndicator();

        // Имитируем обработку сообщения
        setTimeout(() => {
            this.hideTypingIndicator();
            this.processUserMessage(message);
        }, 1000 + Math.random() * 2000);
    }

    // Добавление сообщения в чат
    addMessage(text, sender, timestamp = new Date()) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const timeString = this.formatTime(timestamp);
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'bot' ? 'robot' : 'user'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(text)}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Сохраняем сообщение
        this.messages.push({
            text,
            sender,
            timestamp: timestamp.toISOString()
        });
        this.saveMessages();

        // Воспроизводим звук
        if (this.settings.soundEnabled && sender === 'bot') {
            this.playNotificationSound();
        }
    }

    // Обработка сообщения пользователя
    processUserMessage(message) {
        const lowerMessage = message.toLowerCase();
        let response = '';

        // Простые команды
        if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
            response = `Привет! Рад вас видеть! Чем могу помочь?`;
        }
        else if (lowerMessage.includes('как дела') || lowerMessage.includes('как ты')) {
            response = `Спасибо, у меня всё отлично! Готов помогать вам с любыми вопросами.`;
        }
        else if (lowerMessage.includes('время') || lowerMessage.includes('который час')) {
            const now = new Date();
            response = `Сейчас ${now.toLocaleTimeString('ru-RU')}`;
        }
        else if (lowerMessage.includes('дата') || lowerMessage.includes('число')) {
            const now = new Date();
            response = `Сегодня ${now.toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}`;
        }
        else if (lowerMessage.includes('погода')) {
            response = `К сожалению, я не могу получить актуальную информацию о погоде. Попробуйте обратиться к специализированным сервисам.`;
        }
        else if (lowerMessage.includes('шутка') || lowerMessage.includes('анекдот')) {
            response = this.getRandomJoke();
        }
        else if (lowerMessage.includes('помощь') || lowerMessage.includes('help')) {
            response = `Вот что я умею:
• Отвечать на простые вопросы
• Показывать время и дату
• Рассказывать шутки
• Помогать с настройками

Просто напишите мне, и я постараюсь помочь!`;
        }
        else if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодарю')) {
            response = `Пожалуйста! Рад был помочь. Если нужна ещё помощь - обращайтесь!`;
        }
        else if (lowerMessage.includes('пока') || lowerMessage.includes('до свидания')) {
            response = `До свидания! Буду рад помочь вам снова!`;
        }
        else {
            // Если не распознали команду
            response = `Интересный вопрос! К сожалению, я пока учусь и не могу дать полный ответ. Попробуйте спросить о времени, дате или попросите рассказать шутку!`;
        }

        this.addMessage(response, 'bot');
    }

    // Обработка быстрых действий
    handleQuickAction(action) {
        switch(action) {
            case 'weather':
                this.addMessage('К сожалению, я не могу получить актуальную информацию о погоде. Попробуйте обратиться к специализированным сервисам.', 'bot');
                break;
            case 'time':
                const now = new Date();
                this.addMessage(`Сейчас ${now.toLocaleTimeString('ru-RU')}`, 'bot');
                break;
            case 'joke':
                this.addMessage(this.getRandomJoke(), 'bot');
                break;
            case 'help':
                this.addMessage(`Вот что я умею:
• Отвечать на простые вопросы
• Показывать время и дату
• Рассказывать шутки
• Помогать с настройками

Просто напишите мне, и я постараюсь помочь!`, 'bot');
                break;
        }
    }

    // Получение случайной шутки
    getRandomJoke() {
        const jokes = [
            "Почему программисты путают Рождество и Хэллоуин? Потому что Oct 31 == Dec 25!",
            "Как программист ломает голову? Git push --force!",
            "Что сказал программист на свадьбе? 'Да' (boolean true)",
            "Почему у программиста нет друзей? Потому что он использует Git!",
            "Как программист открывает банку? Ctrl+Alt+Delete!",
            "Что программист делает в лифте? Нажимает кнопку 0, потому что это первый этаж!",
            "Почему программисты не любят природу? Там слишком много багов!",
            "Как программист готовит яйца? if (egg.isReady()) { eat(); } else { wait(); }"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Показать индикатор печати
    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-message';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Скрыть индикатор печати
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Голосовой ввод
    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.addMessage('Извините, голосовой ввод не поддерживается в вашем браузере.', 'bot');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'ru-RU';
        recognition.continuous = false;
        recognition.interimResults = false;

        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        voiceBtn.style.background = 'linear-gradient(135deg, #ea4335 0%, #fbbc04 100%)';

        recognition.onstart = () => {
            this.addMessage('Слушаю...', 'bot');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('messageInput').value = transcript;
            this.sendMessage();
        };

        recognition.onerror = (event) => {
            this.addMessage('Ошибка распознавания речи. Попробуйте еще раз.', 'bot');
        };

        recognition.onend = () => {
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.style.background = 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)';
        };

        recognition.start();
    }

    // Очистка чата
    clearChat() {
        if (confirm('Вы уверены, что хотите очистить весь чат?')) {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">
                            Привет! Я ${this.settings.botName}. Чем могу помочь вам сегодня?
                        </div>
                        <div class="message-time">Сейчас</div>
                    </div>
                </div>
            `;
            
            this.messages = [];
            this.saveMessages();
        }
    }

    // Открыть настройки
    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
        
        // Заполняем поля текущими настройками
        document.getElementById('botName').value = this.settings.botName;
        document.getElementById('theme').value = this.settings.theme;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
    }

    // Закрыть настройки
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
    }

    // Обновить имя бота
    updateBotName() {
        const headerTitle = document.querySelector('.header-info h1');
        headerTitle.textContent = this.settings.botName;
    }

    // Применить тему
    applyTheme() {
        const body = document.body;
        body.className = '';
        
        if (this.settings.theme === 'dark') {
            body.classList.add('dark-theme');
        } else if (this.settings.theme === 'auto') {
            // Автоматическое определение темы
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-theme');
            }
        }
    }

    // Воспроизвести звук уведомления
    playNotificationSound() {
        // Создаем простой звук уведомления
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    // Форматирование времени
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Меньше минуты
            return 'Сейчас';
        } else if (diff < 3600000) { // Меньше часа
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин назад`;
        } else if (diff < 86400000) { // Меньше дня
            const hours = Math.floor(diff / 3600000);
            return `${hours} ч назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Сохранение сообщений в localStorage
    saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }

    // Загрузка сообщений из localStorage
    loadMessages() {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
            this.messages = JSON.parse(saved);
            // Восстанавливаем только последние 50 сообщений
            this.messages = this.messages.slice(-50);
            
            // Очищаем чат и добавляем сохраненные сообщения
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            
            this.messages.forEach(msg => {
                this.addMessage(msg.text, msg.sender, new Date(msg.timestamp));
            });
        }
    }

    // Сохранение настроек
    saveSettings() {
        localStorage.setItem('chatSettings', JSON.stringify(this.settings));
    }

    // Загрузка настроек
    loadSettings() {
        const saved = localStorage.getItem('chatSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
}

// Инициализация чат-бота при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new GoogleChatBot();
});

// Обработка изменения темы системы
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const bot = window.chatBot;
        if (bot && bot.settings.theme === 'auto') {
            bot.applyTheme();
        }
    });
}