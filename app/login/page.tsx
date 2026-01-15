'use client';

import LoginPage from '@/components/gaming-login';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  token?: string;
  message?: string;
  user?: { id: string; name: string; profilePicture?: string };
}

const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function Login() {
  const router = useRouter();

  // ✅ Hooks at top level
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ✅ Single submit handler
  const handleLogin = async (
    email:string,
    password: string,
    remember: boolean,
    isRegister: boolean,
    username: string,
    fullName: string,
    country: string,
    confirmPassword: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Submitting form with:", { email, password, remember, isRegister, username, confirmPassword , fullName,country});
      if(isRegister && (!username || !confirmPassword )) throw new Error("Username and Confirm Password are required for registration");

      if(isRegister && password !== confirmPassword) throw new Error("Passwords do not match");

      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const body = isRegister
        ? {
            userEmailId: email,
            password: password,
            username: username,
            userFullName: fullName,
            country: country
          }
        : {
            userEmailId:  email,
            password: password
          };


      const response = await fetch(`${baseurl}${endpoint}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to fetch user data (${response.status})`);
        }

        router.push("/home");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12">
      <LoginPage.VideoBackground videoUrl="https://media.istockphoto.com/id/1497475686/video/the-white-wooden-king-chess-piece-falls-onto-the-chessboard-and-smashes-the-black-chess.mp4?s=mp4-640x640-is&k=20&c=wxmiPGt6Bqq1rdYOykjx2p_25AGT9RHSMsebipHF9fw=" />
      {/* https://videos.pexels.com/video-files/8128311/8128311-uhd_2560_1440_25fps.mp4 
      https://pixabay.com/videos/download/video-32386_medium.mp4
      https://media.istockphoto.com/id/1358237508/video/destruction-of-chess-figures-series-slow-motion-exploding-figures-and-pawns-symbolic.mp4?s=mp4-640x640-is&k=20&c=GnUp6tuXaFIgLupZH336zE5V_CC5SccDSYw9aYy0nvE=
      */}
      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <LoginPage.LoginForm
          onSubmit={handleLogin}
        />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm z-20">
        © 2025 NexusGate. All rights reserved.
      </footer>
    </div>
  );
}
