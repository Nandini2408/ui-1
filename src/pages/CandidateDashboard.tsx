import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, TrendingUp, Award, User, FileText, Target, 
  Bell, ChevronRight, Code, Briefcase, BookOpen, CheckCircle
} from 'lucide-react';
import WelcomeHeader from '@/components/candidate/WelcomeHeader';
import UpcomingInterviews from '@/components/candidate/UpcomingInterviews';
import InterviewHistory from '@/components/candidate/InterviewHistory';
import PerformanceAnalytics from '@/components/candidate/PerformanceAnalytics';
import CandidateNavbar from '@/components/candidate/CandidateNavbar';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useInterviews } from '@/hooks/useInterviews';

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { interviews } = useInterviews();

  const handleCompleteProfile = () => {
    navigate('/profile');
  };

  const handleUploadResume = () => {
    navigate('/profile?section=resume');
  };

  const handleTakeAssessment = () => {
    navigate('/assessments');
  };

  // Filter upcoming interviews
  const upcomingInterviews = interviews.filter(interview => 
    (interview.status === 'scheduled' || interview.status === 'in_progress')
  ).slice(0, 3); // Get only the first 3 for the calendar view

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary">
      <CandidateNavbar />
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Welcome Header */}
        <div className="mb-6">
          <Card className="bg-dark-secondary border-border-dark overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-tech-green/5 rounded-full -mr-20 -mt-20 z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-tech-green/5 rounded-full -ml-10 -mb-10 z-0"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-tech-green rounded-full flex items-center justify-center ring-4 ring-tech-green/20">
                    <User className="h-8 w-8 text-dark-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-text-primary">Welcome back, {profile?.first_name || 'Candidate'}!</h1>
                    <p className="text-text-secondary mt-1">Ready for your next coding challenge?</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-dark-primary/50 px-2 py-1 rounded-full">
                        <TrendingUp className="h-4 w-4 text-tech-green" />
                        <span className="text-sm text-text-secondary">Performance Score: 85/100</span>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { name: 'Problem Solver', color: 'bg-tech-green' },
                          { name: 'Code Quality', color: 'bg-blue-500' },
                          { name: 'Fast Learner', color: 'bg-purple-500' }
                        ].map((achievement, index) => (
                          <Badge key={index} className={`${achievement.color} text-white text-xs`}>
                            {achievement.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-tech-green text-tech-green hover:bg-tech-green hover:text-dark-primary"
                    onClick={handleCompleteProfile}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-tech-green text-tech-green hover:bg-tech-green hover:text-dark-primary"
                    onClick={handleUploadResume}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Button 
                    className="bg-tech-green hover:bg-tech-green/90 text-dark-primary"
                    size="sm"
                    onClick={handleTakeAssessment}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Practice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Calendar View with Upcoming Interviews */}
            <Card className="bg-dark-secondary border-border-dark overflow-hidden">
              <CardHeader className="bg-dark-primary/50 border-b border-border-dark">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-tech-green" />
                    Interview Schedule
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-tech-green text-tech-green hover:bg-tech-green/10"
                    onClick={() => navigate('/interviews')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <UpcomingInterviews />
              </CardContent>
            </Card>
            
            {/* Skills Progress Section */}
            <Card className="bg-dark-secondary border-border-dark">
              <CardHeader className="bg-dark-primary/50 border-b border-border-dark">
                <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                  <Award className="h-5 w-5 text-tech-green" />
                  Skill Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Circular Progress Indicators for Key Skills */}
                  {['Problem Solving', 'Code Quality', 'Communication', 'Technical'].map((skill, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="relative h-24 w-24 mb-3">
                        {/* Outer ring - background */}
                        <div className="absolute inset-0 rounded-full border-4 border-dark-primary"></div>
                        {/* Progress ring - foreground with variable stroke-dasharray */}
                        <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            cx="50" cy="50" r="48" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4"
                            strokeDasharray={`${index * 25 + 50} 300`}
                            className="text-tech-green" 
                          />
                        </svg>
                        {/* Center content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-text-primary">{index * 10 + 70}%</span>
                        </div>
                      </div>
                      <span className="text-sm text-text-secondary text-center">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="bg-dark-secondary border-border-dark hover:border-tech-green/30 transition-all duration-300 cursor-pointer group overflow-hidden relative"
                onClick={handleCompleteProfile}
              >
                <div className="absolute inset-0 bg-tech-green opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-tech-green/20 flex items-center justify-center mb-3">
                      <User className="h-6 w-6 text-tech-green" />
                    </div>
                    <h3 className="font-medium text-text-primary mb-1">Complete Profile</h3>
                    <p className="text-sm text-text-secondary">Update your skills and experience</p>
                  </div>
                </CardContent>
                <CardFooter className="p-0 border-t border-border-dark">
                  <Button variant="ghost" className="w-full rounded-none text-text-secondary hover:text-tech-green">
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card 
                className="bg-dark-secondary border-border-dark hover:border-tech-green/30 transition-all duration-300 cursor-pointer group overflow-hidden relative"
                onClick={handleUploadResume}
              >
                <div className="absolute inset-0 bg-tech-green opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-medium text-text-primary mb-1">Upload Resume</h3>
                    <p className="text-sm text-text-secondary">Add or update your resume</p>
                  </div>
                </CardContent>
                <CardFooter className="p-0 border-t border-border-dark">
                  <Button variant="ghost" className="w-full rounded-none text-text-secondary hover:text-blue-500">
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card 
                className="bg-dark-secondary border-border-dark hover:border-tech-green/30 transition-all duration-300 cursor-pointer group overflow-hidden relative"
                onClick={handleTakeAssessment}
              >
                <div className="absolute inset-0 bg-tech-green opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                      <Target className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-medium text-text-primary mb-1">Take Assessment</h3>
                    <p className="text-sm text-text-secondary">Practice with coding challenges</p>
                  </div>
                </CardContent>
                <CardFooter className="p-0 border-t border-border-dark">
                  <Button variant="ghost" className="w-full rounded-none text-text-secondary hover:text-purple-500">
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Right Sidebar - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Performance Analytics Card */}
            <PerformanceAnalytics />
            
            {/* Notifications Center */}
            <Card className="bg-dark-secondary border-border-dark">
              <CardHeader className="bg-dark-primary/50 border-b border-border-dark">
                <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                  <Bell className="h-5 w-5 text-tech-green" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border-dark">
                  {[
                    { title: 'Interview Confirmed', desc: 'Your upcoming interview has been confirmed', time: '2h ago', icon: CheckCircle, color: 'text-tech-green' },
                    { title: 'New Resource Available', desc: 'Check out the new algorithm practice problems', time: '1d ago', icon: BookOpen, color: 'text-blue-500' },
                    { title: 'Feedback Received', desc: 'You received feedback on your last interview', time: '2d ago', icon: FileText, color: 'text-purple-500' }
                  ].map((notification, index) => (
                    <div key={index} className="p-4 hover:bg-dark-primary/30 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-full bg-dark-primary ${notification.color}`}>
                          <notification.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-text-primary">{notification.title}</h4>
                            <span className="text-xs text-text-secondary">{notification.time}</span>
                          </div>
                          <p className="text-sm text-text-secondary mt-1">{notification.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Interview History */}
            <Card className="bg-dark-secondary border-border-dark">
              <CardHeader className="bg-dark-primary/50 border-b border-border-dark">
                <CardTitle className="text-lg text-text-primary flex items-center gap-2">
                  <Clock className="h-5 w-5 text-tech-green" />
                  Recent Interviews
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InterviewHistory />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
