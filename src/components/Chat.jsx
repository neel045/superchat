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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { nanoid } from "nanoid"

const Chat = ({ room }) => {
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState([])
    const lastMessage = useRef(null)
    const imageInputRef = useRef(null)
    const [image, setImage] = useState("")

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
            console.log({ messages })
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

        console.log({ image })

        const msg = {
            text: newMessage.trim(),
            createdAt: serverTimestamp(),
            user: {
                name: auth.currentUser.displayName,
                id: auth.currentUser.uid,
            },
            room,
        }

        if (imageInputRef.current.value) {
            const fileExt = image.name.split(".").pop()
            const fileName = `img-${auth.currentUser.uid}-${nanoid()}.${fileExt}`
            const imageRef = ref(storage, `images/${fileName}`)
            console.log({ imageRef })

            const uploadTask = uploadBytesResumable(imageRef, image, {
                contentType: image.type,
            })
            uploadTask.on(
                (err) => {},
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadUrl) => {
                        await addDoc(messagesCollection, { ...msg, img: downloadUrl })
                    })
                }
            )
        } else {
            await addDoc(messagesCollection, msg)
        }
        setNewMessage("")
        setImage("")
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
                    <input
                        type="file"
                        name="img"
                        className="inp"
                        id="send-image"
                        ref={imageInputRef}
                        onChange={(e) => setImage(e.target.files[0])}
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
