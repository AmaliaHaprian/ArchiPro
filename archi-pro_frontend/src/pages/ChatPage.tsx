import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL, fetchChatMessages } from '../api';
import './ChatPage.css';

type ChatMessage = {
    sender: string;
    content: string;
    createdAt: string;
    senderId?: string;
};

// Connect to the same origin so Vite's dev server can proxy the socket to the backend.
// This avoids cross-origin TLS issues during development.
const socket = io(API_BASE_URL, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
});

function ChatPage() {
    const [currentUser, setCurrentUser] = useState<{ username: string; id: string; role: string; permissions: string[] } | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('authUser') ?? localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr) as {
                username?: string;
                userId?: string;
                id?: string;
                role?: string;
                permissions?: string[];
            };
            setCurrentUser({
                username: user.username ?? '',
                id: user.userId ?? user.id ?? '',
                role: user.role ?? 'USER',
                permissions: user.permissions ?? [],
            });
            console.log(user);
        } else {
            console.warn('ChatPage could not find stored user/authUser; sendMessage will be blocked until login state is restored.');
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

    useEffect(() => {
        const onConnect = () => console.log('socket connected', socket.id);
        const onConnectError = (err: any) => console.error('socket connect_error', err);
        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        return () => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
        };
    }, []);

    const sendMessage = () => {
        const messageText = inputRef.current?.value ?? '';
        console.log(currentUser, messageText);
        if (messageText.trim() === '' || !currentUser) {
            console.warn('sendMessage blocked', { text: messageText, currentUser });
            return;
        }
        const messageData = {
            sender: currentUser.username,
            senderId: currentUser.id,
            content: messageText,
            createdAt: new Date().toISOString(),
        };
        socket.emit('sendMessage', messageData);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
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
            <form className="writing-area" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message..."
                    className="chat-input"
                />
                <button type="submit" className="send-button">Send</button>
            </form>
        </div>
    )
}

export default ChatPage;