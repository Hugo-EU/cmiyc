'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase/config';
import AlertHelper from "@/app/helpers/alerts";

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const validatePassword = (password) => {
    const minLength = /.{6,}/;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasNumberOrSpecialChar = /[\d!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (!hasUpperCase.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula.';
    }
    if (!hasLowerCase.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula.';
    }
    if (!hasNumberOrSpecialChar.test(password)) {
      return 'La contraseña debe contener al menos un número o carácter especial.';
    }
    return '';
  };

  const handleSignUp = async () => {
    const validationMessage = validatePassword(password);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'user',
      });

      const token = await user.getIdTokenResult();
      document.cookie = `firebaseAuthToken=${JSON.stringify({ uid: user.uid })}; path=/;`;

      AlertHelper.success('Usuario registrado');
      router.push('/complete-profile');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setErrorMessage('Error al registrar usuario.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Regístrate</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
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
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
        <button
          onClick={handleSignUp}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default SignUp;
