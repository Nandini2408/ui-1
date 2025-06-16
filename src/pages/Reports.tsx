import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Target,
  Share2,
  Filter,
  Plus
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import AnalyticsDashboard from '@/components/reports/AnalyticsDashboard';
import BackButton from '@/components/ui/back-button';
import { useProfile } from '@/hooks/useProfile';

const Reports = () => {
  const { analytics, loading } = useAnalytics();
  const { profile } = useProfile();
  const navigate = useNavigate();
  
  // Determine the back destination based on user role
  const getBackDestination = () => {
    if (profile?.role === 'recruiter') {
      return '/recruiter-dashboard';
    } else if (profile?.role === 'admin') {
      return '/admin-dashboard';
    } else {
      return '/';
    }
  };

  // Calculate trend percentages by comparing to previous periods
  const calculateTrend = (current: number, previous: number): { change: string, trend: 'up' | 'down' | 'neutral' } => {
    if (previous === 0) return { change: "N/A", trend: 'neutral' };
    
    const percentChange = ((current - previous) / previous) * 100;
    const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
    return { 
      change: `${percentChange > 0 ? '+' : ''}${Math.round(percentChange)}%`, 
      trend 
    };
  };
  
  // Get previous period data for trends
  const getPreviousData = () => {
    if (!analytics || !analytics.monthlyTrends || analytics.monthlyTrends.length < 2) {
      return {
        interviews: 0,
        completionRate: 0,
        averageScore: 0,
        timeToHire: 0
      };
    }
    
    // Use data from the previous month
    const previousMonth = analytics.monthlyTrends[analytics.monthlyTrends.length - 2];
    return {
      interviews: previousMonth.scheduled || 0,
      completionRate: previousMonth.success_rate || 0,
      averageScore: analytics.averageScore,
      timeToHire: analytics.timeToHire
    };
  };
  
  const previousData = getPreviousData();
  
  // Calculate trends
  const interviewsTrend = calculateTrend(
    analytics?.totalInterviews || 0, 
    previousData.interviews
  );
  
  const completionRateTrend = calculateTrend(
    analytics?.completionRate || 0, 
    previousData.completionRate
  );
  
  const scoreTrend = calculateTrend(
    analytics?.averageScore || 0, 
    previousData.averageScore
  );
  
  const timeToHireTrend = calculateTrend(
    analytics?.timeToHire || 0, 
    previousData.timeToHire
  );
  
  const reportStats = [
    {
      title: "Total Interviews",
      value: analytics?.totalInterviews?.toString() || "0",
      change: interviewsTrend.change,
      trend: interviewsTrend.trend,
      icon: Users
    },
    {
      title: "Completion Rate",
      value: analytics ? `${analytics.completionRate}%` : "0%",
      change: completionRateTrend.change,
      trend: completionRateTrend.trend,
      icon: Target
    },
    {
      title: "Average Score",
      value: analytics ? `${analytics.averageScore}/10` : "0/10",
      change: scoreTrend.change,
      trend: scoreTrend.trend,
      icon: BarChart3
    },
    {
      title: "Time to Hire",
      value: analytics ? `${analytics.timeToHire} days` : "0 days",
      change: timeToHireTrend.change,
      trend: timeToHireTrend.trend,
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BackButton 
              to={getBackDestination()}
              label="Back to Dashboard" 
              className="text-text-secondary hover:text-text-primary"
            />
            <div className="h-6 w-px bg-border-dark"></div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Reports & Analytics</h1>
              <p className="text-text-secondary mt-2">Comprehensive interview performance insights</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!loading && (
              <>
                <Button variant="outline" className="border-border-dark text-text-secondary hover:text-text-primary">
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
                <Button variant="outline" className="border-border-dark text-text-secondary hover:text-text-primary">
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
                <Button className="bg-tech-green hover:bg-tech-green/90 text-dark-primary">
                  <Plus size={16} className="mr-2" />
                  New Report
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading state for stats cards
            Array(4).fill(0).map((_, index) => (
              <Card key={index} className="bg-dark-secondary border-border-dark">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="h-4 w-24 bg-dark-primary/50 rounded animate-pulse mb-3"></div>
                      <div className="h-8 w-16 bg-dark-primary/50 rounded animate-pulse mb-3"></div>
                      <div className="h-4 w-20 bg-dark-primary/50 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-8 bg-dark-primary/50 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            reportStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-dark-secondary border-border-dark">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">{stat.title}</p>
                        <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                        <p className={`text-sm mt-1 ${
                          stat.trend === 'up' ? 'text-tech-green' : 
                          stat.trend === 'down' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <Icon className="h-8 w-8 text-tech-green" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Analytics Dashboard */}
        {loading ? (
          <div className="space-y-6">
            <div className="h-96 bg-dark-secondary border-border-dark rounded-md animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            <AnalyticsDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
