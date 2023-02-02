import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../../firebase.config"

import Cookies from "universal-cookie"
const cookies = new Cookies()

const Auth = ({ setIsAuth }) => {
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider)
            console.log({ result })
            cookies.set("auth-token", result.user.refreshToken)
            setIsAuth(true)
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <h1 style={{ textAlign: "center" }}>Welcome to Superchat </h1>
            <div className="auth">
                <h2>Sign In with Google to Continue</h2>
                <button className="btn" onClick={signInWithGoogle}>
                    Sign IN with Google
                </button>
            </div>
        </>
    )
}

export default Auth
