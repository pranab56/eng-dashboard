/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import * as z from 'zod'

import { useCreateRewordMutation, useGetSingleRewordQuery, useUpdateRewordMutation } from '@/features/rewordProduct/rewordApi'
import { baseURL } from '@/utils/BaseURL'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

// Form Validation Schema
const rewardsSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  point: z.number().min(1, "Point must be at least 1"),
  productType: z.string().min(1, "Product type is required"),
  logo: z.any().optional(),
});

type RewardsFormValues = z.infer<typeof rewardsSchema>

const productTypeOptions = [
  { label: "Coffee", value: "Coffee" },
  { label: "Non-Coffee", value: "nonCoffee" },
]


const CreateReward = () => {
  const { setHeaders } = useHeaders()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rewardId = searchParams.get("id")
  const isEditMode = !!rewardId

  const [createReward, { isLoading: isCreating }] = useCreateRewordMutation()
  const [updateReward, { isLoading: isUpdating }] = useUpdateRewordMutation()
  const { data: rewardData, isFetching } = useGetSingleRewordQuery(rewardId, { skip: !isEditMode })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsSchema),
    defaultValues: {
      brand: '',
      point: 0,
      productType: 'Coffee',
    }
  })

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Reward" : "Create New Reward",
      des: isEditMode ? "Modify existing reward item and valuation." : "Add a new redeemable item to the player ecosystem."
    })
  }, [setHeaders, isEditMode])

  useEffect(() => {
    if (rewardData?.data) {
      const reward = rewardData.data;
      reset({
        brand: reward.brand,
        point: reward.point,
        productType: reward.productType,
        logo: reward.image ? `${baseURL}${reward.image}` : undefined,
      });
    }
  }, [rewardData, reset])


  const onSubmit = async (data: RewardsFormValues) => {
    try {
      const formData = new FormData();

      const jsonData = {
        brand: data.brand,
        point: data.point,
        productType: data.productType,
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (isEditMode) {
        const res = await updateReward({ id: rewardId, data: formData }).unwrap();
        if (res.success) {
          toast.success(res.message || "Reward updated successfully");
          router.push("/rewards-redemption");
        }
      } else {
        const res = await createReward(formData).unwrap();
        if (res.success) {
          toast.success(res.message || "Reward created successfully");
          router.push("/rewards-redemption");
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} reward`);
    }
  }

  if (isEditMode && isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading reward data...</div>
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto py-5 px-6 space-y-8">
      <div className='flex items-center justify-between'>
        <BackButton />
        <SubmitButton isSubmitting={isCreating || isUpdating} title={isEditMode ? "Update Reward" : "Save Reward"} />
      </div>
      {/* Basic Information Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Basic Information</h2>

        <div className="space-y-8">
          <InputField name="brand" title="Brand / Product Name" placeholder="e.g. Starbucks Latte" register={register} error={errors.brand} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SelectField name="productType" label="Product Category" control={control} error={errors.productType} options={productTypeOptions} />
            <InputField name="point" type="number" title="Points Required" placeholder="Enter points valuation" register={register} error={errors.point} registerOptions={{ valueAsNumber: true }} />
          </div>
        </div>
      </section>

      {/* Media Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Reward Media</h2>

        <div className="w-full">
          <ImageUploadField name="logo" label="Reward Image" control={control} error={errors.logo as any}>
            <ImageChildrenComponent maxSizeMB={5} />
          </ImageUploadField>
        </div>
      </section>
    </form>
  )
}

export default CreateReward;