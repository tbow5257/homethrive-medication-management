import React, { useMemo, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Tag, Button, Spin, Empty, Divider, Collapse, Badge } from 'antd';
import { Users, Pill, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useDashboardStats, useUpcomingDoses, useCreateDose } from '../hooks/useApi';
import type { UpcomingMedication } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: upcomingMedications, isLoading: medicationsLoading, refetch: refetchMedications } = useUpcomingDoses(25);
  const createDose = useCreateDose();

  // Refresh data when component mounts or when navigating back to the dashboard
  useEffect(() => {
    refetchStats();
    refetchMedications();
  }, [location.pathname, refetchStats, refetchMedications]);

  const markAsTaken = async (medicationId: string, scheduleId: string, scheduledTime: string) => {
    try {
      await createDose.mutateAsync({ medicationId, scheduleId, scheduledTime });
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

  // Group medications by recipient with dose statistics
  const medicationsByRecipient = useMemo(() => {
    if (!upcomingMedications) return {};
    
    return upcomingMedications.reduce((acc, medication) => {
      const { recipientId, recipientName } = medication;
      if (!acc[recipientId]) {
        acc[recipientId] = {
          recipientName,
          medications: [],
          totalDoses: 0,
          takenDoses: 0
        };
      }
      acc[recipientId].medications.push(medication);
      acc[recipientId].totalDoses += 1;
      if (medication.takenToday) {
        acc[recipientId].takenDoses += 1;
      }
      return acc;
    }, {} as Record<string, { 
      recipientName: string; 
      medications: UpcomingMedication[]; 
      totalDoses: number;
      takenDoses: number;
    }>);
  }, [upcomingMedications]);

  if (statsLoading || medicationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-lg text-gray-600 font-medium">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/recipients')}>
            <Statistic 
              title="Care Recipients" 
              value={stats?.totalRecipients || 0} 
              prefix={<Users size={20} className="mr-2 text-blue-500" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/medications')}>
            <Statistic 
              title="Medications" 
              value={stats?.totalMedications || 0} 
              prefix={<Pill size={20} className="mr-2 text-green-500" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/schedules')}>
            <Statistic 
              title="Schedules" 
              value={stats?.totalSchedules || 0} 
              prefix={<Calendar size={20} className="mr-2 text-purple-500" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/doses')}>
            <Statistic 
              title="Today's Doses" 
              value={stats?.takenDoses || 0} 
              prefix={<Clock size={20} className="mr-2 text-orange-500" />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Today's Medications" className="mt-6">
        {upcomingMedications && upcomingMedications.length > 0 ? (
          <Collapse 
            className="medication-collapse"
            expandIcon={({ isActive }) => (
              <ChevronRight 
                size={16} 
                className={`transform transition-transform ${isActive ? 'rotate-90' : ''}`} 
              />
            )}
          >
            {Object.entries(medicationsByRecipient).map(([recipientId, { recipientName, medications, totalDoses, takenDoses }]) => (
              <Collapse.Panel 
                key={recipientId} 
                header={
                  <div className="flex justify-between items-center w-full">
                    <span className="text-lg font-medium">{recipientName}</span>
                    <div className="flex items-center">
                      <Badge 
                        count={takenDoses} 
                        className="mr-2" 
                        style={{ backgroundColor: '#52c41a' }} 
                        overflowCount={99}
                        showZero
                      />
                      <span className="text-gray-500 mr-1">of</span>
                      <Badge 
                        count={totalDoses} 
                        style={{ backgroundColor: '#1890ff' }} 
                        overflowCount={99}
                        showZero
                      />
                    </div>
                  </div>
                }
              >
                <List
                  dataSource={medications}
                  renderItem={(item: UpcomingMedication) => (
                    <List.Item
                      actions={[
                        item.takenToday ? (
                          <Tag color="success">Taken Today</Tag>
                        ) : (
                          <Button 
                            type="primary" 
                            size="small" 
                            onClick={() => markAsTaken(item.medicationId, item.scheduleId, item.scheduledTime)}
                            loading={createDose.isPending && createDose.variables?.medicationId === item.medicationId}
                          >
                            Mark as Taken
                          </Button>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center">
                            <span className="mr-2">{item.medicationName}</span>
                            <Tag color="blue">{item.dosage}</Tag>
                            <Tag color="orange" className="ml-2">
                              <Clock size={14} className="mr-1 inline" />
                              {format(new Date(`1970-01-01T${item.scheduledTime}`), 'h:mm a')}
                            </Tag>
                          </div>
                        }
                        description={
                          <div className="text-gray-400">
                            Days: {item.daysOfWeek.map(day => 
                              day.substring(0, 3)
                            ).join(', ')}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        ) : (
          <Empty description="No upcoming medications" />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;