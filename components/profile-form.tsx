"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogOut, User, Mail, AlertCircle } from "lucide-react"
import { AvatarUpload } from "@/components/avatar-upload"
import { ModeToggle } from "@/components/mode-toggle"

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
}

export function ProfileForm({ user, profile }: { user: any; profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setIsLoading(true)
    setMessage(null)

    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
        email: user.email, // Ensure email is also stored/updated in profiles if needed
      }

      const { error } = await supabase.from("profiles").upsert(updates)
      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url)
    // Auto-save the avatar URL to profile immediately
    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: url,
        updated_at: new Date().toISOString(),
        email: user.email,
      }
      const { error } = await supabase.from("profiles").upsert(updates)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error saving avatar:", error)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
      setIsLoading(false)
    }
  }

  if (!supabase) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Supabase is not connected. Please check your environment variables.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center space-y-4">
            <AvatarUpload uid={user.id} url={avatarUrl} onUpload={handleAvatarUpload} email={user.email} />
            <div className="text-center">
              <CardTitle>{fullName || "User"}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="email" value={user.email} disabled className="pl-10 bg-gray-50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10"
                />
              </div>
            </div>

            {message && (
              <Alert
                variant={message.type === "error" ? "destructive" : "default"}
                className={message.type === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>

            <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks on your device</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Theme</Label>
            <div className="text-sm text-gray-500">
              Select your preferred color theme
            </div>
          </div>
          <ModeToggle />
        </CardContent>
      </Card>
      
      <div className="px-4">
        <Button variant="destructive" className="w-full" onClick={handleSignOut} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
