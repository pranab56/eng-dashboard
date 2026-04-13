/* eslint-disable react-hooks/exhaustive-deps */
import { myFetch } from '@/utils/myFetch';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
const joditConfig = {
  height: 550,
  readonly: false,
  buttons: [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "ul",
    "ol",
    "outdent",
    "indent",
    "|",
    "font",
    "fontsize",
    "brush", // clear formatting
    "|",
    "align",
    "|",
    "link",
    "table",
    "|",
    "hr",
    "|",
    "undo",
    "redo",
    "fullsize"
  ],
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
}

// Dynamically import JoditEditor and disable SSR
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const CustomJodit = ({ url }: { url: string }) => {
  const [content, setContent] = useState("");

  const getContent = async () => {
    const res = await myFetch(`/settings/${url}`, {
      method: "GET",
    });
    //console.log(res);
    if (res.success) {
      setContent(res?.data?.[url]);
    } else {
      toast.error(res?.message || "Failed to fetch!");
    }
  };

  const handleOnSave = async () => {
    toast.loading("Updating...", { id: "update" });
    //console.log(content);

    const res = await myFetch(`/settings`, {
      method: "PATCH",
      body: {
        [url]: content,
      },
    });
    //console.log(res);
    if (res?.data) {
      toast.success("Updated successfully!", { id: "update" });
      getContent();
    } else {
      toast.error(res?.message || "Failed to update!", { id: "update" });
    }
  };

  useEffect(() => {
    getContent();
  }, [url]);

  return (
    <>
      <div>
        <JoditEditor
          value={content}
          config={joditConfig}
          onBlur={(newContent) => setContent(newContent)}
        />
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={handleOnSave} className="inline-block w-100 px-10 py-2 bg-black hover:bg-black/80 text-white border border-gray-400 rounded transitionClr">Save</button>
      </div>
    </>
  );
};

export default CustomJodit;
