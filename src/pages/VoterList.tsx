
import { useParams } from 'react-router-dom';
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VoterList = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="container mx-auto p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Voter List: {id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Viewing details for voter list {id}</p>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default VoterList;
