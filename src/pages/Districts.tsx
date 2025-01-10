import { useState } from "react";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Districts = () => {
  const [htmlCode, setHtmlCode] = useState("");
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      toast({
        title: "Copied!",
        description: "HTML code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const previewHtml = () => {
    try {
      return { __html: htmlCode };
    } catch (error) {
      return { __html: "<p>Invalid HTML</p>" };
    }
  };

  return (
    <AuthContainer>
      <SidebarProvider>
        <div className="min-h-screen bg-background flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">HTML Code Viewer</h1>
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Input HTML</h2>
                  <Textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    placeholder="Enter your HTML code here..."
                    className="min-h-[300px] font-mono"
                  />
                </Card>

                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Preview</h2>
                  <div 
                    className="min-h-[300px] border rounded-md p-4 overflow-auto"
                    dangerouslySetInnerHTML={previewHtml()} 
                  />
                </Card>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthContainer>
  );
};

export default Districts;