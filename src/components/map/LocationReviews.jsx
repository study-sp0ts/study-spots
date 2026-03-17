import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className="hover:scale-110 transition-transform">
          <Star className={cn("h-5 w-5", s <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

export default function LocationReviews({ locationId, user }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery({
    queryKey: ["locationReviews", locationId],
    queryFn: () => base44.entities.LocationReview.filter({ location_id: locationId }),
  });

  const myReview = reviews.find((r) => r.user_email === user?.email);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (myReview) {
        return base44.entities.LocationReview.update(myReview.id, {
          rating: rating || undefined,
          comment: comment || undefined,
        });
      }
      return base44.entities.LocationReview.create({
        location_id: locationId,
        user_email: user.email,
        user_name: user.full_name,
        rating: rating || undefined,
        comment: comment || undefined,
      });
    },
    onSuccess: () => {
      setComment("");
      setRating(0);
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["locationReviews", locationId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.LocationReview.delete(myReview.id),
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["locationReviews", locationId] });
    },
  });

  const startEdit = () => {
    setComment(myReview?.comment || "");
    setRating(myReview?.rating || 0);
    setEditing(true);
  };

  const showForm = user && (!myReview || editing);

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <MessageSquare className="h-3.5 w-3.5" /> Reviews & Comments
      </h3>

      {reviews.length === 0 && <p className="text-xs text-muted-foreground mb-3">No reviews yet. Be the first!</p>}

      <div className="space-y-3 mb-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-secondary rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {r.user_picture
                  ? <img src={r.user_picture} alt="" className="w-6 h-6 rounded-full object-cover" />
                  : <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{(r.user_name || r.user_email || "?")[0]}</div>}
                <span className="text-xs font-semibold">{r.user_name || r.user_email}</span>
              </div>
              <div className="flex items-center gap-1">
                {r.rating && (
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => <Star key={s} className={cn("h-3 w-3", s <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />)}
                  </div>
                )}
                {r.user_email === user?.email && !editing && (
                  <button onClick={startEdit} className="ml-1 p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            <p className="text-xs text-muted-foreground/60 mt-1">{format(new Date(r.created_date), "MMM d, yyyy")}</p>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="space-y-2">
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)..."
            rows={2}
            className="resize-none rounded-xl text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => (rating > 0 || comment.trim()) && submitMutation.mutate()}
              disabled={rating === 0 && !comment.trim()} className="rounded-xl">
              {editing ? "Save" : "Post Review"}
            </Button>
            {editing && (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="rounded-xl">Cancel</Button>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate()} className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      ) : !user ? (
        <p className="text-xs text-muted-foreground italic">Log in to leave a review.</p>
      ) : myReview && !editing ? null : null}
    </div>
  );
}