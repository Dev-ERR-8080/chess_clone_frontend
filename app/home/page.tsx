"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/rainbow-borders-button";
import { Hand } from "lucide-react";
import ChessUserHome from "@/components/dashboard-with-collapsible-sidebar";

// Define the User interface to match your Spring Boot 'User' Entity
interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
  pfpUrl: string;
  name: string;
  country: string | null;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const fetchUserByEmail = async () => {
      
      try {
        // 2. PathVariable implementation: emailId is passed in the URL
        const response = await fetch("http://localhost:8080/user/me", {
            method: "GET",
            credentials: "include",
            headers: {
                "Accept": "application/json",
            }
        });


        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to fetch user data (${response.status})`);
        }

        const data = await response.json();

        if (data) {
          setUser(data);
          console.log(data);
        } else {
          setError("User profile is empty.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserByEmail();
  }, []);

  const handlelogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/logout", { 
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
        }
      });

      if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to fetch user data (${response.status})`);
        }

      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Failed to logout");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-purple-500">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-6">
        <ChessUserHome />
    </div>
  );
}