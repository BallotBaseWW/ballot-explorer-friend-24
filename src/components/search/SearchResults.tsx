import { Database } from "@/integrations/supabase/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PersonalSection } from "./voter-sections/PersonalSection";
import { AddressSection } from "./voter-sections/AddressSection";
import { DistrictSection } from "./voter-sections/DistrictSection";
import { VotingSection } from "./voter-sections/VotingSection";
import { RegistrationSection } from "./voter-sections/RegistrationSection";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Printer } from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";
import { AddToListDialog } from "./AddToListDialog";
import { Button } from "@/components/ui/button";
import { printVoterRecord } from "./voter-sections/printUtils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface SearchResultsProps {
  results: VoterRecord[];
  county: string;
}

const ITEMS_PER_PAGE = 20;

const getPartyColor = (party: string | null) => {
  const colors: { [key: string]: string } = {
    REP: "bg-red-500",
    DEM: "bg-blue-500",
    CON: "bg-yellow-500",
    WOR: "bg-purple-500",
    BLK: "bg-gray-700",
    OTH: "bg-black",
  };
  return colors[party || "OTH"] || colors["OTH"];
};

export const SearchResults = ({ results, county }: SearchResultsProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  if (results.length === 0) return null;

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = results.slice(startIndex, endIndex);

  const handlePrint = async (voter: VoterRecord) => {
    try {
      await printVoterRecord(voter);
      toast({
        title: "Success",
        description: "PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="space-y-4">
        {currentResults.map((voter, index) => {
          const age = voter.date_of_birth ? calculateAge(voter.date_of_birth) : null;
          return (
            <div
              key={index}
              className="border rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="hover:no-underline w-full px-4 py-4 [&[data-state=open]>div>div>.chevron]:rotate-90">
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-left">
                          {voter.first_name} {voter.middle} {voter.last_name}{" "}
                          {voter.suffix} {age && <span className="font-bold">({age})</span>}
                        </h3>
                        <p className="text-sm text-gray-600 text-left">
                          {voter.house} {voter.street_name}, {voter.residence_city},{" "}
                          {voter.zip_code}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Party:</span>
                          <Badge
                            className={`${getPartyColor(
                              voter.enrolled_party
                            )} text-white`}
                          >
                            {voter.enrolled_party || "OTH"}
                          </Badge>
                          <div className="flex flex-wrap gap-2">
                            <AddToListDialog 
                              stateVoterId={voter.state_voter_id}
                              county={county}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrint(voter);
                              }}
                              className="whitespace-nowrap"
                            >
                              <Printer className="h-4 w-4 mr-2" />
                              Print Record
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-sm">View Details</span>
                        <ChevronRight className="h-5 w-5 chevron transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-8 bg-gray-50 border-t">
                    <PersonalSection voter={voter} />
                    <AddressSection voter={voter} />
                    <DistrictSection voter={voter} />
                    <VotingSection voter={voter} />
                    <RegistrationSection voter={voter} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, and pages around current page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // If there's a gap in the sequence, show ellipsis
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <PaginationItem key={`ellipsis-${page}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};