import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  message, 
  Spin,
  Tag,
  DatePicker,
  Select,
  Card,
  Statistic,
  Row,
  Col,
  Tabs,
  Empty,
  Popconfirm
} from 'antd';
import { CheckCircle, AlertCircle, Clock, Calendar, BarChart3 } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { useDoses, useRecipients, useUpdateDoseStatus } from '../hooks/useApi';
import { DoseUI as Dose } from '../types';

const { TabPane } = Tabs;

const Doses: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: recipients } = useRecipients();
  const { data: doses, isLoading } = useDoses();
  const updateDoseStatus = useUpdateDoseStatus();

  const calculateStats = () => {
    if (!doses) return {
      total: 0,
      taken: 0,
      missed: 0,
      scheduled: 0,
      adherenceRate: 0,
    };
    
    const total = doses.length;
    const taken = doses.filter(dose => dose.status === 'taken').length;
    const missed = doses.filter(dose => dose.status === 'missed').length;
    const scheduled = doses.filter(dose => dose.status === 'scheduled').length;
    
    const adherenceRate = total > 0 
      ? Math.round((taken / (taken + missed)) * 100) 
      : 0;
    
    return {
      total,
      taken,
      missed,
      scheduled,
      adherenceRate,
    };
  };

  const stats = calculateStats();

  const markAsTaken = async (doseId: string) => {
    try {
      await updateDoseStatus.mutateAsync({ id: doseId, status: 'taken' });
      message.success('Dose marked as taken');
    } catch (error) {
      console.error('Error marking dose as taken:', error);
      message.error('Failed to mark dose as taken');
    }
  };

  const markAsMissed = async (doseId: string) => {
    try {
      await updateDoseStatus.mutateAsync({ id: doseId, status: 'missed' });
      message.success('Dose marked as missed');
    } catch (error) {
      console.error('Error marking dose as missed:', error);
      message.error('Failed to mark dose as missed');
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleRecipientFilter = (value: string) => {
    setSelectedRecipient(value);
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

  const filterDoses = () => {
    if (!doses) return [];
    
    let filtered = [...doses];
    
    // Filter by tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(dose => 
        new Date(dose.scheduledTime) >= new Date() || 
        (isToday(new Date(dose.scheduledTime)) && dose.status === 'scheduled')
      );
    } else if (activeTab === 'today') {
      filtered = filtered.filter(dose => 
        isToday(new Date(dose.scheduledTime))
      );
    } else if (activeTab === 'history') {
      filtered = filtered.filter(dose => 
        new Date(dose.scheduledTime) < new Date() && 
        (dose.status === 'taken' || dose.status === 'missed')
      );
    }
    
    // Filter by selected date if not in upcoming tab
    if (activeTab !== 'upcoming' && selectedDate) {
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(dose => {
        const doseTime = new Date(dose.scheduledTime);
        return doseTime >= selectedDateStart && doseTime <= selectedDateEnd;
      });
    }
    
    // Filter by recipient
    if (selectedRecipient) {
      // We need to filter by medication's recipient ID
      // This would be handled by the API in a real implementation
      filtered = filtered.filter(dose => {
        // For mock purposes, we'll just use the first part of the ID
        // In a real implementation, this would be handled by the backend
        return dose.id.includes(selectedRecipient);
      });
    }
    
    // Sort by scheduled time
    filtered.sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
    
    return filtered;
  };

  const columns = [
    {
      title: 'Medication',
      key: 'medicationName',
      render: (_, record: Dose) => {
        // In a real implementation, we would have the medication name from the API
        // For mock purposes, we'll just use the medication ID
        return record.medicationId === '1' ? 'Lisinopril' : 
               record.medicationId === '2' ? 'Metformin' : 'Atorvastatin';
      },
    },
    {
      title: 'Care Recipient',
      key: 'careRecipientName',
      render: (_, record: Dose) => {
        // In a real implementation, we would have the recipient name from the API
        // For mock purposes, we'll determine based on medication ID
        return record.medicationId === '1' || record.medicationId === '3' ? 'John Doe' : 'Jane Smith';
      },
    },
    {
      title: 'Scheduled Time',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      render: (text: string) => format(new Date(text), 'MMM d, yyyy h:mm a'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Taken At',
      dataIndex: 'takenAt',
      key: 'takenAt',
      render: (text: string | null) => text ? format(new Date(text), 'MMM d, yyyy h:mm a') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Dose) => {
        if (record.status === 'scheduled') {
          return (
            <Space>
              <Button 
                type="primary" 
                size="small" 
                onClick={() => markAsTaken(record.id)}
                loading={updateDoseStatus.isPending && 
                  updateDoseStatus.variables?.id === record.id && 
                  updateDoseStatus.variables?.status === 'taken'}
              >
                Mark as Taken
              </Button>
              <Popconfirm
                title="Mark as missed"
                description="Are you sure you want to mark this dose as missed?"
                onConfirm={() => markAsMissed(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="default" 
                  danger 
                  size="small"
                  loading={updateDoseStatus.isPending && 
                    updateDoseStatus.variables?.id === record.id && 
                    updateDoseStatus.variables?.status === 'missed'}
                >
                  Mark as Missed
                </Button>
              </Popconfirm>
            </Space>
          );
        }
        return null;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medication Doses</h1>
        <Space>
          {activeTab !== 'upcoming' && (
            <DatePicker 
              value={selectedDate} 
              onChange={(date) => handleDateChange(date)} 
              allowClear={false}
            />
          )}
          <Select
            placeholder="Filter by recipient"
            style={{ width: 200 }}
            allowClear
            onChange={handleRecipientFilter}
            options={recipients?.map(recipient => ({
              value: recipient.id,
              label: recipient.name,
            }))}
          />
        </Space>
      </div>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Adherence Rate" 
              value={stats.adherenceRate} 
              suffix="%" 
              valueStyle={{ color: stats.adherenceRate > 80 ? '#3f8600' : stats.adherenceRate > 60 ? '#faad14' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Doses Taken" 
              value={stats.taken} 
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircle size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Doses Missed" 
              value={stats.missed} 
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertCircle size={20} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Upcoming Doses" 
              value={stats.scheduled} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<Clock size={20} />}
            />
          </Card>
        </Col>
      </Row>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="mb-4"
      >
        <TabPane 
          tab={
            <span>
              <Clock size={16} className="mr-1" />
              Upcoming
            </span>
          } 
          key="upcoming"
        />
        <TabPane 
          tab={
            <span>
              <Calendar size={16} className="mr-1" />
              Today
            </span>
          } 
          key="today"
        />
        <TabPane 
          tab={
            <span>
              <BarChart3 size={16} className="mr-1" />
              History
            </span>
          } 
          key="history"
        />
      </Tabs>
      
      <Table 
        dataSource={filterDoses()} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: <Empty description="No doses found" />,
        }}
      />
    </div>
  );
};

export default Doses;