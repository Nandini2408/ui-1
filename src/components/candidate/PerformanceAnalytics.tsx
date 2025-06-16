import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Target, Users, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

interface PerformanceData {
  month: string;
  score: number;
}

interface SkillMetric {
  skill: string;
  score: number;
  trend: string;
}

const PerformanceAnalytics = () => {
  const { profile } = useProfile();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [skillMetrics, setSkillMetrics] = useState<SkillMetric[]>([]);
  const [overallMetrics, setOverallMetrics] = useState([
    { label: 'Interview Success Rate', value: '0%', icon: Target, color: 'text-tech-green' },
    { label: 'Avg. Performance Score', value: '0', icon: Award, color: 'text-blue-500' },
    { label: 'Better than Peers', value: '0%', icon: Users, color: 'text-purple-500' },
    { label: 'Improvement Rate', value: '0%', icon: TrendingUp, color: 'text-tech-green' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchPerformanceData();
    }
  }, [profile]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      // Fetch interview performance data
      if (profile?.id) {
        // Get skill evaluations for this candidate's interviews
        const { data: skillEvals, error: skillError } = await supabase
          .from('interviews')
          .select(`
            id,
            scheduled_at,
            skill_evaluations (
              skill_name,
              score,
              created_at
            )
          `)
          .eq('candidate_id', profile.id)
          .eq('status', 'completed')
          .order('scheduled_at', { ascending: false });

        if (skillError) throw skillError;

        // Process skill metrics
        const skillsMap = new Map<string, { scores: number[], lastScore: number, prevScore: number }>();
        
        skillEvals?.forEach(interview => {
          interview.skill_evaluations?.forEach((evaluation: any) => {
            if (!skillsMap.has(evaluation.skill_name)) {
              skillsMap.set(evaluation.skill_name, { scores: [], lastScore: 0, prevScore: 0 });
            }
            
            const skillData = skillsMap.get(evaluation.skill_name)!;
            skillData.scores.push(evaluation.score);
            
            if (skillData.scores.length === 1) {
              skillData.lastScore = evaluation.score;
            } else if (skillData.scores.length === 2) {
              skillData.prevScore = skillData.lastScore;
              skillData.lastScore = evaluation.score;
            } else {
              skillData.prevScore = skillData.scores[skillData.scores.length - 2];
              skillData.lastScore = evaluation.score;
            }
          });
        });

        // Calculate skill metrics with trends
        const processedSkillMetrics: SkillMetric[] = [];
        skillsMap.forEach((data, skill) => {
          const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
          const trend = data.prevScore ? 
            `${((data.lastScore - data.prevScore) / data.prevScore * 100).toFixed(0)}%` : 
            '+0%';
          
          processedSkillMetrics.push({
            skill,
            score: Math.round(avgScore),
            trend: data.lastScore >= data.prevScore ? `+${trend}` : trend
          });
        });

        setSkillMetrics(processedSkillMetrics.length > 0 ? 
          processedSkillMetrics : 
          [
            { skill: 'Problem Solving', score: 0, trend: '+0%' },
            { skill: 'Code Quality', score: 0, trend: '+0%' },
            { skill: 'Communication', score: 0, trend: '+0%' },
            { skill: 'Technical Skills', score: 0, trend: '+0%' }
          ]
        );

        // Generate performance data by month
        const { data: interviews, error: interviewsError } = await supabase
          .from('interviews')
          .select('scheduled_at, overall_score')
          .eq('candidate_id', profile.id)
          .eq('status', 'completed')
          .order('scheduled_at', { ascending: true });

        if (interviewsError) throw interviewsError;

        const monthlyData = new Map<string, { scores: number[], avgScore: number }>();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        interviews?.forEach(interview => {
          if (interview.overall_score && interview.scheduled_at) {
            const date = new Date(interview.scheduled_at);
            const monthKey = months[date.getMonth()];
            
            if (!monthlyData.has(monthKey)) {
              monthlyData.set(monthKey, { scores: [], avgScore: 0 });
            }
            
            const monthData = monthlyData.get(monthKey)!;
            monthData.scores.push(interview.overall_score);
            monthData.avgScore = monthData.scores.reduce((sum, score) => sum + score, 0) / monthData.scores.length;
          }
        });

        const chartData: PerformanceData[] = [];
        monthlyData.forEach((data, month) => {
          chartData.push({
            month,
            score: Math.round(data.avgScore)
          });
        });

        setPerformanceData(chartData.length > 0 ? chartData : [
          { month: 'Jan', score: 0 },
          { month: 'Feb', score: 0 },
          { month: 'Mar', score: 0 },
          { month: 'Apr', score: 0 }
        ]);

        // Calculate overall metrics
        const totalInterviews = interviews?.length || 0;
        const successfulInterviews = interviews?.filter(i => i.overall_score && i.overall_score >= 70).length || 0;
        const successRate = totalInterviews > 0 ? Math.round((successfulInterviews / totalInterviews) * 100) : 0;
        
        const avgScore = interviews?.reduce((sum, interview) => sum + (interview.overall_score || 0), 0) / 
                        (interviews?.length || 1);
        
        // This would normally come from comparing to other candidates
        // For now we'll use a placeholder calculation
        const betterThanPeers = Math.min(Math.round(avgScore * 0.8), 100);
        
        // Calculate improvement rate
        let improvementRate = 0;
        if (chartData.length >= 2) {
          const firstScore = chartData[0].score;
          const lastScore = chartData[chartData.length - 1].score;
          improvementRate = firstScore > 0 ? Math.round(((lastScore - firstScore) / firstScore) * 100) : 0;
        }

        setOverallMetrics([
          { label: 'Interview Success Rate', value: `${successRate}%`, icon: Target, color: 'text-tech-green' },
          { label: 'Avg. Performance Score', value: `${Math.round(avgScore)}`, icon: Award, color: 'text-blue-500' },
          { label: 'Better than Peers', value: `${betterThanPeers}%`, icon: Users, color: 'text-purple-500' },
          { label: 'Improvement Rate', value: `${improvementRate > 0 ? '+' : ''}${improvementRate}%`, icon: TrendingUp, color: 'text-tech-green' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // Set default values in case of error
      setPerformanceData([
        { month: 'Jan', score: 0 },
        { month: 'Feb', score: 0 },
        { month: 'Mar', score: 0 },
        { month: 'Apr', score: 0 }
      ]);
      setSkillMetrics([
        { skill: 'Problem Solving', score: 0, trend: '+0%' },
        { skill: 'Code Quality', score: 0, trend: '+0%' },
        { skill: 'Communication', score: 0, trend: '+0%' },
        { skill: 'Technical Skills', score: 0, trend: '+0%' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-dark-secondary border-border-dark">
      <CardHeader>
        <CardTitle className="text-lg text-text-primary flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-tech-green" />
          Performance Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-tech-green animate-spin" />
          </div>
        ) : (
          <>
            {/* Overall Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {overallMetrics.map((metric, index) => (
                <div key={index} className="bg-dark-primary p-3 rounded-lg border border-border-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-xs text-text-secondary">{metric.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Performance Trend */}
            <div className="bg-dark-primary p-4 rounded-lg border border-border-dark">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Performance Trend</h4>
              <div className="h-32">
                <ChartContainer config={{
                  score: { label: "Score", color: "hsl(var(--tech-green))" }
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#39d353" 
                        strokeWidth={2}
                        dot={{ fill: '#39d353', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Skill Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text-primary">Skill Performance</h4>
              {skillMetrics.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-tech-green">{skill.trend}</span>
                      <span className="text-sm font-semibold text-text-primary">{skill.score}%</span>
                    </div>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceAnalytics;
