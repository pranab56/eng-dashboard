"use client"
import { useCreatePrivacyMutation, useGetPrivacyQuery } from '@/features/privacy/privacyApi';
import { PrivacyRecord } from '@/types/dashboard';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiInfo } from 'react-icons/fi';

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const joditConfig = {
  height: 600,
  readonly: false,
  placeholder: 'Start typing privacy policy...',
  buttons: [
    "bold", "italic", "underline", "strikethrough", "|",
    "ul", "ol", "outdent", "indent", "|",
    "font", "fontsize", "brush", "|",
    "align", "|",
    "link", "table", "|",
    "hr", "|",
    "undo", "redo", "fullsize"
  ],
  showCharsCounter: true,
  showWordsCounter: true,
  theme: "default",
}

const PrivacyPolicy = () => {
  const { data: privacyData, isLoading: isFetching } = useGetPrivacyQuery({});
  const [createPrivacy, { isLoading: isSaving }] = useCreatePrivacyMutation();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (privacyData?.data) {
      setContent((privacyData.data as PrivacyRecord).content || "");
    }
  }, [privacyData]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      const res = await createPrivacy({ content }).unwrap();
      if (res.success) {
        toast.success(res.message || "Privacy policy updated successfully");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update privacy policy"));
    }
  };

  if (isFetching) return <div className="flex items-center justify-center min-h-[400px]">Loading privacy policy...</div>;

  return (
    <div className="py-10 px-8  ">
      <div className="bg-white rounded-xl p-10 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-50">
          <div className="space-y-1">
            <h1 className="text-4xl font-medium text-gray-900">
              Privacy Policy
            </h1>
            <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
              <FiInfo className="text-blue-500" /> Manage the digital protection standards and data handling protocols for club members.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center cursor-pointer gap-3 px-10 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-sm font-medium text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving && <Loader className='w-5 h-5 animate-spin' />} Update Changes
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-50">
          <JoditEditor
            value={content}
            config={joditConfig}
            onBlur={(newContent) => setContent(newContent)}
          />
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
