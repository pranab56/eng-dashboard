/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InputField from '@/components/form/InputField';
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField';
import SubmitButton from '@/components/buttons/SubmitButton';
import { useUpdatePlayerMutation } from '@/features/player/playerApi';
import { TPlayer } from '@/types/columnTypes';
import { toast } from 'sonner';
import { formatImagePath } from '@/utils/formatImagePath';

const playerEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().min(1, "Position is required"),
  marketValue: z.number().min(0, "Market value must be non-negative"),
  image: z.any().optional(),
});

type PlayerEditFormValues = z.infer<typeof playerEditSchema>;

interface PlayerEditModalProps {
  player: TPlayer | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerEditModal = ({ player, isOpen, onClose }: PlayerEditModalProps) => {
  const [updatePlayer, { isLoading }] = useUpdatePlayerMutation();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PlayerEditFormValues>({
    resolver: zodResolver(playerEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      position: "",
      marketValue: 0,
      image: null,
    }
  });

  useEffect(() => {
    if (player) {
      reset({
        firstName: player.firstName || "",
        lastName: player.lastName || "",
        position: player.position || "",
        marketValue: player.marketValue || 0,
        image: player.profile ? formatImagePath(player.profile) : null,
      });
    }
  }, [player, reset]);

  const onSubmit = async (data: PlayerEditFormValues) => {
    if (!player?._id) {
      toast.error("Player ID missing");
      return;
    }

    try {
      const formData = new FormData();

      const jsonData = {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        marketValue: Number(data.marketValue),
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      }

      await updatePlayer({ id: player._id, data: formData }).unwrap();
      toast.success("Player updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  if (!player) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Edit Player Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              name="firstName"
              title="First Name"
              placeholder="e.g. Cristiano"
              register={register}
              error={errors.firstName}
            />
            <InputField
              name="lastName"
              title="Last Name"
              placeholder="e.g. Ronaldo"
              register={register}
              error={errors.lastName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              name="position"
              title="Position"
              placeholder="e.g. Forward"
              register={register}
              error={errors.position}
            />
            <InputField
              name="marketValue"
              title="Market Value ($)"
              type="number"
              placeholder="e.g. 90000"
              register={register}
              error={errors.marketValue}
              registerOptions={{ valueAsNumber: true }}
            />
          </div>

          <ImageUploadField
            name="image"
            label="Player Profile Image"
            control={control}
            error={errors.image as any}
          >
            <ImageChildrenComponent />
          </ImageUploadField>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              title="Update Player"
              isSubmitting={isLoading}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerEditModal;
