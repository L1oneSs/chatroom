import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useCreateWorkspaceModal } from "../store/use-create-workspace-modal"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const CreateWorkspaceModal = () => {
    const [open, setOpen] = useCreateWorkspaceModal();

    const {mutate, isPending, isError, isSuccess, data, error} = useCreateWorkspace();
    const [name, setName] = useState("");
    const router = useRouter();

    const handleClose = () => {
        setOpen(false);
        setName("");
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        mutate({name}, {
            onSuccess(id){
                toast.success("Workspace created")
                router.push(`/workspaces/${id}`)
                handleClose();
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        disabled={isPending}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="Workspace Name"
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}