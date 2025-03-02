import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Pill, 
  Calendar, 
  Clock, 
  LogOut, 
  Menu as MenuIcon, 
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <Home size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/recipients',
      icon: <Users size={18} />,
      label: 'Care Recipients',
    },
    {
      key: '/medications',
      icon: <Pill size={18} />,
      label: 'Medications',
    },
    {
      key: '/schedules',
      icon: <Calendar size={18} />,
      label: 'Schedules',
    },
    {
      key: '/doses',
      icon: <Clock size={18} />,
      label: 'Doses',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <AntLayout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="bg-white shadow-md"
        width={240}
      >
        <div className="p-4 h-16 flex items-center justify-center border-b border-gray-100">
          <h1 className={`text-blue-600 font-bold ${collapsed ? 'text-xl' : 'text-xl'}`}>
            {collapsed ? 'MM' : 'MedManager'}
          </h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>
      <AntLayout>
        <Header className="bg-white p-0 px-4 flex justify-between items-center shadow-sm">
          <Button
            type="text"
            icon={<MenuIcon size={18} />}
            onClick={() => setCollapsed(!collapsed)}
            className="mr-4"
          />
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className="flex items-center cursor-pointer">
              <span className="mr-2 hidden sm:inline">{user?.name}</span>
              <Avatar className="bg-blue-500">{user?.name?.charAt(0) || 'U'}</Avatar>
            </div>
          </Dropdown>
        </Header>
        <Content className="m-6 p-6 bg-white rounded-lg shadow-sm">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;