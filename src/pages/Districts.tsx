import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Districts = () => {
  const [searchCount, setSearchCount] = useState(0);
  const [searchLimit, setSearchLimit] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    getSearchLimits();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsAdmin(roles?.role === 'admin');
  };

  const getSearchLimits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get or create user's search limit
    let { data: limitData } = await supabase
      .from('user_search_limits')
      .select('daily_limit')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!limitData) {
      // Create default search limit for user
      const { data: newLimitData, error: insertError } = await supabase
        .from('user_search_limits')
        .insert([{ 
          user_id: user.id,
          daily_limit: 100 // Default limit
        }])
        .select('daily_limit')
        .maybeSingle();
      
      if (!insertError) {
        limitData = newLimitData;
      }
    }

    // Get today's search count
    const today = new Date().toISOString().split('T')[0];
    let { data: searchData } = await supabase
      .from('user_searches')
      .select('search_count')
      .eq('user_id', user.id)
      .eq('search_date', today)
      .maybeSingle();

    if (!searchData) {
      // Create today's search record if it doesn't exist
      const { data: newSearchData, error: insertError } = await supabase
        .from('user_searches')
        .insert([{
          user_id: user.id,
          search_date: today,
          search_count: 0
        }])
        .select('search_count')
        .maybeSingle();
      
      if (!insertError) {
        searchData = newSearchData;
      }
    }

    setSearchLimit(limitData?.daily_limit ?? 100);
    setSearchCount(searchData?.search_count ?? 0);
  };

  const incrementSearchCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    if (!isAdmin && searchLimit !== null && searchCount >= searchLimit) {
      toast({
        title: "Search limit reached",
        description: "You have reached your daily search limit",
        variant: "destructive",
      });
      return false;
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: existingSearch } = await supabase
      .from('user_searches')
      .select()
      .eq('user_id', user.id)
      .eq('search_date', today)
      .maybeSingle();

    if (existingSearch) {
      await supabase
        .from('user_searches')
        .update({ search_count: existingSearch.search_count + 1 })
        .eq('id', existingSearch.id);
    } else {
      await supabase
        .from('user_searches')
        .insert([{ user_id: user.id, search_date: today, search_count: 1 }]);
    }

    setSearchCount(prev => prev + 1);
    return true;
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Find Your Legislative Districts</title>
    <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #fff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
        }
        .gradient-text {
            background: linear-gradient(90deg, #60A5FA, #818CF8, #C084FC);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: 700;
            font-size: 2rem;
            margin-bottom: 30px;
            text-align: center;
        }
        @media (max-width: 768px) {
            .gradient-text {
                font-size: 1.5rem;
                margin-bottom: 20px;
            }
        }
        .input-field, .select-field {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
            background: #fff;
        }
        .input-field:focus, .select-field:focus {
            outline: none;
            border-color: #60A5FA;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
        }
        .button {
            width: 100%;
            padding: 12px;
            background-color: #60A5FA;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #3B82F6;
        }
        .button:disabled {
            background-color: #E5E7EB;
            cursor: not-allowed;
        }
        .card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        @media (max-width: 480px) {
            .card {
                padding: 16px;
            }
        }
        .district-label {
            font-weight: 600;
            color: #111827;
            font-size: 16px;
        }
        .district-name {
            color: #374151;
            margin: 4px 0;
            font-size: 15px;
        }
        .representative {
            margin-top: 8px;
            color: #6B7280;
            font-size: 14px;
        }
        .input-group {
            margin-bottom: 20px;
        }
        .label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
            font-size: 14px;
        }
        .search-container {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        @media (max-width: 480px) {
            .search-container {
                padding: 16px;
            }
            .container {
                padding: 12px;
            }
            body {
                padding: 12px;
            }
        }
        .error {
            color: #DC2626;
            background-color: #FEE2E2;
            border: 1px solid #FCA5A5;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        function DistrictLookup() {
            const [borough, setBorough] = React.useState('');
            const [address, setAddress] = React.useState('');
            const [districts, setDistricts] = React.useState(null);
            const [loading, setLoading] = React.useState(false);
            const [error, setError] = React.useState('');

            const districtOrder = {
                'CONGRESSIONAL': 1,
                'STATE SENATE': 2,
                'STATE ASSEMBLY': 3,
                'CITY COUNCIL': 4
            };

            const resetForm = () => {
                setBorough('');
                setAddress('');
                setDistricts(null);
                setError('');
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!borough || !address) return;

                // Check with parent component if search is allowed
                const canSearch = await window.parent.incrementSearchCount();
                if (!canSearch) return;

                setLoading(true);
                setError('');
                setDistricts(null);

                const fullAddress = \`\${address}, \${borough}, NY\`;

                try {
                    const response = await fetch(
                        \`https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=\${encodeURIComponent(fullAddress)}&key=AIzaSyCKt9DPND5l1VbuunwgQuLbw01hU7EQ0sI&includeOffices=true\`
                    );
                    const data = await response.json();
                    
                    if (data.divisions) {
                        const formattedDistricts = [];
                        const officials = data.officials || [];
                        const offices = data.offices || [];
                        
                        // Create a mapping of role to official
                        const roleToOfficial = {};
                        offices.forEach(office => {
                            const officialName = officials[office.officialIndices[0]]?.name;
                            if (office.name.includes('Representative')) {
                                roleToOfficial['congressional'] = officialName;
                            } else if (office.name.includes('State Senator')) {
                                roleToOfficial['senate'] = officialName;
                            } else if (office.name.includes('Assembly')) {
                                roleToOfficial['assembly'] = officialName;
                            } else if (office.name.includes('Council')) {
                                roleToOfficial['council'] = officialName;
                            }
                        });

                        Object.entries(data.divisions).forEach(([id, info]) => {
                            if (id.includes('cd:')) {
                                formattedDistricts.push({
                                    type: 'CONGRESSIONAL',
                                    name: \`New York's \${info.name}\`,
                                    representative: roleToOfficial['congressional']
                                });
                            } else if (id.includes('sldu:')) {
                                formattedDistricts.push({
                                    type: 'STATE SENATE',
                                    name: \`New York State Senate District \${info.name.replace(/\\D/g, '')}\`,
                                    representative: roleToOfficial['senate']
                                });
                            } else if (id.includes('sldl:')) {
                                formattedDistricts.push({
                                    type: 'STATE ASSEMBLY',
                                    name: \`New York Assembly District \${info.name.replace(/\\D/g, '')}\`,
                                    representative: roleToOfficial['assembly']
                                });
                            } else if (id.includes('council_district:')) {
                                formattedDistricts.push({
                                    type: 'CITY COUNCIL',
                                    name: \`New York City Council District \${info.name.replace(/\\D/g, '')}\`,
                                    representative: roleToOfficial['council']
                                });
                            }
                        });

                        formattedDistricts.sort((a, b) => districtOrder[a.type] - districtOrder[b.type]);
                        setDistricts(formattedDistricts);
                    }
                } catch (err) {
                    console.error("Error:", err);
                    setError('Error fetching district information. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className="container">
                    <h1 className="gradient-text">Find Your Legislative Districts</h1>
                    
                    <div className="search-container">
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="label">Borough</label>
                                <select 
                                    className="select-field"
                                    value={borough}
                                    onChange={(e) => setBorough(e.target.value)}
                                    required
                                >
                                    <option value="">Select Borough</option>
                                    <option value="Staten Island">Staten Island</option>
                                    <option value="Brooklyn">Brooklyn</option>
                                    <option value="Queens">Queens</option>
                                    <option value="Manhattan">Manhattan</option>
                                    <option value="Bronx">Bronx</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="label">Street Address</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter street address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    className="button"
                                    type="submit"
                                    disabled={loading || !borough || !address}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Looking Up Districts...' : 'Look Up Districts'}
                                </button>
                                <button 
                                    className="button"
                                    type="button"
                                    onClick={resetForm}
                                    style={{ 
                                        flex: 1,
                                        backgroundColor: '#6B7280',
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {!isAdmin && searchLimit && (
                        <div style={{ 
                            textAlign: 'center', 
                            margin: '10px 0', 
                            color: searchCount >= searchLimit ? '#DC2626' : '#6B7280'
                        }}>
                            Searches today: {searchCount} / {searchLimit}
                        </div>
                    )}

                    {error && <div className="error">{error}</div>}

                    {districts && districts.length > 0 && (
                        <div>
                            {districts.map((district, index) => (
                                <div key={index} className="card">
                                    <div className="district-label">{district.type}</div>
                                    <div className="district-name">{district.name}</div>
                                    {district.representative && (
                                        <div className="representative">
                                            Representative: {district.representative}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Add incrementSearchCount to window object so iframe can access it
        window.incrementSearchCount = async function() {
            return await window.parent.incrementSearchCount();
        };

        ReactDOM.render(
            <DistrictLookup />,
            document.getElementById('root')
        );
    </script>
</body>
</html>`;

  return (
    <AuthContainer>
      <SidebarProvider>
        <div className="min-h-screen bg-background flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="w-full h-[calc(100vh-64px)]">
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-none"
                title="District Lookup"
                sandbox="allow-scripts allow-forms"
              />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthContainer>
  );
};

export default Districts;