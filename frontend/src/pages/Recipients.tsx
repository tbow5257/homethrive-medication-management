import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Spin } from 'antd';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { 
  useRecipients, 
  useCreateRecipient, 
  useUpdateRecipient, 
  useDeleteRecipient 
} from '../hooks/useApi';
import { CareRecipient } from '../types';

const Recipients: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: recipients, isLoading } = useRecipients();
  const createRecipient = useCreateRecipient();
  const updateRecipient = useUpdateRecipient();
  const deleteRecipient = useDeleteRecipient();
  
  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: CareRecipient) => {
    setEditingId(record.id || null);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      dateOfBirth: record.dateOfBirth ? record.dateOfBirth.split('T')[0] : '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await deleteRecipient.mutateAsync(id);
      message.success('Care recipient deleted successfully');
    } catch (error) {
      console.error('Error deleting recipient:', error);
      message.error('Failed to delete care recipient');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingId) {
        await updateRecipient.mutateAsync({ id: editingId, data: values });
        message.success('Care recipient updated successfully');
      } else {
        await createRecipient.mutateAsync(values);
        message.success('Care recipient added successfully');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a: CareRecipient, b: CareRecipient) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a: CareRecipient, b: CareRecipient) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (dateOfBirth: string | undefined) => dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string | undefined) => createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A',
      sorter: (a: CareRecipient, b: CareRecipient) => 
        new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CareRecipient) => (
        <Space>
          <Button 
            type="text" 
            icon={<Edit size={16} />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete care recipient"
            description="Are you sure you want to delete this care recipient?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<Trash2 size={16} />} 
              loading={deleteRecipient.isPending && deleteRecipient.variables === record.id}
            />
          </Popconfirm>
        </Space>
      ),
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
        <h1 className="text-2xl font-bold">Care Recipients</h1>
        <Button 
          type="primary" 
          icon={<PlusCircle size={16} />} 
          onClick={handleAdd}
        >
          Add Recipient
        </Button>
      </div>
      
      <Table 
        dataSource={recipients} 
        columns={columns} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingId ? "Edit Care Recipient" : "Add Care Recipient"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingId ? "Update" : "Add"}
        confirmLoading={createRecipient.isPending || updateRecipient.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter the first name' }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter the last name' }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: 'Please enter the date of birth' }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Recipients;