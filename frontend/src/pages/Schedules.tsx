import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  Space, 
  Popconfirm, 
  message, 
  Spin,
  DatePicker,
  TimePicker,
  Checkbox,
  Card,
  Divider
} from 'antd';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { 
  useSchedules, 
  useMedications,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule
} from '../hooks/useApi';
import { Schedule } from '../types';

const { RangePicker } = DatePicker;
const { CheckboxGroup } = Checkbox;

const daysOfWeek = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const Schedules: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly'>('daily');

  const { data: schedules, isLoading: schedulesLoading } = useSchedules(selectedMedication);
  const { data: medications, isLoading: medicationsLoading } = useMedications();

  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  console.log('schedules', schedules);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setTimes(['08:00']);
    form.setFieldsValue({ 
      daysOfWeek: [],
    });
    setModalVisible(true);
  };

  const handleEdit = (record: Schedule) => {
    setEditingId(record.id);
    setTimes([record.time]);
    form.setFieldsValue({
      medicationId: record.medicationId,
      daysOfWeek: record.daysOfWeek,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule.mutateAsync(id);
      message.success('Schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      message.error('Failed to delete schedule');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingId) {
        await updateSchedule.mutateAsync({ 
          id: editingId, 
          data: {
            medicationId: values.medicationId,
            time: times[0],
            daysOfWeek: values.daysOfWeek,
            isActive: true,
          }
        });
        message.success('Schedule updated successfully');
      } else {
        await createSchedule.mutateAsync({
          medicationId: values.medicationId,
          time: times[0],
          daysOfWeek: values.daysOfWeek,
          isActive: true,
        });
        message.success('Schedule added successfully');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleMedicationFilter = (value: string) => {
    setSelectedMedication(value);
  };

  const addTime = () => {
    setTimes([...times, '08:00']);
  };

  const removeTime = (index: number) => {
    const newTimes = [...times];
    newTimes.splice(index, 1);
    setTimes(newTimes);
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const formatRecurrencePattern = (schedule: Schedule) => {
    const time = format(new Date(`2000-01-01T${schedule.time}`), 'h:mm a');
    const days = schedule.daysOfWeek.join(', ');
    return `${days} at ${time}`;
  };

  const columns = [
    {
      title: 'Medication',
      key: 'medicationName',
      render: (_: unknown, record: Schedule) => {
        const medication = medications?.find(m => m.id === record.medicationId);
        return medication?.name || 'Unknown';
      },
      sorter: (a: Schedule, b: Schedule) => {
        const medicationA = medications?.find(m => m.id === a.medicationId)?.name || '';
        const medicationB = medications?.find(m => m.id === b.medicationId)?.name || '';
        return medicationA.localeCompare(medicationB);
      },
    },
    {
      title: 'Care Recipient',
      key: 'careRecipientName',
      render: (_: unknown, record: Schedule) => {
        const medication = medications?.find(m => m.id === record.medicationId);
        if (!medication) return 'Unknown';
        
        return medication.id === '1' || medication.id === '3' ? 'John Doe' : 'Jane Smith';
      },
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_: unknown, record: Schedule) => formatRecurrencePattern(record),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Schedule) => (
        <Space>
          <Button 
            type="text" 
            icon={<Edit size={16} />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete schedule"
            description="Are you sure you want to delete this schedule?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<Trash2 size={16} />} 
              loading={deleteSchedule.isPending && deleteSchedule.variables === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (schedulesLoading || medicationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medication Schedules</h1>
        <Space>
          <Select
            placeholder="Filter by medication"
            style={{ width: 200 }}
            allowClear
            onChange={handleMedicationFilter}
            options={medications?.map(medication => ({
              value: medication.id,
              label: medication.name,
            }))}
          />
          <Button 
            type="primary" 
            icon={<PlusCircle size={16} />} 
            onClick={handleAdd}
          >
            Add Schedule
          </Button>
        </Space>
      </div>
      
      <Table 
        dataSource={schedules} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingId ? "Edit Schedule" : "Add Schedule"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingId ? "Update" : "Add"}
        width={600}
        confirmLoading={createSchedule.isPending || updateSchedule.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ 
            daysOfWeek: [],
          }}
        >
          <Form.Item
            name="medicationId"
            label="Medication"
            rules={[{ required: true, message: 'Please select a medication' }]}
          >
            <Select placeholder="Select medication">
              {medications?.map(medication => (
                <Select.Option key={medication.id} value={medication.id}>
                  {medication.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="daysOfWeek"
            label="Days of Week"
            rules={[{ 
              required: true, 
              message: 'Please select at least one day',
              type: 'array',
              min: 1,
            }]}
          >
            <Checkbox.Group options={daysOfWeek} />
          </Form.Item>
          
          <Divider orientation="left">Medication Time</Divider>
          
          <Card size="small" className="mb-4">
            {times.map((time, index) => (
              <div key={index} className="flex items-center mb-2">
                <TimePicker
                  format="HH:mm"
                  value={time ? new Date(`2000-01-01T${time}`) : null}
                  onChange={(_, timeString) => updateTime(index, timeString)}
                  className="mr-2"
                />
                {times.length > 1 && (
                  <Button 
                    type="text" 
                    danger 
                    icon={<Trash2 size={16} />} 
                    onClick={() => removeTime(index)}
                  />
                )}
              </div>
            ))}
            <Button 
              type="dashed" 
              onClick={addTime} 
              className="w-full mt-2"
            >
              Add Time
            </Button>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default Schedules;