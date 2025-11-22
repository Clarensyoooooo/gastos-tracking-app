"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AvatarUploadProps {
  uid: string
  url: string | null
  onUpload: (url: string) => void
  email?: string
}

export function AvatarUpload({ uid, url, onUpload, email }: AvatarUploadProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      onUpload(data.publicUrl)

      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group">
      <Avatar className="h-24 w-24 border-2 border-white shadow-sm">
        <AvatarImage src={url || ""} alt="Avatar" />
        <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
          {email ? email.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="absolute bottom-0 right-0">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full h-8 w-8 shadow-md"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>
      <input type="file" id="single" accept="image/*" onChange={uploadAvatar} ref={fileInputRef} className="hidden" />
    </div>
  )
}
