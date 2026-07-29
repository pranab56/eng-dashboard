import React, { Suspense } from "react";
import CategoryManagement from "./CategoryManagement";

export const metadata = {
  title: "Category Management - ENG Sports",
  description: "Manage main categories and subcategories",
};

export default function CategoryManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-10 text-gray-500 font-medium">
          Loading Category Management...
        </div>
      }
    >
      <CategoryManagement />
    </Suspense>
  );
}
