"use client"
import { useCreateTermsMutation, useGetTermsQuery } from '@/features/terms/termsApi';
import { Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiInfo } from 'react-icons/fi';


const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const joditConfig = {
  height: 600,
  readonly: false,
  placeholder: 'Start typing legal terms...',
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

const TermsCondition = () => {
  const { data: termsData, isLoading: isFetching } = useGetTermsQuery({});
  const [createTerms, { isLoading: isSaving }] = useCreateTermsMutation();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (termsData?.data) {
      setContent(termsData.data.content || "");
    }
  }, [termsData]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      const res = await createTerms({ content }).unwrap();
      if (res.success) {
        toast.success(res.message || "Terms updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update terms");
    }
  };

  if (isFetching) return <div className="flex items-center justify-center min-h-[400px]">Loading terms...</div>;

  return (
    <div className="py-10 px-8 space-y-8">
      <div className="bg-white rounded-xl p-10 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-50">
          <div className="space-y-1">
            <h1 className="text-4xl font-medium text-gray-900">
              Terms & Conditions
            </h1>
            <p className="text-gray-400 font-medium text-sm flex items-center gap-2">
              <FiInfo className="text-blue-500" /> Manage the official legal framework and user agreements for the enterprise platform.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center cursor-pointer gap-3 px-10 py-4 bg-yellow-600 hover:bg-yellow-700 text-white hover:text-white rounded-sm font-medium text-sm transition-all shadow-xl shadow-gray-300"
          >

            {isSaving && <Loader className='w-5 h-5 animate-spin' />} Update Changes
          </button>
        </div>

        <div className="rounded-xl overflow-hidden">
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

export default TermsCondition