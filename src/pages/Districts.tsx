import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthContainer } from "@/components/auth/AuthContainer";

const Districts = () => {
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
        .input-field, .select-field {
            width: 100%;
            padding: 12px;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
            background: #fff;
            margin: 8px 0 16px;
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
            transition: background-color 0.2s;
        }
        .button:disabled {
            background-color: #E5E7EB;
        }
        .card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .district-content {
            flex: 1;
        }
        .district-label {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
        }
        .district-name {
            color: #374151;
            font-size: 16px;
            margin-bottom: 8px;
        }
        .representative {
            color: #6B7280;
            font-size: 15px;
        }
        .district-number {
            font-size: 48px;
            font-weight: 700;
            margin-left: 20px;
            line-height: 1;
            background: linear-gradient(90deg, #60A5FA, #818CF8, #C084FC);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        .search-container {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        .label {
            font-weight: 500;
            color: #374151;
            font-size: 14px;
        }
        @media (max-width: 480px) {
            .district-number {
                font-size: 36px;
            }
            .card {
                padding: 16px;
            }
            .district-label {
                font-size: 16px;
            }
            .district-name {
                font-size: 14px;
            }
            .representative {
                font-size: 13px;
            }
            .container {
                padding: 12px;
            }
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

            const extractDistrictNumber = (name) => {
                const matches = name.match(/\\d+/);
                return matches ? matches[0] : '';
            };

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!borough || !address) return;

                setLoading(true);
                setError('');
                setDistricts(null);

                const fullAddress = \`\${address}, \${borough}, NY\`;

                try {
                    const response = await fetch(
                        \`https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=\${encodeURIComponent(fullAddress)}&key=AIzaSyCKt9DPND5l1VbuunwgQuLbw01hU7EQ0sI&includeOffices=true&levels=country&levels=administrativeArea1&levels=administrativeArea2&levels=locality\`
                    );
                    const data = await response.json();
                    
                    if (data.divisions) {
                        const formattedDistricts = [];
                        const officials = data.officials || [];
                        const offices = data.offices || [];
                        
                        // Create a mapping of role to official
                        const roleToOfficial = {};
                        offices.forEach(office => {
                            if (!office.officialIndices) return;
                            const officialName = officials[office.officialIndices[0]]?.name;
                            const officeLower = office.name.toLowerCase();
                            
                            // More comprehensive matching for different title variations
                            if (officeLower.includes('representative')) {
                                roleToOfficial['congressional'] = officialName;
                            } else if (officeLower.includes('state senator') || officeLower.includes('senator')) {
                                roleToOfficial['senate'] = officialName;
                            } else if (officeLower.includes('assembly')) {
                                roleToOfficial['assembly'] = officialName;
                            } else if (
                                officeLower.includes('council member') || 
                                officeLower.includes('councilmember') ||
                                officeLower.includes('councilor') ||
                                officeLower.includes('city council')
                            ) {
                                roleToOfficial['council'] = officialName;
                            }
                        });

                        // Additional console logging for debugging
                        console.log('Offices found:', offices.map(o => o.name));
                        console.log('Mapped officials:', roleToOfficial);

                        Object.entries(data.divisions).forEach(([id, info]) => {
                            let district = null;
                            
                            if (id.includes('cd:')) {
                                district = {
                                    type: 'CONGRESSIONAL',
                                    name: \`New York's \${info.name}\`,
                                    representative: roleToOfficial['congressional']
                                };
                            } else if (id.includes('sldu:')) {
                                district = {
                                    type: 'STATE SENATE',
                                    name: \`New York State Senate District \${info.name.replace(/\\D/g, '')}\`,
                                    representative: roleToOfficial['senate']
                                };
                            } else if (id.includes('sldl:')) {
                                district = {
                                    type: 'STATE ASSEMBLY',
                                    name: \`New York Assembly District \${info.name.replace(/\\D/g, '')}\`,
                                    representative: roleToOfficial['assembly']
                                };
                            } else if (id.includes('council_district:')) {
                                district = {
                                    type: 'CITY COUNCIL',
                                    name: \`New York City Council District \${info.name.replace(/\\D/g, '')}\`,
                                    representative: roleToOfficial['council']
                                };
                            }

                            if (district) {
                                district.number = extractDistrictNumber(district.name);
                                formattedDistricts.push(district);
                            }
                        });

                        // Sort districts according to the specified order
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
                            <div>
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

                            <div>
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
                            
                            <button 
                                className="button"
                                type="submit"
                                disabled={loading || !borough || !address}
                            >
                                {loading ? 'Looking Up Districts...' : 'Look Up Districts'}
                            </button>
                        </form>
                    </div>

                    {error && <div className="error">{error}</div>}

                    {districts && districts.length > 0 && (
                        <div>
                            {districts.map((district, index) => (
                                <div key={index} className="card">
                                    <div className="district-content">
                                        <div className="district-label">{district.type}</div>
                                        <div className="district-name">{district.name}</div>
                                        {district.representative && (
                                            <div className="representative">
                                                Representative: {district.representative}
                                            </div>
                                        )}
                                    </div>
                                    <div className="district-number">{district.number}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

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