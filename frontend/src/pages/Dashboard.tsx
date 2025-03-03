import React from 'react';
import { Row, Col, Card, Statistic, List, Tag, Button, Spin, Empty } from 'antd';
import { Users, Pill, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useDashboardStats, useUpcomingDoses } from '../hooks/useApi';
import { useUpdateDoseStatus } from '../hooks/useApi';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcomingDoses, isLoading: dosesLoading } = useUpcomingDoses(5);
  const updateDoseStatus = useUpdateDoseStatus();

  const markAsTaken = async (doseId: string) => {
    try {
      await updateDoseStatus.mutateAsync({ id: doseId, status: 'taken' });
    } catch (error) {
      console.error('Error marking dose as taken:', error);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'taken':
        return <Tag color="success" icon={<CheckCircle size={14} />}>Taken</Tag>;
      case 'missed':
        return <Tag color="error" icon={<AlertCircle size={14} />}>Missed</Tag>;
      default:
        return <Tag color="processing" icon={<Clock size={14} />}>Scheduled</Tag>;
    }
  };

  if (statsLoading || dosesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/recipients')}>
            <Statistic 
              title="Care Recipients" 
              value={stats?.data?.totalRecipients || 0} 
              prefix={<Users size={20} className="mr-2 text-blue-500" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/medications')}>
            <Statistic 
              title="Medications" 
              value={stats?.data?.totalMedications || 0} 
              prefix={<Pill size={20} className="mr-2 text-green-500" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/schedules')}>
            <Statistic 
              title="Schedules" 
              value={stats?.data?.totalSchedules || 0} 
              prefix={<Calendar size={20} className="mr-2 text-purple-500" />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/doses')}>
            <Statistic 
              title="Upcoming Doses" 
              value={stats?.data?.upcomingDoses || 0} 
              prefix={<Clock size={20} className="mr-2 text-orange-500" />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Upcoming Doses" className="mt-6">
        {upcomingDoses?.data && upcomingDoses.data.length > 0 ? (
          <List
            dataSource={upcomingDoses.data}
            renderItem={item => (
              <List.Item
                actions={[
                  item.status === 'scheduled' && (
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={() => markAsTaken(item.id || '')}
                      loading={updateDoseStatus.isPending && updateDoseStatus.variables?.id === item.id}
                    >
                      Mark as Taken
                    </Button>
                  )
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center">
                      <span className="mr-2">{item.medication.name}</span>
                      {getStatusTag(item.status || '')}
                    </div>
                  }
                  description={`For ${item.medication.careRecipient.firstName} at ${format(new Date(item.scheduledFor), 'h:mm a, MMM d')}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No upcoming doses" />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;