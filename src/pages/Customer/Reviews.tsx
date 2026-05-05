import CustomerTopbar from "@/components/dashboard/Customer/CustomerNavbar";
import CustomerSidebar from "@/components/dashboard/Customer/CustomerSidebar";

export default function ReviewsPage() {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <CustomerSidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <CustomerTopbar />
                <main className="flex-1 px-4 py-6 md:px-8 md:py-8">

                </main>
            </div>
        </div>
    );
}