import { AuthForm } from "@/components/auth-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Finance Tracker</h1>
          <p className="text-gray-500">Track your expenses with ease</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}
