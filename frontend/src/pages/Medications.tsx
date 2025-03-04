import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Popconfirm, 
  message, 
  Spin,
  Tag,
  Switch
} from 'antd';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { 
  useMedications, 
  useRecipients,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication
} from '../hooks/useApi';
import { Medication } from '../types';

const Medications: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

  const { data: medications, isLoading: medicationsLoading } = useMedications(selectedRecipient || undefined);
  const { data: recipients, isLoading: recipientsLoading } = useRecipients();
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();
  const deleteMedication = useDeleteMedication();

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalVisible(true);
  };

  const handleEdit = (record: Medication) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      dosage: record.dosage,
      instructions: record.instructions,
      careRecipientId: record.careRecipientId,
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedication.mutateAsync(id);
      message.success('Medication deleted successfully');
    } catch (error) {
      console.error('Error deleting medication:', error);
      message.error('Failed to delete medication');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateMedication.mutateAsync({ 
        id, 
        data: { isActive: !currentStatus } 
      });
      message.success(`Medication ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling medication status:', error);
      message.error('Failed to update medication status');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingId) {
        await updateMedication.mutateAsync({ id: editingId, data: values });
        message.success('Medication updated successfully');
      } else {
        await createMedication.mutateAsync(values);
        message.success('Medication added successfully');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleRecipientFilter = (value: string) => {
    setSelectedRecipient(value);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Medication, b: Medication) => a.name.localeCompare(b.name),
    },
    {
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Instructions',
      dataIndex: 'instructions',
      key: 'instructions',
      ellipsis: true,
    },
    {
      title: 'Care Recipient',
      key: 'careRecipientName',
      render: (_: any, record: Medication) => {
        const recipient = recipients?.find(r => r.id === record.careRecipientId);
        return recipient?.firstName + ' ' + recipient?.lastName || 'Unknown';
      },
      sorter: (a: Medication, b: Medication) => {
        const recipientA = recipients?.find(r => r.id === a.careRecipientId)?.firstName + ' ' + recipients?.find(r => r.id === a.careRecipientId)?.lastName || '';
        const recipientB = recipients?.find(r => r.id === b.careRecipientId)?.firstName + ' ' + recipients?.find(r => r.id === b.careRecipientId)?.lastName || '';
        return recipientA.localeCompare(recipientB);
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        isActive 
          ? <Tag color="success">Active</Tag> 
          : <Tag color="error">Inactive</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: boolean | React.Key, record: Medication) => record.isActive === !!value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Medication) => (
        <Space>
          <Button 
            type="text" 
            icon={<Edit size={16} />} 
            onClick={() => handleEdit(record)}
          />
          <Switch 
            checked={record.isActive} 
            size="small"
            onChange={() => toggleStatus(record.id, record.isActive)}
            loading={updateMedication.isPending && 
              updateMedication.variables?.id === record.id &&
              'isActive' in (updateMedication.variables?.data || {})}
          />
          <Popconfirm
            title="Delete medication"
            description="Are you sure you want to delete this medication?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<Trash2 size={16} />} 
              loading={deleteMedication.isPending && deleteMedication.variables === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (medicationsLoading || recipientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medications</h1>
        <Space>
          <Select
            placeholder="Filter by recipient"
            style={{ width: 200 }}
            allowClear
            onChange={handleRecipientFilter}
            options={recipients?.map(recipient => ({
              value: recipient.id,
              label: recipient.firstName + ' ' + recipient.lastName,
            }))}
          />
          <Button 
            type="primary" 
            icon={<PlusCircle size={16} />} 
            onClick={handleAdd}
          >
            Add Medication
          </Button>
        </Space>
      </div>
      
      <Table<Medication> 
        dataSource={medications} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingId ? "Edit Medication" : "Add Medication"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingId ? "Update" : "Add"}
        confirmLoading={createMedication.isPending || updateMedication.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="name"
            label="Medication Name"
            rules={[{ required: true, message: 'Please enter the medication name' }]}
          >
            <Input placeholder="Enter medication name" />
          </Form.Item>
          
          <Form.Item
            name="dosage"
            label="Dosage"
            rules={[{ required: true, message: 'Please enter the dosage' }]}
          >
            <Input placeholder="e.g., 10mg, 500mg, etc." />
          </Form.Item>
          
          <Form.Item
            name="instructions"
            label="Instructions"
            rules={[{ required: true, message: 'Please enter the instructions' }]}
          >
            <Input.TextArea 
              placeholder="e.g., Take once daily with water" 
              rows={3}
            />
          </Form.Item>
          
          <Form.Item
            name="careRecipientId"
            label="Care Recipient"
            rules={[{ required: true, message: 'Please select a care recipient' }]}
          >
            <Select placeholder="Select care recipient">
              {recipients?.map(recipient => (
                <Select.Option key={recipient.id} value={recipient.id}>
                  {recipient.firstName + ' ' + recipient.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Medications;