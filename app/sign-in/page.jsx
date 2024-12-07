"use client";

import { useState, Suspense } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
  const [resetMessage, setResetMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSignIn = async () => {
    try {
      const res = await signInWithEmailAndPassword(email, password);
      if (!res || !res.user) {
        setResetMessage("Fallo al iniciar sesión, verifica tus credenciales.");
        return;
      }

      const token = await res.user.getIdToken();
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", res.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : "user";

      document.cookie = `firebaseAuthToken=${JSON.stringify({ uid: res.user.uid, role })}; path=/; secure; samesite=strict;`;

      setEmail("");
      setPassword("");

      router.push(redirectTo);
    } catch (e) {
      console.error(e);
      setResetMessage("Fallo al iniciar sesión, verifica tus credenciales.");
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setResetMessage("Ingresa tu email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Se ha enviado un email para restablecer tu contraseña. Revisa tu bandeja de entrada.");
    } catch (e) {
      setResetMessage("Error. Por favor revisa el email");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">{showReset ? "Reset Password" : "Iniciar sesión"}</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />

        {!showReset && (
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        )}

        {!showReset ? (
          <>
            <button
              onClick={handleSignIn}
              className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
              disabled={loading}
            >
              Iniciar sesión
            </button>
            <button onClick={() => setShowReset(true)} className="mt-4 text-indigo-500 underline">
              ¿Has olvidado tu contraseña?
            </button>
            <br />
            <button onClick={() => router.push("/sign-up")} className="mt-4 text-indigo-500 underline">
              Regístrate
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handlePasswordReset}
              className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
            >
              Enviar email
            </button>
            <button onClick={() => setShowReset(false)} className="mt-4 text-indigo-500 underline">
              Volver al inicio de sesión
            </button>
          </>
        )}

        {resetMessage && <p className="text-sm text-red-500 mt-4">{resetMessage}</p>}
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SignInContent />
    </Suspense>
  );
}
