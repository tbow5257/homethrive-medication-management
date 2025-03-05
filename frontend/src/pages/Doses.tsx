import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Space, 
  Spin,
  DatePicker,
  Select,
  Empty
} from 'antd';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { useDoses, useRecipients } from '../hooks/useApi';
import { DoseResponse } from '../types';
import { ColumnsType } from 'antd/es/table';

const Doses: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [filteredDoses, setFilteredDoses] = useState<DoseResponse[]>([]);

  const { data: recipients } = useRecipients();
  const { data: doses, isLoading } = useDoses();

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleRecipientFilter = (value: string) => {
    setSelectedRecipient(value);
  };

  useEffect(() => {
    if (doses) {
      const filtered = filterDoses();
      setFilteredDoses(filtered);
      console.log('Filtered doses:', filtered);
    }
  }, [doses, selectedDate, selectedRecipient]);

  const filterDoses = () => {
    if (!doses) return [];
    
    console.log('Filtering doses:', doses.length);
    
    let filtered = [...doses];
    
    // Only show taken doses
    filtered = filtered.filter(dose => dose.status === 'taken');
    console.log('After status filter:', filtered.length);
    
    // Filter by selected date
    if (selectedDate) {
      const selectedDateStart = selectedDate.startOf('day').toDate();
      const selectedDateEnd = selectedDate.endOf('day').toDate();
      
      console.log('Date range:', {
        start: selectedDateStart.toISOString(),
        end: selectedDateEnd.toISOString()
      });
      
      filtered = filtered.filter(dose => {
        const doseTime = new Date(dose.scheduledFor);
        console.log('Comparing dose:', {
          id: dose.id,
          scheduledFor: dose.scheduledFor,
          doseTime: doseTime.toISOString(),
          inRange: doseTime >= selectedDateStart && doseTime <= selectedDateEnd
        });
        return doseTime >= selectedDateStart && doseTime <= selectedDateEnd;
      });
      console.log('After date filter:', filtered.length);
    }
    
    // Filter by recipient
    if (selectedRecipient) {
      filtered = filtered.filter(dose => {
        return dose.careRecipientId === selectedRecipient;
      });
      console.log('After recipient filter:', filtered.length);
    }
    
    // Sort by scheduled time
    filtered.sort((a, b) => 
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    );
    
    return filtered;
  };

  const columns: ColumnsType<DoseResponse> = [
    {
      title: 'Medication',
      key: 'medicationName',
      dataIndex: 'medicationName',
    },
    {
      title: 'Care Recipient',
      key: 'careRecipientFullName',
      dataIndex: 'careRecipientFullName',
    },
    {
      title: 'Scheduled Time',
      key: 'scheduledFor',
      render: (_, record) => format(new Date(record.scheduledFor), 'MMM d, yyyy h:mm a'),
    },
    {
      title: 'Taken At',
      dataIndex: 'takenAt',
      key: 'takenAt',
      render: (text: string | null) => text ? format(new Date(text), 'MMM d, yyyy h:mm a') : '-',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // Check if we have any taken doses
  const hasTakenDoses = doses?.some(dose => dose.status === 'taken') || false;
  console.log('Has taken doses:', hasTakenDoses);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historical Doses</h1>
        <Space>
          <DatePicker 
            value={selectedDate} 
            onChange={handleDateChange} 
            allowClear={true}
          />
          <Select
            placeholder="Filter by recipient"
            style={{ width: 200 }}
            allowClear
            onChange={handleRecipientFilter}
            options={recipients?.map(recipient => ({
              value: recipient.id,
              label: recipient.firstName && recipient.lastName 
                ? `${recipient.firstName} ${recipient.lastName}` 
                : recipient.id,
            }))}
          />
        </Space>
      </div>
      
      {!hasTakenDoses && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p>No historical doses found. Only doses with status "taken" are displayed.</p>
        </div>
      )}
      
      <Table<DoseResponse>
        dataSource={filteredDoses} 
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