import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Pencil, Star, Trash2 } from "lucide-react";
import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ReviewApi } from "@/constants/Api";
import type { Review, ReviewUpdateData } from "@/types/review";

const ratingOptions = [1, 2, 3, 4, 5];

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

    const resetForm = () => {
        setEditingReviewId(null);
        setRating("5");
        setComment("");
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await ReviewApi.getAllReviewsApi();
            setReviews(response.data ?? []);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to load reviews.");
            } else {
                toast.error("Failed to load reviews.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleEdit = (review: Review) => {
        setEditingReviewId(review.id);
        setRating(review.rating.toString());
        setComment(review.comment);
        setIsDialogOpen(true);
    };

    const handleDelete = async (reviewId: number) => {
        const confirmed = window.confirm("Delete this review?");
        if (!confirmed) return;

        setDeletingReviewId(reviewId);
        try {
            await ReviewApi.deleteReviewApi(reviewId);
            setReviews(reviews.filter((review) => review.id !== reviewId));
            toast.success("Review deleted successfully.");
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to delete review.");
            } else {
                toast.error("Failed to delete review.");
            }
        } finally {
            setDeletingReviewId(null);
        }
    };

    const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingReviewId) {
            toast.error("Select a review to edit.");
            return;
        }

        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            toast.error("Please enter a comment.");
            return;
        }

        const updateData: ReviewUpdateData = {
            rating: Number(rating),
            comment: trimmedComment,
        };

        setIsSubmitting(true);
        try {
            const response = await ReviewApi.updateReviewApi(editingReviewId, updateData);
            const updatedReview = response.data as Review;

            setReviews(
                reviews.map((review) =>
                    review.id === editingReviewId ? { ...review, ...updatedReview } : review
                )
            );
            toast.success("Review updated successfully.");
            closeDialog();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to update review.");
            } else {
                toast.error("Failed to update review.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderRatingStars = (value: number) => {
        return (
            <div className="flex items-center gap-1">
                {ratingOptions.map((ratingValue) => {
                    const isActive = ratingValue <= value;
                    return (
                        <Star
                            key={ratingValue}
                            className={`h-4 w-4 ${isActive ? "text-amber-500" : "text-muted-foreground"}`}
                            fill={isActive ? "currentColor" : "none"}
                        />
                    );
                })}
                <span className="text-xs text-muted-foreground">{value} / 5</span>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <AdminNavbar />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
                            <p className="text-sm text-muted-foreground">
                                Edit or remove customer feedback across all appointments.
                            </p>
                        </div>

                        {isLoading ? (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                    Loading reviews...
                                </CardContent>
                            </Card>
                        ) : reviews.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                    No reviews found.
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>All reviews</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="px-4 py-3 text-left font-semibold">Review</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Appointment</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Rating</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Comment</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reviews.map((review) => (
                                                    <tr
                                                        key={review.id}
                                                        className="border-b hover:bg-muted/30 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 font-medium">#{review.id}</td>
                                                        <td className="px-4 py-3">{review.customerId}</td>
                                                        <td className="px-4 py-3">{review.appointmentId}</td>
                                                        <td className="px-4 py-3">{renderRatingStars(review.rating)}</td>
                                                        <td className="px-4 py-3">{review.comment}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleEdit(review)}
                                                                    disabled={isSubmitting || deletingReviewId !== null}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDelete(review.id)}
                                                                    disabled={isSubmitting || deletingReviewId === review.id}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit review</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Rating</Label>
                            <div className="flex items-center gap-2">
                                {ratingOptions.map((value) => {
                                    const isActive = value <= Number(rating);

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setRating(value.toString())}
                                            className="rounded-full p-1 transition hover:bg-muted"
                                            aria-label={`Rate ${value} out of 5`}
                                        >
                                            <Star
                                                className={`h-5 w-5 ${
                                                    isActive ? "text-amber-500" : "text-muted-foreground"
                                                }`}
                                                fill={isActive ? "currentColor" : "none"}
                                            />
                                        </button>
                                    );
                                })}
                                <span className="text-sm text-muted-foreground">{rating} / 5</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review-comment">Comment</Label>
                            <textarea
                                id="review-comment"
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 md:text-sm"
                                placeholder="Update the review comment"
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={closeDialog} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
