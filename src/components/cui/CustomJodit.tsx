/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { myFetch } from "@/utils/myFetch";
import JoditEditor from "jodit-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CustomJodit = () => {
  const pathname = usePathname();
  const [content, setContent] = useState("");



  const getContent = async () => {
    toast.loading("Fetching...", { id: "fetch" });

    const res = await myFetch(`/${pathname.split("/")[1]}`, {
      method: "GET",
    })
    console.log(res);
    if (res?.data) {
      setContent(res?.data);
      toast.success("Fetched successfully!", { id: "fetch" });
    } else {
      toast.error(res?.message || "Failed to fetch!", { id: "fetch" });
    }
  };

  const handleOnSave = async () => {
    toast.loading("Updating...", { id: "update" });
    console.log(content);
  

    const res = await myFetch(`/${pathname.split("/")[1]}`, {
      method: "PATCH",
      body: content,
    });
    console.log(res);
    if (res?.data) {
      toast.success("Updated successfully!", { id: "update" });
      getContent();
    } else {
      toast.error(res?.message || "Failed to update!", { id: "update" });
    }
  };


  useEffect(() => {
    getContent();
  }, [pathname]);

  return (
    <>
      <div className="">
        <JoditEditor
          value={content}
          config={{ readonly: false, height: 600 }}
          onBlur={(newContent) => setContent(newContent)}
        />
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={handleOnSave} className="inline-block w-100 px-10 py-2 bg-clr hover:bg-clr/90 text-white border border-gray-400 rounded transitionClr">Save</button>
      </div>
    </>
  );
};

export default CustomJodit;