// src/lib/auth.ts
export interface LoginResponse {
  token?: string;
  message?: string;
  user?: { id: string; name: string };
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ userEmailId: email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to fetch user data (${response.status})`);
        }

  return data;
}