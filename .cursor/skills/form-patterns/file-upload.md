# File Upload Pattern

## Schema

```typescript
// validations/upload.schema.ts
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Single file
export const avatarSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
    .optional(),
});

// Multiple files
export const gallerySchema = z.object({
  images: z
    .array(z.instanceof(File))
    .min(1, 'Upload at least 1 image')
    .max(5, 'Maximum 5 images')
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      'Each file must be less than 5MB'
    )
    .refine(
      (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
      'Only image files are allowed'
    ),
});

export type AvatarFormData = z.infer<typeof avatarSchema>;
export type GalleryFormData = z.infer<typeof gallerySchema>;
```

## Single File Upload

```typescript
// components/avatar-upload-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { avatarSchema, type AvatarFormData } from '../validations/upload.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';

export function AvatarUploadForm() {
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<AvatarFormData>({
    resolver: zodResolver(avatarSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('avatar', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    form.setValue('avatar', undefined);
    setPreview(null);
  };

  const onSubmit = async (data: AvatarFormData) => {
    if (!data.avatar) return;

    const formData = new FormData();
    formData.append('avatar', data.avatar);

    // Upload to server
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="avatar"
          render={() => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <Avatar className="h-20 w-20">
                    {preview ? (
                      <AvatarImage src={preview} />
                    ) : (
                      <AvatarFallback>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Input */}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or WebP. Max 5MB.
                    </p>
                  </div>

                  {/* Remove */}
                  {preview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Upload
        </Button>
      </form>
    </Form>
  );
}
```

## Multiple Files Upload

```typescript
// components/gallery-upload-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gallerySchema, type GalleryFormData } from '../validations/upload.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { X, ImagePlus } from 'lucide-react';

interface FilePreview {
  file: File;
  url: string;
}

export function GalleryUploadForm() {
  const [previews, setPreviews] = useState<FilePreview[]>([]);

  const form = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { images: [] },
  });

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
    form.setValue(
      'images',
      [...previews.map((p) => p.file), ...files].slice(0, 5)
    );
  };

  const removeFile = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    form.setValue(
      'images',
      newPreviews.map((p) => p.file)
    );
  };

  const onSubmit = async (data: GalleryFormData) => {
    const formData = new FormData();
    data.images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    await fetch('/api/upload-gallery', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Gallery Images (Max 5)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Previews Grid */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-5 gap-4">
                      {previews.map((preview, index) => (
                        <Card key={index} className="relative aspect-square overflow-hidden">
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {previews.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload ({5 - previews.length} remaining)
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Upload Gallery
        </Button>
      </form>
    </Form>
  );
}
```

## Drag and Drop

```typescript
// With react-dropzone
import { useDropzone } from 'react-dropzone';

function DropzoneUpload() {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      // Handle files
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Drag & drop files here, or click to select</p>
      )}
    </div>
  );
}
```

## Server Action Upload

```typescript
// actions/upload.ts
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadFileAction(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided' };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), 'public/uploads', filename);

  await writeFile(path, buffer);

  return { success: true, path: `/uploads/${filename}` };
}
```
