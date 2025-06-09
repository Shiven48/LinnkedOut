'use client'

import { categories, Platforms } from '@/services/common/constants';
import { Category, Platfrom } from '@/services/common/types';
import { Plus, Link2, Hash, Sparkles, Filter, Search, X } from 'lucide-react';
import React, { ChangeEvent, useState } from 'react';

type UrlValidation = {
  isValid: boolean | null,
  platform: any | null;
} 

type FormDataType = {
    url: string,
    category: string,
    customTags: string[],
    fetchSimilar: boolean,
    similarityLevel: string,
    contentType: string
  }

export const PostInputForm:React.FC = () => {

  const [formData, setFormData] = useState<FormDataType>({
    url: '',
    category: '',
    customTags: [],
    fetchSimilar: true,
    similarityLevel: 'medium',
    contentType: 'auto'
  });
  const [newTag, setNewTag] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlValidation, setUrlValidation] = useState<UrlValidation>({ isValid: null, platform: null });

  const platformIconsObj: Record<string, string> = {};
  Platforms().forEach((platform: Platfrom) => {
    platformIconsObj[platform.name] = `${platform.icon}.svg`;
  });


  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url:string = e.target.value;
    setFormData({ ...formData, url });
    validateUrl(url);
  };

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlValidation({ isValid: null, platform: null });
      return;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/;
    const redditRegex = /^(https?:\/\/)?(www\.)?reddit\.com/;
    
    if (youtubeRegex.test(url)) {
      setUrlValidation({ isValid: true, platform: 'youtube' });
    } else if (redditRegex.test(url)) {
      setUrlValidation({ isValid: true, platform: 'reddit' });
    } else if (url.startsWith('http')) {
      setUrlValidation({ isValid: true, platform: 'other' });
    } else {
      setUrlValidation({ isValid: false, platform: null });
    }

  };

  const addTag = () => {
    if (newTag && !formData.customTags.includes(newTag)) {
      setFormData({
        ...formData,
        customTags: [...formData.customTags, newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      customTags: formData.customTags.filter(tag => tag !== tagToRemove)
    });
  };

  // See into this more
const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  setIsSubmitting(true);

  setTimeout(() => {
    setIsSubmitting(false);
    alert('Content submitted successfully!');
  }, 2000);
};

  return (
    <div className="bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl">
              <Plus className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white">Add Content</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Submit URLs from YouTube, Reddit, and other platforms to curate content for your feed. 
            Our AI will find similar posts and categorize them automatically.
          </p>
        </div>

        <div className="space-y-8">

          {/* URL Input Section */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Content URL</h2>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  placeholder="Paste your YouTube, Reddit, or any content URL here..."
                  className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 pr-12"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {urlValidation.isValid === true && urlValidation.platform !== null && platformIconsObj[urlValidation.platform]}
                  {urlValidation.isValid === false && <X className="w-5 h-5 text-red-500" />}
                </div>
              </div>
              
              {urlValidation.isValid === false && (
                <p className="text-red-400 text-sm">Please enter a valid URL starting with http:// or https://</p>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Category</h2>
              <span className="text-sm text-gray-400">(Optional)</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories().map((category:Category) => (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.title })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.category === category.title
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-900'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-white font-medium text-sm">{category.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tags */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Custom Tags</h2>
              <span className="text-sm text-gray-400">(Optional)</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a custom tag..."
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              
              {formData.customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.customTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Features */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">AI Features</h2>
            </div>
            
            <div className="space-y-6">

              {/* Fetch Similar Content */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Find Similar Content</h3>
                  <p className="text-gray-400 text-sm">Automatically discover related posts and videos</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fetchSimilar: !formData.fetchSimilar })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.fetchSimilar ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.fetchSimilar ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Similarity Level */}
              {formData.fetchSimilar && (
                <div>
                  <h3 className="text-white font-medium mb-3">Similarity Level</h3>
                  <div className="flex gap-3">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, similarityLevel: level })}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.similarityLevel === level
                            ? 'bg-yellow-400 text-black'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.url || urlValidation.isValid !== true || isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Submit & Find Content
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};