import React from 'react';
import { Row, Col, Card, Statistic, List, Tag, Button, Spin, Empty } from 'antd';
import { Users, Pill, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useDashboardStats, useUpcomingDoses } from '../hooks/useApi';
import { useUpdateDoseStatus } from '../hooks/useApi';
import type { UpcomingMedication } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcomingMedications, isLoading: medicationsLoading } = useUpcomingDoses(5);
  const updateDoseStatus = useUpdateDoseStatus();

  const markAsTaken = async (scheduleId: string) => {
    try {
      await updateDoseStatus.mutateAsync({ id: scheduleId, status: 'taken' });
    } catch (error) {
      console.error('Error marking medication as taken:', error);
    }
  };

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
      
      <Card title="Upcoming Medications" className="mt-6">
        {upcomingMedications && upcomingMedications.length > 0 ? (
          <List
            dataSource={upcomingMedications}
            renderItem={(item: UpcomingMedication) => (
              <List.Item
                actions={[
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => markAsTaken(item.scheduleId)}
                    loading={updateDoseStatus.isPending && updateDoseStatus.variables?.id === item.scheduleId}
                  >
                    Mark as Taken
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center">
                      <span className="mr-2">{item.medicationName}</span>
                      <Tag color="blue">{item.dosage}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div>For {item.recipientName}</div>
                      <div>Scheduled for {format(new Date(`1970-01-01T${item.scheduledTime}`), 'h:mm a')}</div>
                      <div className="text-gray-400">
                        Days: {item.daysOfWeek.map(day => 
                          day.substring(0, 3)
                        ).join(', ')}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No upcoming medications" />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;