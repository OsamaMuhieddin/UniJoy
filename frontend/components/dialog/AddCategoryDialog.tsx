"use client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { name: string; description: string }) => void;
}

export default function AddCategoryDialog({ open, onOpenChange, onSave }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        if (!name.trim() || !description.trim()) return;
        onSave({ name: name.trim(), description: description.trim() });
        setName("");
        setDescription("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>Enter the name and description of the new host category.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Category name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!name || !description}>
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}