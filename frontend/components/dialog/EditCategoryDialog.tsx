// components/EditCategoryDialog.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

type EditCategoryDialogProps = {
    open: boolean;
    category: {
        id: string;
        name: string;
        description: string;
    } | null;
    onCancel: () => void;
    onSave: (values: { name: string; description: string }) => void;
};

export default function EditCategoryDialog({
    open,
    category,
    onCancel,
    onSave,
}: EditCategoryDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (category) {
            setName(category.name || "");
            setDescription(category.description || "");
        }
    }, [category]);

    const handleSubmit = () => {
        if (name.trim().length < 3 || description.trim().length < 5) return;
        onSave({ name, description });
    };

    return (
        <Dialog open={open} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Host Category</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Category Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Textarea
                        placeholder="Category Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={name.length < 3 || description.length < 5}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}