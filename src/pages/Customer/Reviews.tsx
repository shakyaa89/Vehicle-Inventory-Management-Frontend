import CustomerTopbar from "@/components/dashboard/Customer/CustomerNavbar";
import CustomerSidebar from "@/components/dashboard/Customer/CustomerSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AppointmentApi, ReviewApi } from "@/constants/Api";
import { useAuthStore } from "@/store/authStore";
import type { Appointment } from "@/types/appointment";
import type { Review, ReviewData } from "@/types/review";
import { AxiosError } from "axios";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ratingOptions = [1, 2, 3, 4, 5];

export default function ReviewsPage() {
    const { user } = useAuthStore();
    const customerId = Number(user?.id ?? 0);

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const [isCreatingReview, setIsCreatingReview] = useState(false);

    const [appointmentId, setAppointmentId] = useState("");
    const [rating, setRating] = useState("5");
    const [comment, setComment] = useState("");

    const appointmentById = new Map(appointments.map((appointment) => [appointment.id, appointment]));
    const reviewedAppointmentIds = new Set(reviews.map((review) => review.appointmentId));
    const availableAppointments = appointments.filter(
        (appointment) => !reviewedAppointmentIds.has(appointment.id)
    );

    const resetForm = () => {
        setAppointmentId("");
        setRating("5");
        setComment("");
    };

    const fetchAppointments = async () => {
        if (!customerId) return;

        setIsLoadingAppointments(true);
        try {
            const response = await AppointmentApi.getAppointmentsByCustomerApi(customerId);
            setAppointments(response.data ?? []);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to load appointments.");
            } else {
                toast.error("Failed to load appointments.");
            }
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const fetchReviews = async () => {
        if (!customerId) return;

        setIsLoadingReviews(true);
        try {
            const response = await ReviewApi.getReviewsByCustomerApi(customerId);
            setReviews(response.data ?? []);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to load reviews.");
            } else {
                toast.error("Failed to load reviews.");
            }
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handleCreateReview = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!customerId) {
            toast.error("Please log in again.");
            return;
        }

        if (!appointmentId) {
            toast.error("Please select an appointment.");
            return;
        }

        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            toast.error("Please enter a comment.");
            return;
        }

        const reviewData: ReviewData = {
            customerId,
            appointmentId: Number(appointmentId),
            rating: Number(rating),
            comment: trimmedComment,
        };

        setIsCreatingReview(true);
        try {
            await ReviewApi.createReviewApi(reviewData);
            toast.success("Review submitted successfully.");
            resetForm();
            await fetchReviews();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message ?? "Failed to submit review.");
            } else {
                toast.error("Failed to submit review.");
            }
        } finally {
            setIsCreatingReview(false);
        }
    };

    useEffect(() => {
        if (!customerId) return;
        fetchAppointments();
        fetchReviews();
    }, [customerId]);

    return (
        <div className="flex min-h-screen bg-muted/30">
            <CustomerSidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <CustomerTopbar />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">Reviews</h2>
                            <p className="text-sm text-muted-foreground">
                                Share feedback on your completed appointments.
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Leave a review</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateReview} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Appointment</Label>
                                        <Select value={appointmentId} onValueChange={setAppointmentId}>
                                            <SelectTrigger className="w-full" disabled={isLoadingAppointments}>
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingAppointments
                                                            ? "Loading appointments..."
                                                            : "Select appointment"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableAppointments.length === 0 ? (
                                                    <SelectItem value="__empty" disabled>
                                                        No appointments available for review
                                                    </SelectItem>
                                                ) : (
                                                    availableAppointments.map((appointment) => {
                                                        const label = `${new Date(
                                                            appointment.scheduledAt
                                                        ).toLocaleString()} - ${appointment.vehicleMake || `Vehicle #${appointment.vehicleId}`}`;
                                                        return (
                                                            <SelectItem
                                                                key={appointment.id}
                                                                value={appointment.id.toString()}
                                                            >
                                                                {label}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

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
                                                                isActive
                                                                    ? "text-amber-500"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                            fill={isActive ? "currentColor" : "none"}
                                                        />
                                                    </button>
                                                );
                                            })}
                                            <span className="text-sm text-muted-foreground">
                                                {rating} / 5
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="comment">Comment</Label>
                                        <textarea
                                            id="comment"
                                            value={comment}
                                            onChange={(event) => setComment(event.target.value)}
                                            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 md:text-sm"
                                            placeholder="Share your experience..."
                                            required
                                        />
                                    </div>

                                    <Button type="submit" disabled={isCreatingReview}>
                                        {isCreatingReview ? "Submitting..." : "Submit review"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {isLoadingReviews ? (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                    Loading reviews...
                                </CardContent>
                            </Card>
                        ) : reviews.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="p-10 text-center text-sm text-muted-foreground">
                                    No reviews submitted yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your reviews</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="px-4 py-3 text-left font-semibold">Appointment</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Rating</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Comment</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reviews.map((review) => {
                                                    const appointment = appointmentById.get(review.appointmentId);
                                                    const appointmentLabel = appointment
                                                        ? `#${appointment.id} · ${new Date(appointment.scheduledAt).toLocaleString()}`
                                                        : `#${review.appointmentId}`;

                                                    return (
                                                        <tr
                                                            key={review.id}
                                                            className="border-b hover:bg-muted/30 transition-colors"
                                                        >
                                                            <td className="px-4 py-3 font-medium">
                                                                {appointmentLabel}
                                                            </td>
                                                            <td className="px-4 py-3">{review.rating} / 5</td>
                                                            <td className="px-4 py-3">{review.comment}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}