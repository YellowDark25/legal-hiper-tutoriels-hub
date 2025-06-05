
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoIcon, TagIcon, FolderIcon, UploadIcon } from 'lucide-react';
import VideoManager from '@/components/admin/VideoManager';
import CategoryManager from '@/components/admin/CategoryManager';
import TagManager from '@/components/admin/TagManager';
import VideoUpload from '@/components/admin/VideoUpload';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Sistema de Administração
          </h1>
          <p className="text-gray-600">
            Gerencie vídeos, categorias e tags dos seus tutoriais
          </p>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <VideoIcon className="w-4 h-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadIcon className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderIcon className="w-4 h-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Tags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <VideoManager />
          </TabsContent>

          <TabsContent value="upload">
            <VideoUpload />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="tags">
            <TagManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
