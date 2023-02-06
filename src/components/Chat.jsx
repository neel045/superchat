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
import { auth, db, storage } from "../../firebase.config"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { nanoid } from "nanoid"

const Chat = ({ room }) => {
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState([])
    const lastMessage = useRef(null)
    const imageInputRef = useRef(null)

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

    const uploadImage = async () => {
        const currentFilePath = imageInputRef?.current?.value
        if (currentFilePath) {
            const fileExt = currentFilePath.split(".").pop()
            const fileName = `img-${auth.currentUser.uid}-${nanoid()}.${fileExt}`
            const imageRef = ref(storage, `images/${fileName}`)

            try {
                return new Promise((resolve, reject) =>
                    uploadBytes(imageRef, currentFilePath).then((data) => {
                        getDownloadURL(ref(storage, imageRef))
                            .then((val) => resolve(val))
                            .catch(reject(null))
                    })
                )
            } catch (error) {
                console.log(error)
            }
        }
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const img = await uploadImage()
        console.log({ img })
        if (newMessage === "" && !img) return

        const msg = {
            text: newMessage.trim(),
            createdAt: serverTimestamp(),
            user: {
                name: auth.currentUser.displayName,
                id: auth.currentUser.uid,
            },
            room,
            img,
        }
        await addDoc(messagesCollection, msg)
        setNewMessage("")
    }

    return (
        <div className="chat-app">
            <h3 className="room-header">Room Id: {room.toUpperCase()}</h3>

            <div className="chat-area">
                <div className="messages-area">
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
                                    <div>{msg?.img && <img src={msg.img} alt="" />}</div>
                                </div>
                            )
                        })}
                </div>
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

                    <label id="send-img-lable" htmlFor="send-image">
                        📷
                    </label>
                    <input type="file" className="inp" id="send-image" ref={imageInputRef} />
                    <button className="btn send-msg" type="submit">
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
}

export default memo(Chat)
