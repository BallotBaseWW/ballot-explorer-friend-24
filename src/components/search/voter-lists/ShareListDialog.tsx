import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareListDialogProps {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareListDialog({ listId, open, onOpenChange }: ShareListDialogProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      setIsSubmitting(true);

      // Get the user ID for the email
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !users) {
        throw new Error('User not found');
      }

      // Create the share record
      const { error: shareError } = await supabase
        .from('list_shares')
        .insert({
          list_id: listId,
          shared_with: users.id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (shareError) throw shareError;

      toast({
        title: "List shared successfully",
        description: `List has been shared with ${email}`,
      });

      onOpenChange(false);
      setEmail("");
    } catch (error: any) {
      console.error('Error sharing list:', error);
      toast({
        title: "Error sharing list",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Share with (email)</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={!email || isSubmitting}
            >
              {isSubmitting ? "Sharing..." : "Share"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}