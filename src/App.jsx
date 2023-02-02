import { useRef, useState } from "react"
import Auth from "./components/Auth"

import Cookies from "universal-cookie"
import Chat from "./components/Chat"
import { signOut } from "firebase/auth"
import { auth } from "../firebase.config"
const cookies = new Cookies()

function App() {
    const [isAuth, setIsAuth] = useState(cookies.get("auth-token"))
    const [room, setRoom] = useState(localStorage.getItem("room-id") || "")
    const [roomInput, setRoomInput] = useState("")
    const roomInputRef = useRef(null)

    if (!isAuth) {
        return <Auth setIsAuth={setIsAuth} />
    }

    const signUserOut = async () => {
        await signOut(auth)
        cookies.remove("auth-token")
        setIsAuth(false)
        setRoom("")
    }

    const enterRoomClicked = () => {
        const roomId = roomInputRef.current.value.trim()
        localStorage.setItem("room-id", roomId)
        setRoomInput("")
        setRoom(roomId)
    }

    const leaveRoom = () => {
        localStorage.removeItem("room-id")
        setRoom("")
    }

    return (
        <div className="App">
            {/* {isAuth && <Auth setIsAuth={setIsAuth} />} */}
            <header>
                <button className="btn signout-btn" onClick={signUserOut}>
                    Sign Out
                </button>

                {room && (
                    <button className="btn" onClick={leaveRoom}>
                        Leave Room
                    </button>
                )}
            </header>

            <section>
                {room ? (
                    <Chat room={room} />
                ) : (
                    <div className="room">
                        <label htmlFor="roomId">Room Id(No Space Allowed): </label>
                        <input
                            type="text"
                            id="roomId"
                            ref={roomInputRef}
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value.trim())}
                            className="inp"
                            placeholder="Enter Room Id..."
                        />
                        <button onClick={enterRoomClicked} className="btn">
                            Enter Room
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}

export default App
