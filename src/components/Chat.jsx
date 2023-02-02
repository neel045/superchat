import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore"
import { format } from "date-fns"
import { memo, useEffect, useRef, useState } from "react"
import { auth, db } from "../../firebase.config"

const Chat = ({ room }) => {
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState([])
    const lastMessage = useRef(null)

    const messagesCollection = collection(db, "messages")

    useEffect(() => {
        const queryMessages = query(
            messagesCollection,
            where("room", "==", room),
            orderBy("createdAt")
        )
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            let messages = []
            snapshot.forEach((doc) => {
                messages.push({ ...doc.data(), id: doc.id })
            })
            setMessages(messages)
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (lastMessage.current) {
            lastMessage.current.scrollIntoView()
        }
    }, [messages])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (newMessage === "") return

        await addDoc(messagesCollection, {
            text: newMessage.trim(),
            createdAt: serverTimestamp(),
            user: {
                name: auth.currentUser.displayName,
                id: auth.currentUser.uid,
            },
            room,
        })
        setNewMessage("")
    }

    return (
        <div className="chat-app">
            <h3 className="room-header">Room Id: {room.toUpperCase()}</h3>

            <div className="chat-area">
                {messages &&
                    messages.map((msg, i) => {
                        return (
                            <div
                                id={msg.id}
                                key={msg.id}
                                className={`msg ${
                                    msg.user.id == auth.currentUser.uid ? "right" : "left"
                                }`}
                                ref={lastMessage}
                            >
                                <p className="msg-user-name">{msg.user.name}</p>
                                <p className="msg-body">
                                    <span className="msg-text">{msg.text} </span>
                                    <span className="msg-time">
                                        {msg.createdAt &&
                                            format(
                                                new Date(msg.createdAt.seconds * 1000),
                                                "hh:mm a"
                                            )}
                                    </span>
                                </p>
                            </div>
                        )
                    })}
                <form onSubmit={handleSubmit} className="new-chat-form">
                    <input
                        type="text"
                        placeholder="Type Your Message Here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        id="msg-input"
                        className="inp"
                        autoComplete="off"
                    />
                    <button className="btn send-msg" type="submit">
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
}

export default memo(Chat)
