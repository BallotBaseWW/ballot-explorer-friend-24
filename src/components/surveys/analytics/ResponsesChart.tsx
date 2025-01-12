import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ResponsesChartProps {
  responses: Array<{
    response: string;
    survey_questions: {
      question: string;
      question_type: string;
      options?: string[];
    };
  }>;
  showDetailed?: boolean;
}

export const ResponsesChart = ({ responses, showDetailed = false }: ResponsesChartProps) => {
  const processResponses = () => {
    const questionMap = new Map<string, Map<string, number>>();

    responses.forEach((response) => {
      const question = response.survey_questions.question;
      const answer = response.response;

      if (!questionMap.has(question)) {
        questionMap.set(question, new Map());
      }

      const answerMap = questionMap.get(question)!;
      answerMap.set(answer, (answerMap.get(answer) || 0) + 1);
    });

    return Array.from(questionMap.entries()).map(([question, answers]) => ({
      question,
      ...Object.fromEntries(answers),
      total: Array.from(answers.values()).reduce((a, b) => a + b, 0),
    }));
  };

  const chartData = processResponses();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (responses.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No responses yet
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {chartData.map((data, index) => (
        <Card key={index} className="p-6">
          <h3 className="text-lg font-semibold mb-4">{data.question}</h3>
          <div className="h-[300px]">
            {showDetailed ? (
              <div className="grid grid-cols-2 gap-4">
                <ResponsiveContainer>
                  <BarChart data={[data]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    {Object.keys(data)
                      .filter((key) => key !== 'question' && key !== 'total')
                      .map((key, i) => (
                        <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={Object.entries(data)
                        .filter(([key]) => key !== 'question' && key !== 'total')
                        .map(([name, value]) => ({ name, value }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {Object.keys(data)
                        .filter((key) => key !== 'question' && key !== 'total')
                        .map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={[data]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis />
                  <Tooltip />
                  {Object.keys(data)
                    .filter((key) => key !== 'question' && key !== 'total')
                    .map((key, i) => (
                      <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};