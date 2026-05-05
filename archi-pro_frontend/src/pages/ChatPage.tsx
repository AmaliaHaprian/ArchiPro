import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { API_BASE_URL, fetchChatMessages } from '../api';
import './ChatPage.css';

type ChatMessage = {
    sender: string;
    content: string;
    createdAt: string;
    senderId?: string;
};

const socket = io(`${API_BASE_URL}/`, {
    transports: ['websocket', 'polling'],
});

function ChatPage() {
    const [currentUser, setCurrentUser] = useState<{ username: string; id: string; role: string; permissions: string[] } | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser({
                username: user.username,
                id: user.userId ?? user.id,
                role: user.role ?? user.roleName ?? 'USER',
                permissions: user.permissions ?? [],
            });
            console.log(user);
        }
    }, []);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const history = await fetchChatMessages();
                setMessages(history);
            } catch (error) {
                console.warn('Failed to load chat history:', error);
            }
        };

        loadMessages();
    }, []);

    useEffect(() => {
        socket.on('receiveMessage', (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });
        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const sendMessage = () => {
        if (text.trim() === '' || !currentUser) return;
        const messageData = {
            sender: currentUser.username,
            senderId: currentUser.id,
            content: text,
            createdAt: new Date(),
        };
        socket.emit('sendMessage', messageData);
        setText('');
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${currentUser && msg.sender === currentUser.username ? 'own-message' : 'other-message'}`}
                    >
                        <strong>{msg.sender}:</strong> {msg.content}
                        <p className='message-timestamp'>{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
            <div className="writing-area">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
            />
            <button onClick={sendMessage} className="send-button">Send</button>
            </div>
        </div>
    )
}

export default ChatPage;