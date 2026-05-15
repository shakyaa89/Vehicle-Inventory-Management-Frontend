import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";

import AdminNavbar from "@/components/dashboard/Admin/AdminNavbar";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportsApi } from "@/constants/Api";

type ReportPeriod = "daily" | "monthly" | "yearly";

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const buildUtcRange = (period: ReportPeriod, anchorDate: string) => {
  const [year, month, day] = anchorDate.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error("Select a valid date.");
  }

  const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  let endDate = new Date(startDate);

  if (period === "daily") {
    endDate = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
  }

  if (period === "monthly") {
    endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    startDate.setUTCDate(1);
  }

  if (period === "yearly") {
    endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0));
    startDate.setUTCMonth(0, 1);
  }

  return {
    from: startDate.toISOString(),
    to: endDate.toISOString(),
  };
};

const periodOptions: { value: ReportPeriod; label: string; description: string }[] = [
  {
    value: "daily",
    label: "Daily",
    description: "Generate a single-day financial snapshot.",
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Generate the full selected month.",
  },
  {
    value: "yearly",
    label: "Yearly",
    description: "Generate the full selected year.",
  },
];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [anchorDate, setAnchorDate] = useState(toInputDate(new Date()));
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedPeriod = useMemo(
    () => periodOptions.find((option) => option.value === period) ?? periodOptions[1],
    [period]
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { from, to } = buildUtcRange(period, anchorDate);
      const response = await ReportsApi.generateFinancialReportPdfApi(from, to);

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const nextUrl = URL.createObjectURL(pdfBlob);
      const fileName = `financial-report-${period}-${anchorDate}.pdf`;

      const downloadLink = document.createElement("a");
      downloadLink.href = nextUrl;
      downloadLink.download = fileName;
      downloadLink.click();

      setReportUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return nextUrl;
      });
      setDownloadFileName(fileName);

      toast.success("Financial report generated successfully.");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message ?? "Failed to generate the report.");
      } else {
        toast.error("Failed to generate the report.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (reportUrl) {
        URL.revokeObjectURL(reportUrl);
      }
    };
  }, [reportUrl]);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminNavbar />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Financial Reports</h2>
                  <p className="text-sm text-muted-foreground">
                    Generate daily, monthly, or yearly PDF reports directly from the backend.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <Card className="h-fit w-full">
                <CardHeader>
                  <CardTitle>Report settings</CardTitle>
                  <CardDescription>
                    Choose the period, select the anchor date, then generate the PDF.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Report period</Label>
                    <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a period" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{selectedPeriod.description}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-date">Anchor date</Label>
                    <Input
                      id="report-date"
                      type="date"
                      value={anchorDate}
                      onChange={(event) => setAnchorDate(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Daily uses the selected day, monthly uses its month, and yearly uses its year.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleGenerate} disabled={isGenerating} className="min-w-40">
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate report
                        </>
                      )}
                    </Button>

                    {reportUrl && (
                      <Button variant="outline" asChild>
                        <a href={reportUrl} download={downloadFileName ?? undefined}>
                          <Download className="mr-2 h-4 w-4" />
                          Download again
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="rounded-lg border border-dashed bg-background/70 p-4 text-sm text-muted-foreground">
                    {downloadFileName
                      ? `The latest report was downloaded as ${downloadFileName}.`
                      : "Click Generate report to download the PDF directly to your device."}
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}